

## Plan: Improve Table Layout and Add Data Dialog in Area 2

### Overview
Make the data table horizontally scrollable with single-line rows, and make the "Add Data" dialog scrollable with a fixed max height so all form fields are accessible.

---

### Changes

#### 1. Table: Single-line rows with horizontal scrolling

In `src/pages/Area2DocumentTracking.tsx`, update the table wrapper and cell styling:

- The outer `div` already has `overflow-x-auto` -- keep that
- Add `whitespace-nowrap` to all `TableCell` and `TableHead` elements so text stays on one line
- Add `min-w-[...]` to columns with long content (File Name, Doc Number) so they don't collapse too narrow

Specific changes in `renderDataRows` (around line 672-754):
- Add `className="whitespace-nowrap"` to each `TableCell`

In the `TableHeader` (around line 1176-1192):
- Add `className="whitespace-nowrap"` to each `TableHead`

#### 2. Add Data Dialog: Scrollable with max height

Change the `DialogContent` for the Add Data dialog (line 830):

From:
```typescript
<DialogContent className="max-w-md">
```

To:
```typescript
<DialogContent className="max-w-md max-h-[85vh] flex flex-col">
```

Wrap the form content `div` with `ScrollArea` or use `overflow-y-auto`:

```typescript
<DialogContent className="max-w-md max-h-[85vh] flex flex-col">
  <DialogHeader>
    <DialogTitle>Add Monitoring Data</DialogTitle>
  </DialogHeader>
  <div className="space-y-4 overflow-y-auto flex-1 pr-2">
    {/* all form fields stay the same */}
  </div>
</DialogContent>
```

The `pr-2` adds padding for the scrollbar so it doesn't overlap content.

---

### Summary

| File | Change |
|------|--------|
| `src/pages/Area2DocumentTracking.tsx` | Add `whitespace-nowrap` to all table cells and headers for single-line display |
| `src/pages/Area2DocumentTracking.tsx` | Add `max-h-[85vh]`, `flex flex-col`, and `overflow-y-auto` to the Add Data dialog |

No database changes needed.

