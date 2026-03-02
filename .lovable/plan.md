

## Plan: Add Project Management and Project Name Filter

### Overview
Add an "Add Project" button, a project creation form, and a "Project Name" filter that depends on the Field filter selection.

### Database Change

Add a `field` column to `prabumulih_projects` table to associate projects with a field (Limau, OK-RT, Prabumulih):

```sql
ALTER TABLE prabumulih_projects ADD COLUMN field text DEFAULT 'Prabumulih';
```

Update existing projects' field values as needed (default to 'Prabumulih').

### UI Changes in `src/pages/Area2DocumentTracking.tsx`

#### 1. Add Project Dialog
- New "Add Project" button placed between "Data Recap" and "Add Data" in the action buttons row
- Pop-up form with two fields:
  - **Field**: Dropdown select (Limau, OK - RT, Prabumulih)
  - **Project Name**: Text input for manual typing
- On submit: inserts into `prabumulih_projects` with `field` and `project_name`, using current user as `created_by`
- Dialog is scrollable and styled consistently with Add Data dialog

#### 2. Project Name Filter
- New filter dropdown placed between "Filter by Field" and "Filter by Status Category"
- Shows "All Projects" by default
- **Dependent on Field filter**: only displays projects whose `field` matches the currently selected field(s)
- When a project is selected, table data filters to only show rows with that `project_id`

#### 3. State & Data Changes
- New state: `projects` (all projects list), `projectFilter` (selected project ID or 'all'), `addProjectDialogOpen`, `newProjectField`, `newProjectName`
- Fetch all projects from `prabumulih_projects` on mount
- Compute `filteredProjects` based on current field filter selection
- Update `groupedData` filtering to also check `project_id` when a project is selected
- The monitoring data's `project_id` links rows to projects

#### 4. Flow
```text
Field Filter → filters Project Name dropdown options
Project Name Filter → filters table rows by project_id
```

### Summary

| Area | Change |
|------|--------|
| Database | Add `field` column to `prabumulih_projects` |
| Action buttons row | Add "Add Project" button + dialog between Data Recap and Add Data |
| Filter row | Add "Project Name" filter between Field and Status Category |
| Data filtering | Filter projects by selected field(s), filter table by selected project |

