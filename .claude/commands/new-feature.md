# /new-feature

Scaffold a new feature following project conventions.

## Usage

`/new-feature $ARGUMENTS`

Where `$ARGUMENTS` is a short description, e.g. `document-upload` or `agent-history-page`.

## Steps

Given the feature name in `$ARGUMENTS`:

1. **Clarify scope** — ask one question if the feature type is ambiguous:
   - Is this a new **page** (needs a route in `app/(dashboard)/`)?
   - Does it need a new **API route** (in `app/api/`)?
   - Does it need new **shared components** (in `components/`)?
   - Does it need new **types** (in `types/`)?

2. **Create TypeScript types** in `types/ai.ts` (or a new file if unrelated to AI):
   - Follow `PascalCase` naming
   - Export from `types/index.ts`

3. **Create the API route** (if needed) at `app/api/<feature>/route.ts`:
   - Add `GET` health check and `POST` handler
   - Use `getAnthropicClient()` from `lib/ai/client.ts` for AI calls
   - Use `thinking: { type: "adaptive" }` if calling Claude
   - Stream with SSE if the response may be long
   - Handle errors with Anthropic typed exceptions

4. **Create components** in the appropriate directory:
   - `components/ai/` — AI-specific UI
   - `components/ui/` — generic primitives
   - `components/layout/` — structural shell
   - Use `cn()` from `lib/utils.ts` for class merging
   - Export as named exports

5. **Create or update a hook** in `hooks/` if the feature needs client-side state or fetch logic.

6. **Create the page** at `app/(dashboard)/<feature>/page.tsx`:
   - Add `"use client"` if it needs state or browser APIs
   - Wire up the hook and components

7. **Update `lib/constants.ts`** if the feature needs new constants.

8. **Update `components/layout/sidebar.tsx`** `NAV` array if the page needs navigation.

9. **Run `pnpm build`** to confirm no TypeScript errors before finishing.

## Conventions Reminder
- kebab-case file names, PascalCase component names
- Named exports only
- Comments where logic isn't obvious
- `claude-opus-4-6` default, `claude-sonnet-4-6` acceptable
- Never import `lib/ai/client.ts` in client components
