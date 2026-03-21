---
name: building-api-routes
description: Use this skill when building, editing, or extending Next.js API routes in this project. Applies when the user asks to add a new API endpoint, modify an existing route in app/api/, implement streaming responses, add tool use to a route, or handle Anthropic SDK calls server-side. USE WHEN: "add an API route", "create an endpoint", "make the server call Claude", "add streaming to", "build a route that uses tools".
allowed-tools: [Read, Edit, Write, Bash, Grep, Glob]
---

# Building API Routes

This project's API routes live in `app/api/` and follow the Next.js App Router route handler pattern.

## File Location Convention

```
app/api/<feature>/route.ts
```

Always export named `GET` and/or `POST` functions — never a default export.

## Standard Route Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/ai/client";

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Validate required fields
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 2. Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = getAnthropicClient();

  // 3. Build messages array
  const messages: Anthropic.MessageParam[] = [
    ...(body.history ?? []),
    { role: "user", content: body.message },
  ];

  // 4. Call Claude — use streaming or .create() depending on response length
}
```

## Streaming SSE Responses

Use SSE for any response that may be long. SSE prevents HTTP timeouts on large outputs.

```typescript
const encoder = new TextEncoder();

const stream = new ReadableStream({
  async start(controller) {
    // Helper to send a chunk
    const send = (chunk: object) =>
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

    try {
      const apiStream = client.messages.stream({
        model: "claude-opus-4-6",           // or "claude-sonnet-4-6" for speed
        max_tokens: 64000,                  // use 64K for streaming
        system: systemPrompt,
        messages,
        thinking: { type: "adaptive" },    // always adaptive on Opus/Sonnet 4.6
      });

      for await (const event of apiStream) {
        if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            send({ type: "text", content: event.delta.text });
          } else if (event.delta.type === "thinking_delta") {
            send({ type: "thinking", content: event.delta.thinking });
          }
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    } catch (err) {
      const message =
        err instanceof Anthropic.APIError
          ? `API error ${err.status}: ${err.message}`
          : "Unexpected error";
      send({ type: "error", content: message });
    } finally {
      controller.close();
    }
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

## Agentic Tool-Use Loop

Use `.create()` (not `.stream()`) for tool-use loops, then return JSON when done.

```typescript
let response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 16000,
  system: systemPrompt,
  messages,
  tools,
  thinking: { type: "adaptive" },
});

// Loop until end_turn
while (response.stop_reason === "tool_use") {
  const toolUseBlocks = response.content.filter(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
  );

  messages.push({ role: "assistant", content: response.content });

  const toolResults: Anthropic.ToolResultBlockParam[] = [];
  for (const block of toolUseBlocks) {
    const result = await executeToolByName(block.name, block.input);
    toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
  }

  messages.push({ role: "user", content: toolResults });

  response = await client.messages.create({ model, max_tokens, system, messages, tools, thinking: { type: "adaptive" } });
}

// Extract final text and thinking
const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
const thinkingBlock = response.content.find((b): b is Anthropic.ThinkingBlock => b.type === "thinking");

return NextResponse.json({ content: textBlock?.text ?? "", thinking: thinkingBlock?.thinking });
```

## Model Selection

| Scenario | Model |
|---|---|
| Complex reasoning, long outputs | `claude-opus-4-6` (default) |
| Simple tasks, high volume, cost-sensitive | `claude-sonnet-4-6` |
| Very simple, latency-critical | `claude-haiku-4-5` |

## Error Handling

```typescript
try {
  // ...
} catch (err) {
  if (err instanceof Anthropic.RateLimitError) {
    return NextResponse.json({ error: "Rate limited — try again shortly" }, { status: 429 });
  } else if (err instanceof Anthropic.AuthenticationError) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  } else if (err instanceof Anthropic.APIError) {
    return NextResponse.json({ error: `Claude error: ${err.message}` }, { status: err.status });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

## What NOT to Do

- ❌ Don't import `getAnthropicClient()` in client components — server-side only
- ❌ Don't use `budget_tokens` — deprecated on Opus 4.6 / Sonnet 4.6
- ❌ Don't use `output_format` — use `output_config: { format: {...} }`
- ❌ Don't string-match error messages — use typed SDK exceptions
- ❌ Don't use `max_tokens: 128000` without streaming — it will timeout

## Key Files
- `lib/ai/client.ts` — Anthropic singleton
- `lib/ai/prompts.ts` — system prompt presets
- `lib/ai/tools.ts` — tool definitions + `getToolsByName()`
- `lib/constants.ts` — `DEFAULT_MODEL`, `STREAMING_MAX_TOKENS`
- `app/api/ai/chat/route.ts` — reference streaming implementation
- `app/api/ai/agents/route.ts` — reference tool-loop implementation
