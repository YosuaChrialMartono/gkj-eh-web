# Missing Tasks & Known Gaps

This document tracks known bugs, missing features, and polish items discovered during implementation. Created 2026-02-28.

---

## Bugs

Authentication items in this original implementation checklist were superseded by the local Auth.js integration. The backend refresh-token flow and its `API_URL` routes no longer exist; see [auth.md](auth.md).

---

## Missing Features

### Register page UI ✅
The `/register` page registers a local database user through the Auth.js-backed server action. It does not call a backend BFF route.

### Google Login UI ✅
The login page uses Auth.js Google sign-in when configured. The removed custom `/api/auth/google` proxy is not used.

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
