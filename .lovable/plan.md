

## Plan: Fix Field Filter Behavior, Align Filter Button, and Move Action Buttons

### Overview
Three changes to the Area 2 Document Tracking page layout and filter logic.

---

### 1. Fix Field Filter Toggle Behavior

**Problem:** When a single field (e.g., Limau) is checked, clicking it again should uncheck it (not select all). Currently, when unchecking the last item, it reverts to "all".

**Change in `handleFieldFilterChange` (lines 124-144):**
- Remove the logic that auto-selects "all" when `newFilter.length === 0`
- When all 3 are individually selected, still collapse to "all"
- Allow empty selection (show no results) or keep last item checked -- the natural behavior is: clicking a checked item unchecks it, period

Updated logic:
```typescript
const handleFieldFilterChange = (value: string, checked: boolean | 'indeterminate') => {
  if (value === 'all') {
    setFieldFilter(checked ? ['all'] : []);
  } else {
    setFieldFilter(prev => {
      let newFilter = prev.filter(f => f !== 'all');
      if (checked) {
        newFilter = [...newFilter, value];
      } else {
        newFilter = newFilter.filter(f => f !== value);
      }
      if (newFilter.length === 3) {
        return ['all'];
      }
      return newFilter;
    });
  }
};
```

Also update the checkbox `checked` prop (line 1129) to not show checked when "all" is active -- individual checkboxes should only reflect their own state:
```typescript
checked={fieldFilter.includes('all') ? false : fieldFilter.includes(f)}
```

Wait -- the user said "the second click of it is not make all checklist". This means: when you click Limau once it checks Limau. When you click Limau a second time, it should just uncheck Limau (not trigger "all"). The current bug is that unchecking the last remaining filter auto-selects "all". Fix: remove the `newFilter.length === 0 → ['all']` fallback.

### 2. Align Field Filter Button with Other Filters

**Problem:** The Field filter button is not visually aligned with Status Category and PIC filter buttons.

**Change (lines 1101-1137):** The Field filter uses a `Label` + `Popover` structure while others use `Label` + `Select`. The issue is the Field filter wraps in its own `div` with `w-full sm:w-auto`. Ensure consistent structure -- add `flex flex-col` to align the label and button vertically, matching the other filters. Also ensure the Popover trigger button height matches `SelectTrigger` (h-10).

### 3. Move Data Recap and Add Data Buttons

**Problem:** Data Recap and Add Data buttons are in the page header (lines 762-1097), but they should be between the filters and the table, aligned left.

**Change:** 
- Remove the Data Recap dialog trigger and Add Data dialog trigger from the header `div` (lines 762-1098)
- Add a new row between the filter row (line 1167) and the table (line 1169) containing these two buttons aligned left
- Keep the dialog content (DialogContent) attached to the triggers in the new location

Structure:
```
<h1>Area 2 - Document Tracking</h1>      ← header (title only)

<div filters>                              ← filter row (unchanged)
  Field | Status Category | PIC
</div>

<div className="flex gap-2">              ← NEW: action buttons row
  <Data Recap button + dialog>
  <Add Data button + dialog>
</div>

<div table>                                ← table (unchanged)
```

---

### Summary

| Area | Change |
|------|--------|
| `handleFieldFilterChange` (line 124-144) | Remove auto-"all" when last filter unchecked; allow empty filter state |
| Field filter checkboxes (line 1129) | Don't show checked when "all" is selected -- individual items toggle independently |
| Filter row (line 1101-1137) | Ensure Field filter button aligns vertically with other filter dropdowns |
| Header section (lines 760-1098) | Move Data Recap and Add Data buttons from header to a new row between filters and table |

File changed: `src/pages/Area2DocumentTracking.tsx`

No database changes needed.

