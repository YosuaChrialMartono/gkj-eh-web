import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/ai/client";
import { getToolsByName } from "@/lib/ai/tools";
import { DEFAULT_MAX_TOKENS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    message,
    systemPrompt,
    tools: toolNames = [],
    model = "claude-opus-4-6",
    history = [],
  } = body as {
    message: string;
    systemPrompt?: string;
    tools?: string[];
    model?: string;
    history?: Anthropic.MessageParam[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = getAnthropicClient();
  const tools = getToolsByName(toolNames);

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: message },
  ];

  // Agentic loop — run until end_turn or no more tool calls
  let response = await client.messages.create({
    model,
    max_tokens: DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages,
    tools: tools.length > 0 ? tools : undefined,
    thinking: { type: "adaptive" },
  });

  // Collect all tool calls and results for the response
  const toolCalls: Array<{ name: string; input: unknown; result: string }> = [];

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      // Tool execution stub — replace with real implementations per tool
      const result = `[Tool "${block.name}" executed with input: ${JSON.stringify(block.input)}]`;
      toolCalls.push({ name: block.name, input: block.input, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      thinking: { type: "adaptive" },
    });
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  const thinkingBlock = response.content.find(
    (b): b is Anthropic.ThinkingBlock => b.type === "thinking"
  );

  return NextResponse.json({
    content: textBlock?.text ?? "",
    thinking: thinkingBlock?.thinking,
    toolCalls,
    usage: response.usage,
  });
}
