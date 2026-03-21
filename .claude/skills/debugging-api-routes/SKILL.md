---
name: debugging-api-routes
description: Use this skill when diagnosing or fixing issues with Next.js API routes in this project, especially those involving the Anthropic SDK, streaming SSE responses, or tool-use loops. USE WHEN: "the API route is broken", "streaming isn't working", "getting a 500 error", "Claude isn't responding", "tool calls aren't being executed", "SSE is not streaming", "fix this route", "debug the endpoint".
allowed-tools: [Read, Edit, Bash, Grep, Glob]
---

# Debugging API Routes

## Step 1 — Identify the Route

```bash
# Find all route files
find app/api -name "route.ts"
```

Read the failing route entirely before making any changes.

## Step 2 — Check Common Issues

### Missing or invalid API key
```typescript
// The route should guard this early
if (!process.env.ANTHROPIC_API_KEY) {
  return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
}
```
**Fix**: ensure `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...` and the dev server was restarted after adding it.

### Wrong model ID
```typescript
// ✅ Valid model IDs for this project
"claude-opus-4-6"
"claude-sonnet-4-6"
"claude-haiku-4-5"

// ❌ Invalid — date suffixes not needed for these models
"claude-opus-4-6-20251101"
```
A wrong model ID returns a 404 from the Anthropic API.

### Deprecated `budget_tokens`
```typescript
// ❌ budget_tokens is deprecated on Opus 4.6 / Sonnet 4.6
thinking: { type: "enabled", budget_tokens: 10000 }

// ✅ Use adaptive instead
thinking: { type: "adaptive" }
```

### `max_tokens` too low for streaming
If responses are truncated, `stop_reason` will be `"max_tokens"`.
- Streaming routes: use `max_tokens: 64000`
- Non-streaming routes: use `max_tokens: 16000`
- Never use `max_tokens: 128000` without streaming — it causes HTTP timeouts

### Tool-use loop not advancing
```typescript
// ❌ Wrong — only checking for end_turn, missing tool_use
if (response.stop_reason !== "end_turn") break;

// ✅ Correct — loop while there are tool calls
while (response.stop_reason === "tool_use") { ... }
```

### Missing `tool_use_id` in tool results
```typescript
// ❌ Wrong
toolResults.push({ type: "tool_result", content: result });

// ✅ Correct — must match the block's id
toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
```

### SSE not streaming to client
Check that the response headers are correct:
```typescript
return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",  // ← must be this exact value
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```
Also check that the client is reading SSE correctly — each chunk must be prefixed `data: ` and end with `\n\n`.

### Content block type narrowing errors
```typescript
// ❌ TypeScript error — content[0].text doesn't exist without narrowing
const text = response.content[0].text;

// ✅ Narrow first
const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
const text = textBlock?.text ?? "";
```

## Step 3 — Read Anthropic Error Responses

```typescript
// Add this catch block to get detailed error info during debugging
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.error("Anthropic error:", {
      status: err.status,
      message: err.message,
      error: err.error,  // raw error body from Anthropic
    });
  }
  throw err;
}
```

## Step 4 — Common HTTP Status Codes

| Status | Meaning | Fix |
|---|---|---|
| 400 | Bad request — invalid params, wrong message structure | Check `messages` array alternates user/assistant, check `max_tokens` |
| 401 | Invalid API key | Check `ANTHROPIC_API_KEY` env var |
| 403 | Permission denied | API key lacks access to the model |
| 404 | Model not found | Check model ID — no date suffixes needed |
| 429 | Rate limited | Add retry logic or reduce request rate |
| 500 | Anthropic server error | Retry with backoff |

## Step 5 — Run TypeScript Check

After fixing, always verify no TypeScript regressions:
```bash
pnpm tsc --noEmit
```

## Key Files
- `lib/ai/client.ts` — Anthropic singleton (check it's not imported client-side)
- `app/api/ai/chat/route.ts` — reference streaming implementation
- `app/api/ai/agents/route.ts` — reference tool-loop implementation
- `lib/constants.ts` — `STREAMING_MAX_TOKENS`, `DEFAULT_MAX_TOKENS`
