# CMS Implementation Plan for GKJ Eben Haezer Web

## Context

The app is a Next.js 16 site for GKJ Eben Haezer church. Currently all pages share a single sidebar layout defined in `app/layout.tsx`. The goal is to add a CMS that:
- Separates **dashboard** (admin, sidebar layout) from **public content** (header/footer layout)
- Adds a content creation/editing tool to the dashboard alongside existing tools (title-converter)
- Defines a typed API contract for a separate backend (not built here)
- Integrates authentication (username/password + Google OAuth) with authorization

---

## Phase 1: Types, Environment, and API Layer

No UI changes. Establishes data contracts and service layer.

### 1.1 Environment config
- **New**: `.env.local`, `.env.example` with `API_URL=http://localhost:8080/api` (server-only, no `NEXT_PUBLIC_` prefix)

### 1.2 TypeScript interfaces
- **New**: `lib/types/content.ts` — `Content`, `ContentListItem`, `ContentCreateInput`, `ContentUpdateInput`, `ContentListParams`, `PaginatedResponse<T>`, enums for `ContentType` (article, page, sermon, announcement) and `ContentStatus` (draft, published, archived)
- **New**: `lib/types/auth.ts` — `User`, `UserRole` (admin, viewer), `LoginInput`, `RegisterInput`, `AuthResponse`, `GoogleAuthInput`
- **New**: `lib/types/index.ts` — re-exports + `ApiError` interface

### 1.3 API service layer (server-side fetch wrappers)
- **New**: `lib/api/client.ts` — `apiClient<T>()` and `authenticatedApiClient<T>()` (adds Bearer token header). Builds URL from `process.env.API_URL`, handles query params, error parsing, 204 responses
- **New**: `lib/api/content.ts` — typed functions: `getContentList`, `getContentById`, `getContentBySlug` (public, no auth), `createContent`, `updateContent`, `deleteContent`, `getPublicContentList`
- **New**: `lib/api/auth.ts` — `login`, `register`, `googleAuth`, `refreshToken`, `logout`
- **New**: `lib/api/index.ts` — re-exports

### 1.4 Slug utility
- **New**: `lib/slug.ts` — `generateSlug(title)` for auto-generating URL slugs from titles

---

## Phase 2: Route Group Restructure

Reorganizes file system into three route groups. No new features, but prerequisite for all subsequent phases.

### 2.1 Slim down root layout
- **Modify**: `app/layout.tsx` — Remove SidebarProvider, AppSidebar, SidebarInset, header, breadcrumbs. Keep only `<html>`, `<body>`, fonts, `<ThemeProvider>`. Update metadata title to "GKJ Eben Haezer"

### 2.2 Dashboard route group
- **New**: `app/(dashboard)/layout.tsx` — Move sidebar/header chrome here from old root layout. Uses SidebarProvider, AppSidebar, SidebarInset, header with breadcrumb + ColorModeToggle

### 2.3 Move existing pages into dashboard group
- **Move**: `app/dashboard/page.tsx` → `app/(dashboard)/dashboard/page.tsx` (no content changes)
- **Move**: `app/title-converter/page.tsx` → `app/(dashboard)/title-converter/page.tsx` (no content changes)

### 2.4 Content (public) route group
- **New**: `app/(content)/layout.tsx` — Public layout with header (logo + nav links: Berita, Khotbah + ColorModeToggle), `<main>`, and footer. No sidebar

### 2.5 Move landing page
- **Move**: `app/page.tsx` → `app/(content)/page.tsx` (rewritten in Phase 5)

### 2.6 Auth route group
- **New**: `app/(auth)/layout.tsx` — Minimal centered layout, no nav, just a centered card container

### 2.7 Dynamic breadcrumb
- **New**: `components/dashboard-breadcrumb.tsx` — Client component using `usePathname()` to auto-generate breadcrumbs, replacing the hardcoded TODO in the old layout

---

## Phase 3: Authentication

### 3.1 Auth API routes (BFF proxy)
Next.js API routes proxy to backend, keeping `API_URL` server-side. Manage httpOnly refresh token cookie.

- **New**: `app/api/auth/login/route.ts` — POST, calls `lib/api/auth.login()`, sets `refresh_token` httpOnly cookie, returns `{ user, accessToken }`
- **New**: `app/api/auth/register/route.ts` — same pattern
- **New**: `app/api/auth/google/route.ts` — same pattern for Google OAuth
- **New**: `app/api/auth/refresh/route.ts` — reads refresh_token from cookie, calls backend refresh
- **New**: `app/api/auth/logout/route.ts` — clears cookie, calls backend logout
- **New**: `lib/auth/server-utils.ts` — `getAccessTokenFromRequest()` helper for API routes

### 3.2 Auth context provider
- **New**: `lib/auth/auth-context.tsx` — Client component with `AuthProvider` and `useAuth()` hook. Stores access token in memory (React state), refresh token in httpOnly cookie. Provides `login()`, `loginWithGoogle()`, `logout()`, `refreshAuth()`. Uses React 19 `<Context value={}>` syntax
- **Modify**: `app/layout.tsx` — Wrap children with `<AuthProvider>` inside `<ThemeProvider>`

### 3.3 Login page
- **New**: `app/(auth)/login/page.tsx` — Client component with email/password form + Google OAuth button. Redirects to `/dashboard` on success. Shows error on failure

### 3.4 Middleware for route protection
- **New**: `middleware.ts` — Checks for `refresh_token` cookie on dashboard routes (`/dashboard/*`, `/title-converter/*`, `/content/*`). Redirects to `/login` if missing. Redirects authenticated users away from `/login`

### 3.5 Update existing components for auth
- **Modify**: `components/nav-user.tsx` — Use `useAuth()` instead of static `user` prop. Functional logout calls `logout()` then redirects to `/login`. Shows real user data
- **Modify**: `components/app-sidebar.tsx` — Remove hardcoded `data.user`. Render `<NavUser />` without user prop (reads from auth context)

---

## Phase 4: Content Management (Dashboard)

### 4.1 Install Shadcn components
```bash
pnpm dlx shadcn@latest add table card badge tabs toast
```

### 4.2 Content API routes (BFF)
- **New**: `app/api/content/route.ts` — GET (list with query params) + POST (create). Uses `getAccessTokenFromRequest()` for auth
- **New**: `app/api/content/[id]/route.ts` — GET (single) + PUT (update) + DELETE

### 4.3 Content listing page
- **New**: `app/(dashboard)/content/page.tsx` — Server component with content table
- **New**: `components/content/content-table.tsx` — Table with columns: Title, Type (badge), Status (badge), Author, Updated, Actions
- **New**: `components/content/content-filters.tsx` — Client component: search input + type tabs + status dropdown, updates URL search params
- **New**: `components/content/delete-content-dialog.tsx` — Client component: Shadcn Dialog for delete confirmation

### 4.4 Content editor
- **New**: `app/(dashboard)/content/new/page.tsx` — Renders ContentForm in create mode
- **New**: `app/(dashboard)/content/[id]/edit/page.tsx` — Server component fetches content, renders ContentForm in edit mode
- **New**: `components/content/content-form.tsx` — Client component form with:
  - Title input (auto-generates slug via `generateSlug()`)
  - Slug input (editable override)
  - Content type select (article, page, sermon, announcement)
  - Body textarea (with comment noting where to plug in TipTap/Lexical later)
  - Status select (draft, published, archived)
  - Featured image URL input
  - Publish date input
  - Save button → POST/PUT to `/api/content[/:id]`

### 4.5 Update sidebar navigation
- **Modify**: `components/app-sidebar.tsx` — Add "Content" nav group with items: "All Content" → `/content`, "New Content" → `/content/new`. Keep existing "Bakominfo" group with Title Converter
- Role-based: hide "New Content" and action buttons for viewers (`user.role !== "admin"`)

---

## Phase 5: Public Content Pages

### 5.1 Public API routes
- **New**: `app/api/content/public/route.ts` — Unauthenticated proxy to backend public listing
- **New**: `app/api/content/slug/[slug]/route.ts` — Unauthenticated proxy to fetch by slug

### 5.2 Pages
- **Rewrite**: `app/(content)/page.tsx` — Homepage with hero section, recent articles grid (Shadcn Card), latest sermon, announcements
- **New**: `app/(content)/news/page.tsx` — Paginated articles listing
- **New**: `app/(content)/sermons/page.tsx` — Paginated sermons listing
- **New**: `app/(content)/[slug]/page.tsx` — Dynamic content page with `generateMetadata()` for SEO. Fetches by slug, renders article layout with title, author, date, featured image, body

---

## Phase 6: Polish

### 6.1 Client-side fetch hook
- **New**: `hooks/use-api.ts` — `useApi()` hook for client components. Reads token from `useAuth()`, auto-retries on 401 after refresh

### 6.2 Loading/error states
- **New**: `app/(dashboard)/content/loading.tsx` — Skeleton table
- **New**: `app/(content)/[slug]/loading.tsx` — Skeleton article
- **New**: `app/(content)/[slug]/not-found.tsx`
- **New**: `app/(content)/news/loading.tsx` — Skeleton card grid

### 6.3 Toast notifications
- Add Shadcn `<Toaster>` to root layout for success/error feedback

---

## Key Files Modified (existing)

| File | Change |
|------|--------|
| `app/layout.tsx` | Strip to ThemeProvider + AuthProvider only |
| `components/app-sidebar.tsx` | Add content nav, remove hardcoded user, use auth context |
| `components/nav-user.tsx` | Use `useAuth()` hook, functional logout |

## Architecture Decisions

- **BFF pattern**: Client calls Next.js `/api/...` routes, which proxy to backend. `API_URL` is never exposed to browser
- **Token strategy**: Access token in React state (memory), refresh token in httpOnly cookie
- **Server components by default**: Only forms, filters, auth provider, and interactive dialogs are client components
- **Three route groups**: `(dashboard)` admin, `(content)` public, `(auth)` login — each with own layout
- **URL-based filtering**: Content list filters via URL search params, keeping the page as a server component

## Verification

After each phase, verify with:
1. `pnpm build` — should compile without errors
2. `pnpm dev` — navigate to:
   - After Phase 2: `/dashboard`, `/title-converter` still work with sidebar; `/` renders with public layout
   - After Phase 3: `/login` shows form; unauthenticated access to `/dashboard` redirects to login
   - After Phase 4: `/content` shows listing; `/content/new` shows editor form
   - After Phase 5: `/` shows homepage; `/news` lists articles; `/<slug>` renders content
3. `pnpm lint` — no lint errors
