# CLAUDE.md

Guidance for Claude Code working in this repo.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Stack

Next.js 16.1 (App Router) for GKJ Eben Haezer church. React 19.2, TypeScript (strict), TailwindCSS 4, Shadcn UI (new-york style) on Radix primitives. Forms via `react-hook-form` + `zod`. Rich text via Tiptap 3. Charts via Recharts. Toasts via Sonner. ZIP export via JSZip.

## Routing (App Router, route groups)

`app/` uses three route groups, each with its own layout:

- `(auth)/` — `login`, `register`. Public auth pages.
- `(content)/` — public site: home (`/`), `news`, `sermons`, dynamic `[slug]` article pages. Layout = top-nav header + footer.
- `(dashboard)/` — gated CMS: `dashboard`, `content` (+ `content/new`), `laporan` (+ `[id]`, `new`), `pelayan` (+ `roles`), `statistik`, `title-converter`. Layout = `SidebarProvider` + `AppSidebar` + breadcrumb + color-mode toggle. Server-side gate: redirects to `/login` if `refresh_token` cookie missing.

Root `app/layout.tsx` wraps everything in `ThemeProvider` (next-themes) + `AuthProvider` + `<Toaster />`. **`SidebarProvider` lives in `(dashboard)/layout.tsx` only**, not the root.

## Auth

- Client state: `lib/auth/auth-context.tsx` — `AuthProvider` exposes `useAuth()` with `user`, `accessToken`, `login`, `register`, `logout`, `refreshAuth`. Calls BFF routes under `/api/auth/*`.
- BFF routes: `app/api/auth/{login,logout,refresh,register}/route.ts`. Refresh token kept as httpOnly cookie; access token stays in memory.
- Server-side gate: `(dashboard)/layout.tsx` reads `refresh_token` cookie via `next/headers`.
- `lib/auth/server-utils.ts` — server-side token helpers (currently stub).

## API layer

`lib/api/`:
- `client.ts` — `apiClient<T>` + `authenticatedApiClient<T>(token, ...)`. Reads `process.env.API_URL`, throws if unset. Returns parsed JSON or `ApiError` (`{ message, status, errors? }`).
- Domain modules: `auth.ts`, `content.ts`, `pelayan.ts`, `reports.ts`. Re-exported from `lib/api/index.ts`.
- `mock-store.ts` — in-memory mock store (dev/preview).
- App's own API routes (BFF): `app/api/{auth,members,reports}/...`.

`hooks/use-api.ts` — client-side fetch hook.

## Components

- `components/ui/` — Shadcn primitives. **Do not edit manually**; manage via `pnpm dlx shadcn@latest add <component>`.
- `components/forms/service-report/` — KG/form/03/01 church service report (Tabs: info, kehadiran, persembahan, petugas, evaluasi). Schema in `lib/schemas/service-report.ts`, defaults in `lib/form-defaults.ts`.
- `components/content/` — content CMS (table, filters, form, delete dialog).
- `components/pelayan/` — service rota (table, month picker, role manager, dialogs).
- `components/statistik/` — Recharts attendance + offering charts.
- `components/tiptap/editor.tsx` — Tiptap editor with link/image/placeholder/resize-image extensions.
- `components/title-converter/` — song title converter (uses `lib/title-converter.ts` + `lib/xml-encoding.ts`, JSZip export).
- App layout: `app-sidebar.tsx`, `nav-*.tsx`, `dashboard-breadcrumb.tsx`, `theme-provider.tsx`, `color-mode-toggle.tsx`.

Interactive components use `"use client"`.

## Types & schemas

- `lib/types/` — `auth.ts`, `content.ts`, `pelayan.ts`, barrel `index.ts`. Includes `ApiError`, `User`.
- `lib/schemas/service-report.ts` — Zod schema for service report form.
- `types/index.ts` — shared app types.

## Styling

Tailwind utilities + CSS variables in `app/globals.css` (OKLCH). Variants via CVA. Use `cn()` from `lib/utils.ts` for conditional classes. Dark/light/system via next-themes (`.dark` class strategy). Mobile breakpoint 768px (`hooks/use-mobile.ts`).

## Conventions

- Package manager: **pnpm** (not npm/yarn).
- Path alias: `@/*` → project root. Shadcn aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- Shadcn config: `components.json` (style: new-york, baseColor: neutral, icon library: lucide).
- Env: `API_URL` required for upstream API calls.
- `docs/` holds plans and notes (auth, CMS, Tiptap, todos) — consult before large feature work.
