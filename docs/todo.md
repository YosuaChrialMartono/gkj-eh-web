# Tiptap Integration - Backend Tasks

## Completed

- [x] Install Tiptap packages
- [x] Create upload API (`/api/upload`)
- [x] Build Tiptap editor component with toolbar
- [x] Update ContentForm to use Tiptap
- [x] Update types with `bodyHtml` field
- [x] Update public rendering to use `bodyHtml`
- [x] Add image resize support
- [x] Auto-upload pasted images
- [x] Backend already has `body_html` column and model support

## To Do

### Database

- [x] Add `body_html` column to content table (already done in backend)
- [x] Update create content API to store `bodyHtml` (already done)
- [x] Update update content API to store `bodyHtml` (already done)

### Auth (TODO Later)

- [ ] Re-enable authentication check in ContentForm (currently bypassed for testing)
- [ ] Add proper auth redirect to login page when not authenticated

### Future Enhancements (Not in Scope)

- [ ] Image cropping support
- [ ] External image storage (Cloudinary, S3, R2)
- [ ] Additional Tiptap features (tables, code blocks, YouTube embeds)
