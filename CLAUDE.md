# GKJ EH Web — Claude Code Project Context

## Project Overview
GKJ EH Web is a Next.js dashboard application (App Router). It is a clean shell ready for new features — AI application code has been intentionally removed. The project retains the full Claude Code development infrastructure: skills, commands, hooks, and docs.

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5 (strict mode)
- **Validation**: Zod 4
- **Package manager**: pnpm

## Architecture
```
Browser
  └─► app/(dashboard)/layout.tsx   (shared Header + Sidebar shell)
        └─► app/(dashboard)/page.tsx  (dashboard home)
```

## Folder Structure
```
app/
  (dashboard)/          Route group — shared layout (Header + Sidebar)
    page.tsx            Dashboard home
    layout.tsx          Shell layout
components/
  ui/                   Primitives (Button, Input)
  layout/               Shell (Header, Sidebar)
lib/
  utils.ts              cn(), generateId(), formatTimestamp(), truncate()
  constants.ts          APP_NAME, APP_DESCRIPTION, NAV_ITEMS
types/
  index.ts              Shared project types (add here as needed)
```

## Key Files
| File | Role |
|---|---|
| `lib/constants.ts` | `APP_NAME`, `NAV_ITEMS` — update nav and app metadata here |
| `lib/utils.ts` | `cn()`, `generateId()`, `truncate()` — general utilities |
| `components/layout/sidebar.tsx` | Sidebar nav — driven by `NAV_ITEMS` |
| `components/layout/header.tsx` | Top header bar |

## Commands
```bash
pnpm dev      # Start development server (http://localhost:3000)
pnpm build    # Production build — run this to verify TypeScript
pnpm lint     # ESLint
pnpm tsc --noEmit  # Type-check without emitting files
```

## Coding Conventions
- **TypeScript**: strict mode on; avoid redefining external types
- **Components**: functional, named exports (not default); `forwardRef` for primitives
- **Files**: kebab-case (`my-component.tsx`); components PascalCase inside the file
- **Constants**: `UPPER_SNAKE_CASE`; database fields: `snake_case`
- **CSS**: Tailwind utility classes; use `cn()` from `lib/utils.ts` for conditional classes
- **Comments**: encouraged where logic isn't immediately obvious
- **Imports**: third-party first, then project imports using `@/` alias

## AI Conventions (for when AI features are added)
- **Default model**: `claude-opus-4-6` for complex/reasoning tasks
- **Acceptable alternative**: `claude-sonnet-4-6` for speed/cost tradeoffs
- **Thinking**: always use `thinking: { type: "adaptive" }` — never use `budget_tokens` (deprecated)
- **Streaming**: use `.stream()` + SSE for any response that may be long; use `.create()` only for short structured outputs
- **Error handling**: use typed SDK exceptions (`Anthropic.RateLimitError`, `Anthropic.APIError`) — never string-match error messages
- **Client**: Anthropic client is server-only — never import in client components or hooks

## Important Rules
- Do **not** import Google Fonts (`next/font/google`) — network is not available in this environment; use system fonts via Tailwind
- Do **not** hardcode API keys — always use environment variables
- Do **not** use `src/` directory — project uses flat App Router layout
