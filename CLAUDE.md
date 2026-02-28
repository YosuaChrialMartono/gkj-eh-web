# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

Next.js 16 app (App Router) for GKJ Eben Haezer church. Uses React 19, TypeScript (strict), TailwindCSS 4, and Shadcn UI (new-york style) with Radix UI primitives.

**Routing**: App Router with file-based routes in `app/`. Root layout provides ThemeProvider (next-themes) and SidebarProvider wrapping all pages.

**Components**:
- `components/ui/` — Shadcn UI primitives (do not edit manually; managed via Shadcn CLI)
- `components/` — App-level layout components (sidebar, nav) and feature-specific folders (e.g., `components/title-converter/`)
- Feature components use `"use client"` directive when interactive

**Styling**: Tailwind utility classes + CSS variables in `app/globals.css` using OKLCH color space. Component variants use CVA (class-variance-authority). Use `cn()` from `lib/utils.ts` for conditional class merging.

**Path alias**: `@/*` maps to the project root.

## Conventions

- Package manager is **pnpm** (not npm/yarn)
- Shadcn config in `components.json` — add new UI components via `pnpm dlx shadcn@latest add <component>`
- Mobile breakpoint: 768px (see `hooks/use-mobile.ts`)
- Dark/light/system theme support via next-themes with `.dark` class strategy
