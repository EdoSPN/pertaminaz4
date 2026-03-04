

## Plan: Fix Project List Sync and Header Scroll Issue

### Issue 1: Project list mismatch between Add Data form and Project Name filter

**Root cause:** The filter dropdown uses `filteredProjects` which filters by the multi-select `fieldFilter` array:
```typescript
const filteredProjects = projects.filter(p =>
  fieldFilter.includes('all') || fieldFilter.includes(p.field || 'Prabumulih')
);
```

But the Add Data form uses `addDataFilteredProjects` which filters by the single `field` state (the form's field value):
```typescript
const addDataFilteredProjects = projects.filter(p => p.field === field);
```

These use different filter sources, so they show different project lists.

**Fix in `src/pages/Area2DocumentTracking.tsx`:** Change `addDataFilteredProjects` to use the same filtering logic as `filteredProjects` — filter by the currently selected `fieldFilter` values, not the `field` form state. This ensures both the filter dropdown and the Add Data form show the same project list.

```typescript
const addDataFilteredProjects = filteredProjects;
```

### Issue 2: Header not staying fixed during horizontal table scroll

**Root cause:** The `z-40` fix alone doesn't solve the horizontal scroll issue. The real problem is that the `flex-1` container holding header + main has no width constraint. When the table inside `main` overflows horizontally, the entire `flex-1` div expands, pushing the header wider too — so the header scrolls with the content.

**Fix in `src/App.tsx`:** Add `min-w-0 overflow-hidden` to the `flex-1` container div. This constrains it to the available width, so the table's `overflow-x-auto` only affects the table's own container, not the header.

```tsx
<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
  <header className="sticky top-0 z-40 ...">...</header>
  <main className="flex-1 p-3 md:p-6 overflow-auto">
    {children}
  </main>
</div>
```

The `main` element needs `overflow-auto` so it becomes the scrollable area, keeping the header isolated.

### Summary

| File | Change |
|------|--------|
| `src/pages/Area2DocumentTracking.tsx` line 647 | Change `addDataFilteredProjects` to use `filteredProjects` instead of filtering by `field` |
| `src/App.tsx` line 29 | Add `min-w-0 overflow-hidden` to flex-1 container |
| `src/App.tsx` line 34 | Add `overflow-auto` to main element |

