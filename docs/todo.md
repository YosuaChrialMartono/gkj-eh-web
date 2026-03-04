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

## To Do

### Database

- [ ] Add `body_html` column to content table
- [ ] Update create content API to store `bodyHtml`
- [ ] Update update content API to store `bodyHtml`

### Future Enhancements (Not in Scope)

- [ ] Image cropping support
- [ ] External image storage (Cloudinary, S3, R2)
- [ ] Additional Tiptap features (tables, code blocks, YouTube embeds)
