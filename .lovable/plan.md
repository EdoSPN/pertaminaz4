

## Plan: Fix Project Name Sync and Header Overflow

### 1. Fix: New project immediately available in Add Data form

**Problem:** After adding a new project, `fetchProjects()` is called, which updates the `projects` state. The `addDataFilteredProjects` derived value (line 642) already filters by `field`, so newly added projects should appear. However, if the Add Data dialog was already open or the `field` value in the form doesn't match the new project's field, it won't show.

**Fix:** The `handleAddProject` function (line 169) already calls `fetchProjects()` on success. This should work. But to ensure the Add Data project dropdown always reflects the latest projects, also reset `addDataProjectId` when `field` changes in the Add Data form (so stale selections are cleared). No additional fetch needed — `addDataFilteredProjects` is already a derived value that recalculates on every render.

If there's a real issue with projects not showing up, it could be a timing/state issue. Will verify the flow works correctly — `fetchProjects` → `setProjects` → `addDataFilteredProjects` recomputes. This chain is correct, so the fix is minimal: just ensure the project list updates propagate.

### 2. Fix: Header with sidebar trigger not overflowing when table scrolls

**Problem:** The `header` in `AppLayout` (App.tsx line 30) uses `sticky top-0 z-10`, but when the table in Area2DocumentTracking has `overflow-x-auto` (line 1162), horizontal scrolling on the table can cause the header's sidebar trigger button to visually overlap or get pushed by the sidebar.

**Fix in `src/App.tsx` (line 30):** The header needs a higher `z-index` than the sidebar and should not be affected by horizontal scroll. The table's horizontal scroll container is inside `main`, which is a sibling of `header`. The real issue is likely the header not having a proper stacking context relative to the sidebar.

Change the header to use `z-40` (higher than sidebar's default z-index) to ensure it stays above the sidebar overlay, and add `px-0` with proper left padding to prevent the trigger from shifting.

### Summary of changes

| File | Change |
|------|--------|
| `src/App.tsx` line 30 | Increase header `z-index` to `z-40` to stay above sidebar; ensure proper isolation |
| `src/pages/Area2DocumentTracking.tsx` | Reset `addDataProjectId` when `field` changes in Add Data form via a `useEffect`; ensure `handleAddProject` triggers re-render of project dropdown |

Both files, minimal edits.

