# Missing Tasks & Known Gaps

This document tracks known bugs, missing features, and polish items discovered during implementation. Created 2026-02-28.

---

## Bugs

### 1. `refresh_token` cookie stores `accessToken`
**Files**: `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/auth/refresh/route.ts`, `app/api/auth/google/route.ts`

All four auth routes set the httpOnly cookie to `data.accessToken`. If the backend returns a separate `refreshToken` field, the `AuthResponse` type and the cookie-setting logic in each route need updating to use `data.refreshToken` instead.

**Fix needed**:
- Update `AuthResponse` type in `lib/types/auth.ts` to include `refreshToken?: string`
- Update each route to set the cookie from `data.refreshToken` (fall back to `data.accessToken` if absent)

### 2. `useApi` stale closure on retry after refresh
**File**: `hooks/use-api.ts`

After a 401 triggers `refreshAuth()`, the retry call still uses the old `accessToken` captured in the closure at the time of the original call. The refreshed token stored in `AuthContext` is not re-read before retrying.

**Fix needed**: After a successful `refreshAuth()`, read the latest token from a ref or re-fetch it from context before making the retry request.

---

## Missing Features

### 3. Register page UI
`app/api/auth/register/route.ts` exists (BFF endpoint) but there is no `/register` page in the frontend. Users cannot self-register through the UI.

**Needed**: `app/(auth)/register/page.tsx` with name, email, and password fields, calling `POST /api/auth/register`.

### 4. Google Login UI ✅
Implemented in the 2026-02-28 plan. `GoogleOAuthProvider` wraps the root layout; `loginWithGoogle` added to `AuthContext`; Google button added to `/login`.

### 5. Rich text / Markdown editor
**File**: `components/content/content-form.tsx`

The content body field is a plain `<textarea>`. There is no WYSIWYG or Markdown editor, making it hard to format articles and sermons.

**Options**: integrate `@uiw/react-md-editor`, `tiptap`, or `react-quill`.

### 6. Featured image upload
**File**: `components/content/content-form.tsx`

The `featuredImageUrl` field is a plain text input. There is no file picker or upload mechanism; users must paste a URL manually.

**Needed**: `<input type="file">` + an upload API route (`POST /api/upload`) that forwards the file to the backend or an object-storage service.

### 7. Pagination UI on listing pages
**Files**: `app/(content)/news/page.tsx`, `app/(content)/sermons/page.tsx`

Both pages fetch paginated data from the API (page/limit params exist) but no pagination controls (Prev / Next buttons, page numbers) are rendered. Users cannot navigate beyond the first page.

**Needed**: A `<Pagination>` component using URL search params (`?page=2`) and Shadcn's `pagination` primitive.

### 8. `AuthResponse` type missing `refreshToken`
**File**: `lib/types/auth.ts`

If the backend returns a separate `refreshToken` field alongside `accessToken`, the current `AuthResponse` interface does not model it. This is related to Bug #1.

---

## Nice-to-have / Polish

### 9. Content detail page breadcrumb
**File**: `app/(content)/[slug]/page.tsx`

The dynamic content detail page does not show any breadcrumb navigation back to the listing pages. Adding a simple `News > Article Title` breadcrumb improves UX.

### 10. SEO metadata for listing pages
**Files**: `app/(content)/news/page.tsx`, `app/(content)/sermons/page.tsx`

Neither listing page exports a `generateMetadata` function. Adding page-level `<title>` and `<meta name="description">` improves search engine visibility.

### 11. Error boundary for content pages
If the backend API is down, content pages will crash or show an unformatted error. A React error boundary (or Next.js `error.tsx`) would catch these failures and display a user-friendly message.

### 12. Loading state on logout
**File**: `components/nav-user.tsx`

The logout button fires `logout()` from `useAuth` but shows no loading indicator while the request is in flight. A brief spinner or disabled state would prevent double-clicks and improve perceived responsiveness.
