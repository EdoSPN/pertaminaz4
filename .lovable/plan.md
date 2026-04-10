

## Plan: File Preview with Drawing and Text Comment Annotations

Scope: Integrates into the existing `DocumentFilesDialog` component used by Area 2 (and later Area 1).

---

### Database Migration

**New table: `file_annotations`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| document_file_id | uuid NOT NULL | References document_files(id) ON DELETE CASCADE |
| page_number | integer DEFAULT 1 | Page number (1 for images) |
| annotation_type | text NOT NULL | 'drawing' or 'comment' |
| data | jsonb NOT NULL | Drawing paths or {x, y, text} for comments |
| created_by | uuid NOT NULL | |
| created_by_name | text | Display name |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

**RLS**: All authenticated can SELECT; users can INSERT/UPDATE/DELETE their own; admins can DELETE any.

---

### Edge Function: `convert-to-pdf`

- Accepts a storage file path for Office documents (DOCX, XLSX, PPTX)
- Uses LibreOffice headless to convert to PDF
- Uploads converted PDF back to storage, returns the path
- For PDF and image files, no conversion needed (handled client-side)

---

### New Components

**1. `src/components/FilePreviewDialog.tsx`**
- Full-screen dialog opened from DocumentFilesDialog
- Renders PDFs page-by-page using `react-pdf`, images with `<img>`
- Office docs: calls `convert-to-pdf` edge function first, then renders as PDF
- Toolbar: Draw mode, Comment mode, color picker, undo, save
- Page navigation for multi-page PDFs
- Loads and displays all users' annotations

**2. `src/components/DrawingCanvas.tsx`**
- HTML5 Canvas overlay on each page
- Freehand drawing with configurable color/width
- Serializes stroke paths as JSON for database storage
- Renders other users' drawings as read-only (different colors)

**3. `src/components/TextAnnotation.tsx`**
- Click-to-place comment pins on the document
- Popover shows comment text, author, timestamp
- Users can add/edit/delete their own comments

---

### Integration

In `DocumentFilesDialog.tsx`, add an "Eye" (preview) icon button on each file row. Clicking opens `FilePreviewDialog` with that file.

---

### Dependencies

- `react-pdf` (pdf.js wrapper for rendering PDFs)
- No additional annotation libraries -- custom canvas + positioned comments

---

### Technical Details

- Annotations are per-page, per-file, stored as JSONB
- Drawing data format: `{ strokes: [{ points: [{x,y}], color, width }] }`
- Comment data format: `{ x, y, text }`
- All annotations are shared -- every user sees everyone's markings
- Canvas coordinates are normalized to document dimensions for consistent rendering at any zoom level

