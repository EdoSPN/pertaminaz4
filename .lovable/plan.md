

## Plan: Project Name Integration in Area 2 Document Tracking

### Overview
Three changes: (1) Show "No Project" and hide table when a field has no projects, (2) Add "Project Name" form field in Add Data dialog, (3) Add "Project Name" column in the table.

### Changes in `src/pages/Area2DocumentTracking.tsx`

#### 1. Project Name Filter -- "No Project" when empty
- Update the Project Name filter: when `filteredProjects` is empty, force the filter value to show "No Project" and disable the dropdown
- When no projects exist for the selected field(s), the table should show the "No monitoring data found" message (already happens if projectFilter doesn't match any data, but we need to explicitly set projectFilter to a non-matching value)
- In the `useEffect` or inline logic: if `filteredProjects.length === 0`, set `projectFilter` to `'no_project'` so nothing matches

#### 2. Add "Project Name" dropdown in Add Data dialog
- Add new state `addDataProjectId` for the selected project in the Add Data form
- Add a `<Select>` labeled "Project Name" between "Field" and "File Name" in the Add Data dialog
- The dropdown options should be filtered by the currently selected `field` value in the form
- On submit (`handleAddNew`), use `addDataProjectId` as `project_id` instead of the hardcoded `PROJECT_ID`
- Reset `addDataProjectId` after successful submission

#### 3. Add "Project Name" column in table
- In `groupedData` reduction, store `project_id` on each group
- Look up project name from `projects` array using `project_id`
- Add `<TableHead>Project Name</TableHead>` between "Field" and "Doc Number" in both the main table header (line 1123) and in `renderDataRows` (line 718)
- Add corresponding `<TableCell>` showing the project name

#### 4. Also add Project Name in Data Recap table
- Add "Project Name" column between "Field" and "Doc Number" in the recap table header and rows

### Summary

| Area | Change |
|------|--------|
| Project Name filter | Show "No Project" & empty table when no projects exist for selected field(s) |
| Add Data dialog | New "Project Name" select between Field and File Name, filtered by selected field |
| Main table | New "Project Name" column between Field and Doc Number |
| Data Recap table | New "Project Name" column between Field and Doc Number |
| `handleAddNew` | Use selected project ID instead of hardcoded `PROJECT_ID` |

No database changes needed.

