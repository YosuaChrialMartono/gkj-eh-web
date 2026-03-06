# GKJ Eben Haezer Web

Church website for GKJ Eben Haezer built with Next.js 16 (App Router).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **UI**: React 19, TailwindCSS 4, Shadcn UI (new-york style), Radix UI primitives
- **Editor**: TipTap for rich text content
- **Theme**: Dark/light/system support via next-themes
- **Package Manager**: pnpm

## Getting Started

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

---

## Codebase Understanding

### Architecture Overview

This is a church website with the following features:

- **Content Management (CMS)** — Posts, sermons, news with TipTap rich text editor
- **Pelayan (Service Schedule)** — Manage weekly church service schedules and roles
- **Title Converter** — Convert song titles between languages
- **Authentication** — Cookie-based auth with refresh tokens

### Directory Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Auth route group (login)
├── (dashboard)/       # Protected admin routes
├── (content)/         # Public content routes
└── api/              # API routes (auth endpoints)

components/
├── ui/               # Shadcn UI primitives (don't edit manually)
├── content/          # Content CMS components
├── pelayan/          # Service schedule components
├── title-converter/  # Song title converter components
└── tiptap/           # TipTap editor

lib/
├── api/              # API client functions
├── auth/             # Auth context and utilities
├── types/            # TypeScript interfaces
├── utils.ts          # Core utilities (cn() function)
└── slug.ts           # Slug utilities
```

### Route Groups

| Group | URL Path | Purpose |
|-------|----------|---------|
| `(auth)` | `/login` | Authentication pages |
| `(dashboard)` | `/content`, `/pelayan`, etc. | Protected admin dashboard |
| `(content)` | `/news`, `/sermons`, etc. | Public content pages |

---

## Recommended Reading Flow

### Phase 1: Foundation (Start Here)

| Order | File | Purpose |
|-------|------|---------|
| 1 | `app/layout.tsx` | Root layout — providers (Theme, Auth), fonts |
| 2 | `app/globals.css` | Global styles, CSS variables (OKLCH colors) |
| 3 | `lib/utils.ts` | Core utility: `cn()` for class merging |
| 4 | `components/theme-provider.tsx` | Dark/light theme handling |
| 5 | `lib/auth/auth-context.tsx` | Client-side auth state management |

### Phase 2: Authentication System

| Order | File | Purpose |
|-------|------|---------|
| 1 | `lib/types/auth.ts` | Auth types (User, LoginInput, etc.) |
| 2 | `lib/api/auth.ts` | Auth API functions (login, register, refresh) |
| 3 | `app/api/auth/login/route.ts` | POST login endpoint |
| 4 | `app/api/auth/refresh/route.ts` | POST refresh token endpoint |
| 5 | `app/api/auth/logout/route.ts` | POST logout endpoint |
| 6 | `app/(auth)/login/page.tsx` | Login page UI |

### Phase 3: App Structure & Navigation

| Order | File | Purpose |
|-------|------|---------|
| 1 | `app/(dashboard)/layout.tsx` | Dashboard layout with sidebar |
| 2 | `components/app-sidebar.tsx` | Main sidebar with navigation |
| 3 | `components/nav-main.tsx` | Main navigation items |
| 4 | `components/nav-user.tsx` | User menu in sidebar footer |

### Phase 4: Content Management (CMS)

| Order | File | Purpose |
|-------|------|---------|
| 1 | `lib/types/content.ts` | Content types (Post, Sermon, News) |
| 2 | `lib/api/content.ts` | Content CRUD API functions |
| 3 | `components/content/content-table.tsx` | List view of content |
| 4 | `components/content/content-form.tsx` | Create/edit form with TipTap |
| 5 | `components/tiptap/editor.tsx` | TipTap rich text editor |
| 6 | `app/(dashboard)/content/page.tsx` | Content list page |
| 7 | `app/(dashboard)/content/new/page.tsx` | Create new content |
| 8 | `app/(dashboard)/content/[id]/edit/page.tsx` | Edit content |
| 9 | `app/(content)/[slug]/page.tsx` | Public content view |

### Phase 5: Pelayan (Service Schedule)

| Order | File | Purpose |
|-------|------|---------|
| 1 | `lib/types/pelayan.ts` | Pelayan types (Service, Role) |
| 2 | `lib/api/pelayan.ts` | Pelayan API functions |
| 3 | `components/pelayan/pelayan-table.tsx` | Schedule table |
| 4 | `components/pelayan/add-service-dialog.tsx` | Add service dialog |
| 5 | `components/pelayan/role-manager.tsx` | Role management |
| 6 | `app/(dashboard)/pelayan/page.tsx` | Pelayan schedule page |
| 7 | `app/(dashboard)/pelayan/roles/page.tsx` | Role management page |

### Phase 6: Title Converter Feature

| Order | File | Purpose |
|-------|------|---------|
| 1 | `lib/title-converter.ts` | Title conversion logic |
| 2 | `components/title-converter/song-card.tsx` | Song card component |
| 3 | `app/(dashboard)/title-converter/page.tsx` | Title converter page |

### Phase 7: Public Pages

| Order | File | Purpose |
|-------|------|---------|
| 1 | `app/(content)/layout.tsx` | Public layout |
| 2 | `app/(content)/page.tsx` | Home page |
| 3 | `app/(content)/news/page.tsx` | News listing |
| 4 | `app/(content)/sermons/page.tsx` | Sermons listing |

---

## Key Patterns

1. **Route Groups**: `(auth)`, `(dashboard)`, `(content)` — parentheses indicate route groups without affecting URL
2. **API Layer**: `lib/api/` contains both client and server API functions
3. **Types**: `lib/types/` centralizes all TypeScript interfaces
4. **Client Components**: Use `"use client"` directive for interactive components
5. **CVA Pattern**: Components use `class-variance-authority` for variant styling
6. **Conditional Classes**: Use `cn()` from `lib/utils.ts` for conditional class merging

---

## Component Conventions

- Shadcn components in `components/ui/` — managed via CLI, don't edit manually
- Feature components in `components/<feature>/`
- Use `cn()` for conditional Tailwind classes
- Component variants defined with CVA
- Mobile breakpoint: 768px (see `hooks/use-mobile.ts`)
