# GKJ EH Web — Claude Code Project Context

## Project Overview
GKJ EH Web is an AI-powered Next.js application that integrates Anthropic's Claude models.
It exposes a streaming chat interface and an agentic loop runner backed by the Anthropic SDK.

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5 (strict mode)
- **AI**: @anthropic-ai/sdk — Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5
- **State**: Zustand 5
- **Validation**: Zod 4
- **Package manager**: pnpm

## Architecture
```
User Input
  └─► components/ai/PromptInput
        └─► hooks/use-chat.ts          (manages session, calls fetch)
              └─► POST /api/ai/chat    (SSE streaming route)
                    └─► Anthropic SDK  (claude-opus-4-6, adaptive thinking)
                          └─► SSE chunks back to client
                                └─► stores/chat-store.ts (Zustand updates)
                                      └─► components/ai/ChatWindow re-renders
```

Agent loop (non-streaming):
```
POST /api/ai/agents  →  Anthropic SDK  →  tool_use loop  →  JSON response
```

## Folder Structure
```
app/
  (dashboard)/          Route group — shared layout (Header + Sidebar)
    chat/page.tsx       Streaming chat page
    agents/page.tsx     Agentic loop runner page
  api/ai/
    chat/route.ts       SSE streaming endpoint
    agents/route.ts     Agentic tool-loop endpoint
components/
  ai/                   AI-specific UI (ChatWindow, MessageBubble, PromptInput, ModelSelector)
  ui/                   Primitives (Button, Input)
  layout/               Shell (Header, Sidebar)
hooks/
  use-chat.ts           Streaming chat orchestration
  use-ai-stream.ts      Generic SSE utility
lib/
  ai/
    client.ts           Singleton Anthropic client (server-side only)
    prompts.ts          System prompt presets
    tools.ts            Tool definitions (Anthropic.Tool[])
  utils.ts              cn(), generateId(), formatTimestamp(), truncate()
  constants.ts          DEFAULT_MODEL, MODELS, APP_NAME, NAV_ITEMS
stores/
  chat-store.ts         Zustand: sessions, messages, CRUD
types/
  ai.ts                 ChatMessage, Agent, ChatSession, StreamChunk, AIRequestOptions
```

## Key Files
| File | Role |
|---|---|
| `lib/ai/client.ts` | Singleton `Anthropic` client — import only in server routes |
| `lib/ai/prompts.ts` | `SYSTEM_PROMPTS` object — add new personas here |
| `lib/ai/tools.ts` | `ALL_TOOLS` array + `getToolsByName()` — add new tools here |
| `lib/constants.ts` | `DEFAULT_MODEL`, `MODELS` list — update model options here |
| `stores/chat-store.ts` | All chat session state — extend for new session features |
| `app/api/ai/chat/route.ts` | Streaming SSE — the core AI endpoint |
| `app/api/ai/agents/route.ts` | Tool-use agentic loop |

## Commands
```bash
pnpm dev      # Start development server (http://localhost:3000)
pnpm build    # Production build — run this to verify TypeScript
pnpm lint     # ESLint
pnpm tsc --noEmit  # Type-check without emitting files
```

## Coding Conventions
- **TypeScript**: strict mode on; use SDK types (`Anthropic.MessageParam`, `Anthropic.Tool`, etc.) — don't redefine them
- **Components**: functional, named exports (not default); `forwardRef` for primitives
- **Files**: kebab-case (`chat-window.tsx`); components PascalCase inside the file
- **Constants**: `UPPER_SNAKE_CASE`; database fields: `snake_case`
- **CSS**: Tailwind utility classes; use `cn()` from `lib/utils.ts` for conditional classes
- **Comments**: encouraged where logic isn't immediately obvious — especially in AI/streaming code
- **Imports**: SDK types first, then project imports using `@/` alias

## AI Conventions
- **Default model**: `claude-opus-4-6` for complex/reasoning tasks
- **Acceptable alternative**: `claude-sonnet-4-6` for speed/cost tradeoffs (e.g. simple tasks, high-volume)
- **Thinking**: always use `thinking: { type: "adaptive" }` — never use `budget_tokens` (deprecated on Opus 4.6 / Sonnet 4.6)
- **Streaming**: use `.stream()` + SSE for any response that may be long; use `.create()` only for short structured outputs
- **Error handling**: use typed SDK exceptions (`Anthropic.RateLimitError`, `Anthropic.APIError`) — never string-match error messages
- **Client**: `getAnthropicClient()` is server-only — never import in client components

## Important Rules
- Do **not** import Google Fonts (`next/font/google`) — network is not available in this environment; use system fonts via Tailwind
- Do **not** hardcode API keys — always use `process.env.ANTHROPIC_API_KEY`
- Do **not** use `src/` directory — project uses flat App Router layout
- Do **not** use `output_format` (deprecated) — use `output_config: { format: {...} }`
- `lib/ai/client.ts` is server-side only — keep it out of client components and hooks
