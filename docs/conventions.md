# Conventions

## File & Directory Naming

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `chat-window.tsx`, `use-chat.ts` |
| Directories | kebab-case | `components/ai/`, `lib/ai/` |
| React components | PascalCase inside file | `export function ChatWindow()` |
| Hooks | camelCase, `use` prefix | `useChat`, `useAIStream` |
| Stores | camelCase, `use` prefix | `useChatStore` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_MODEL`, `APP_NAME` |
| Types/Interfaces | PascalCase | `ChatMessage`, `AIRequestOptions` |
| Database columns | snake_case | `created_at`, `session_id` |

## Import Order

```typescript
// 1. External packages
import Anthropic from "@anthropic-ai/sdk";
import { useState } from "react";

// 2. Project imports (@ alias, most specific last)
import { getAnthropicClient } from "@/lib/ai/client";
import { DEFAULT_MODEL } from "@/lib/constants";
import type { ChatMessage } from "@/types/ai";
```

## TypeScript Patterns

### Use SDK types — don't redefine them
```typescript
// ✅ Correct
const messages: Anthropic.MessageParam[] = [];

// ❌ Wrong — never redefine what the SDK exports
interface MyMessage { role: string; content: string }
```

### Narrow content blocks before accessing .text
```typescript
for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text); // safe
  }
}
```

### Type-guard tool_use blocks
```typescript
const toolBlocks = response.content.filter(
  (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
);
```

## React Component Patterns

### Named exports (not default)
```typescript
// ✅ Correct
export function Button({ ... }: ButtonProps) { ... }

// ❌ Avoid
export default function Button() { ... }
```

### cn() for conditional classes
```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

### Dark mode via Tailwind
```typescript
// Always pair light + dark variants
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50" />
```

### forwardRef for UI primitives
```typescript
const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("...", className)} {...props} />
));
Input.displayName = "Input";
```

## AI / API Route Patterns

### Streaming SSE response
```typescript
const encoder = new TextEncoder();
const stream = new ReadableStream({
  async start(controller) {
    const send = (chunk: object) =>
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

    // ... stream from Anthropic SDK ...

    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
  },
});
return new Response(stream, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

### Adaptive thinking (always)
```typescript
// ✅ Opus 4.6 / Sonnet 4.6 — use adaptive
thinking: { type: "adaptive" }

// ❌ Never use budget_tokens on these models
thinking: { type: "enabled", budget_tokens: 10000 } // deprecated
```

### Error handling in routes
```typescript
import Anthropic from "@anthropic-ai/sdk";

try {
  // ...
} catch (err) {
  if (err instanceof Anthropic.RateLimitError) { /* 429 */ }
  else if (err instanceof Anthropic.APIError) { /* other */ }
}
```

### Tool definitions
```typescript
// All tool input_schemas need `type: "object" as const`
const myTool: Anthropic.Tool = {
  name: "my_tool",
  description: "...",
  input_schema: {
    type: "object" as const,   // ← required for TypeScript
    properties: { ... },
    required: [...],
  },
};
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add model selector to agents page
fix: handle empty SSE chunks in useChat
docs: update architecture diagram
refactor: extract tool execution into lib/ai/executor.ts
chore: update @anthropic-ai/sdk to 0.81.0
```

## Comments

- Add comments where the logic isn't immediately obvious
- Especially valuable in streaming/SSE code, Zustand reducers, and Anthropic tool-use loops
- Avoid restating what the code already says clearly

```typescript
// ✅ Useful comment — explains the "why"
// Append full content (not just text) so compaction blocks are preserved on next request
messages.push({ role: "assistant", content: response.content });

// ❌ Useless comment — restates the obvious
// Set the model to claude-opus-4-6
const model = "claude-opus-4-6";
```
