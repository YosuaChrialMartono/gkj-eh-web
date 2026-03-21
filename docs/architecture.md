# Architecture

## Data Flow

### Streaming Chat

```
User types in PromptInput (components/ai/prompt-input.tsx)
  │
  ▼
useChat hook (hooks/use-chat.ts)
  ├─ addMessage(session, { role: "user", content })     ← Zustand
  ├─ addMessage(session, { role: "assistant", isStreaming: true })
  │
  ▼
fetch POST /api/ai/chat  (app/api/ai/chat/route.ts)
  ├─ Builds Anthropic.MessageParam[] from body
  ├─ Calls client.messages.stream({ model, messages, thinking: adaptive })
  │
  ▼
Anthropic SDK  →  Claude API (SSE)
  │
  ▼
ReadableStream  →  SSE chunks  →  data: {"type":"text","content":"..."}\n\n
                                  data: {"type":"thinking","content":"..."}\n\n
                                  data: [DONE]\n\n
  │
  ▼
useChat hook reads SSE chunks
  ├─ updateMessage(session, assistantId, { content: accumulated })
  └─ updateMessage(session, assistantId, { thinking: thinkingAccumulated })
  │
  ▼
chat-store.ts (stores/chat-store.ts)  →  Zustand state update
  │
  ▼
ChatWindow re-renders (components/ai/chat-window.tsx)
  └─ MessageBubble per message (components/ai/message-bubble.tsx)
```

### Agentic Loop

```
User submits task in agents/page.tsx
  │
  ▼
fetch POST /api/ai/agents  (app/api/ai/agents/route.ts)
  ├─ Builds messages[] and tools[] from body
  │
  ▼
Anthropic SDK  →  client.messages.create({ model, messages, tools, thinking: adaptive })
  │
  ├─ stop_reason === "tool_use"  →  execute tools  →  append tool_results  →  loop
  └─ stop_reason === "end_turn"  →  return JSON { content, thinking, toolCalls, usage }
  │
  ▼
agents/page.tsx renders result + tool call trace
```

## Session Management (Zustand)

```
chat-store.ts
  sessions: ChatSession[]        ← all sessions in memory (not persisted to DB yet)
  activeSessionId: string | null

  createSession()  →  generates UUID, pushes to sessions[], sets activeSessionId
  addMessage()     →  appends ChatMessage to session.messages[]
  updateMessage()  →  patches a message by ID (used during streaming)
  deleteSession()  →  removes session, shifts activeSessionId to next
```

## Component Tree

```
app/(dashboard)/layout.tsx
  ├─ Header (components/layout/header.tsx)
  └─ Sidebar (components/layout/sidebar.tsx)
       └─ session list from useChatStore()

app/(dashboard)/chat/page.tsx
  └─ ChatWindow (components/ai/chat-window.tsx)
       ├─ MessageBubble[] (components/ai/message-bubble.tsx)
       └─ PromptInput (components/ai/prompt-input.tsx)

app/(dashboard)/agents/page.tsx
  ├─ ModelSelector (components/ai/model-selector.tsx)
  ├─ Tool toggles (inline)
  └─ PromptInput (components/ai/prompt-input.tsx)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key — server-side only |

Set in `.env.local` (gitignored). See `.env.local.example` for template.
