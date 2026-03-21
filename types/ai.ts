import type Anthropic from "@anthropic-ai/sdk";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamChunk {
  type: "text" | "thinking" | "done" | "error";
  content: string;
}

export interface AIRequestOptions {
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
  thinking?: boolean;
  tools?: Anthropic.Tool[];
}
