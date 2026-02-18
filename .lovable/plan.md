

## Plan: Make Edit File Information Dialog Scrollable

### Overview
Apply the same scrollable dialog treatment used on the "Add Data" dialog to the "Edit File Information" dialog, so all form fields are accessible on smaller screens.

### Changes

#### File: `src/pages/Area2DocumentTracking.tsx`

**Edit File Info Dialog (lines 1299-1458)**

Update the `DialogContent` to constrain height and enable scrolling:

```typescript
<DialogContent className="max-w-md max-h-[85vh] flex flex-col">
```

Update the form wrapper `div` (line 1304) to be scrollable:

```typescript
<div className="space-y-4 overflow-y-auto flex-1 pr-2">
```

This matches exactly how the "Add Data" dialog was adjusted -- max height of 85% viewport, flex column layout, and vertical scroll on the form content area.

### Summary

| File | Change |
|------|--------|
| `src/pages/Area2DocumentTracking.tsx` | Add `max-h-[85vh] flex flex-col` to Edit File Info `DialogContent`, add `overflow-y-auto flex-1 pr-2` to form wrapper |

No database changes needed.
