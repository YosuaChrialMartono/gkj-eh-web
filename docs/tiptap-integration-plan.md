# Tiptap Editor Integration Plan

## 1. Overview

Replace the plain `<Textarea>` in content editor with Tiptap rich text editor. Currently at `components/content/content-form.tsx:143` there's a TODO comment indicating this is needed.

## 2. Integration Points

| Location | Description |
|----------|-------------|
| `components/content/content-form.tsx` | Main content body editor (line 143-150) |

**Future considerations** (not in current scope):
- Title converter component
- Other text input areas

## 3. Architecture

### 3.1 Install Dependencies

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

### 3.2 Image Storage (Free/Self-hosted)

**Option A: Store in database as base64** (simple, not recommended for production)
**Option B: Upload to local filesystem** (recommended for self-hosting)
**Option C: Use external service** (Cloudinary, AWS S3, Cloudflare R2)

For **free self-hosted**, recommended approach:
- Create API endpoint `/api/upload` that saves to `public/uploads/`
- Use Tiptap's `Image` extension with custom upload handler
- Store only URL references in the JSON document

### 3.3 Document Storage

**Recommended: Store as JSON** (not HTML)

Current database schema stores `body` as `string`. Options:

| Approach | Pros | Cons |
|----------|------|------|
| Store as `text` (JSON stringified) | Simple, works with any DB | No querying on content |
| Store as `json/jsonb` (PostgreSQL) | Native JSON support, queryable | DB-specific |

**Recommended**: Keep as `text` column storing JSON string. Add separate `body_html` column for quick rendering if needed.

### 3.4 API Endpoints Needed

1. **POST `/api/upload`** - Handle image uploads
   - Accept: `multipart/form-data`
   - Save to: `public/uploads/` or cloud storage
   - Return: `{ url: string }`

## 4. Implementation Steps

### Step 1: Install Tiptap packages

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

### Step 2: Create Tiptap Editor Component

Create `components/tiptap/editor.tsx`:
- Configure StarterKit (bold, italic, headings, lists, blockquotes, code)
- Add Image extension with upload handler
- Add Link extension
- Add Placeholder extension
- Build toolbar UI (bold, italic, headings, lists, image, link)
- Export both component and editor instance

### Step 3: Create Image Upload API

Create `app/api/upload/route.ts`:
- Handle `POST` with multipart form data
- Validate file type (jpg, png, gif, webp)
- Save to filesystem
- Return public URL

### Step 4: Update ContentForm

In `components/content/content-form.tsx`:
- Replace `<Textarea>` with `<TiptapEditor>`
- Use `editor.getJSON()` to get content
- Load existing content with `editor.commands.setContent(json)`

### Step 5: Update Types (if needed)

Current `Content.body` is `string`. Consider renaming to `bodyJson` for clarity, or add new field.

### Step 6: Update Public Rendering

In `app/(content)/[slug]/page.tsx`:
- Render JSON content using Tiptap's `generateHTML()` helper
- Or create a separate renderer component

## 5. Questions for You

1. **Image storage preference**:
   - Local filesystem (`public/uploads/`)?
   - External service (Cloudinary, S3, R2)?

2. **Database migration**:
   - Keep `body` as text (stringified JSON), or add new `body_json` column?
   - Add `body_html` column for quick rendering?

3. **Feature scope**:
   - Start with basic: bold, italic, headings, lists, links, images
   - Or add more: tables, code blocks, YouTube embeds?

## 6. References

- [Tiptap Documentation](https://tiptap.dev/docs)
- [Tiptap Image Extension](https://tiptap.dev/docs/editor/extensions/nodes/image)
- [Tiptap React Integration](https://tiptap.dev/docs/editor/api/react)
- [Tiptap Best Practices - Liveblocks](https://liveblocks.io/docs/guides/tiptap-best-practices-and-tips)
