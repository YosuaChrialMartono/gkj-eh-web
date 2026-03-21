import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { STREAMING_MAX_TOKENS } from "@/lib/constants";
import { useChatStore } from "@/stores/chat-store";

// GET /api/ai/chat  — health check
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    message,
    history = [],
    model = "claude-opus-4-6",
    systemPrompt,
    thinking = true,
  } = body as {
    sessionId?: string;
    message: string;
    history?: Anthropic.MessageParam[];
    model?: string;
    systemPrompt?: string;
    thinking?: boolean;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = getAnthropicClient();

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      try {
        const apiStream = client.messages.stream({
          model,
          max_tokens: STREAMING_MAX_TOKENS,
          system: systemPrompt ?? SYSTEM_PROMPTS.default,
          messages,
          ...(thinking ? { thinking: { type: "adaptive" } } : {}),
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
}
