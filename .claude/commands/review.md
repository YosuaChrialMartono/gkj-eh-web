# /review

Review changed files for code quality, correctness, and adherence to project conventions.

## Steps

1. Run `git diff HEAD` to get all unstaged + staged changes.
2. Run `pnpm tsc --noEmit` to check for TypeScript errors.
3. Run `pnpm lint` to check for ESLint issues.
4. For each changed file, review:

### Code Quality Checklist
- [ ] No TypeScript errors or `any` casts without justification
- [ ] SDK types used correctly (`Anthropic.MessageParam`, `Anthropic.Tool`, etc.) — not redefined
- [ ] `cn()` used for conditional Tailwind classes (not string concatenation)
- [ ] Named exports used (not default exports) for components
- [ ] `forwardRef` used for any new primitive UI components

### AI / API Conventions
- [ ] `thinking: { type: "adaptive" }` used (not `budget_tokens`)
- [ ] Server-only code (`lib/ai/client.ts`) not imported in client components
- [ ] Streaming endpoints return proper SSE format (`data: {...}\n\n`, `data: [DONE]\n\n`)
- [ ] Anthropic typed exceptions used in catch blocks (not string matching)
- [ ] `output_config: { format: {...} }` used (not deprecated `output_format`)

### Comments
- [ ] Non-obvious logic is commented — especially streaming code, tool-use loops, Zustand reducers
- [ ] No comments that just restate what the code says

### Security
- [ ] No hardcoded API keys or secrets
- [ ] Environment variables accessed via `process.env.*`

## Output

Report findings as a checklist. For each issue found, include:
- File path and line number
- What the issue is
- Suggested fix

## Arguments

Optional: `$ARGUMENTS` — if a file path is provided, limit the review to that file only.
