

## Plan: Add Edit/Delete Project Features to Add Project Dialog

### Overview
Enhance the "Add Project" dialog to also list existing projects with inline edit and delete capabilities, respecting role-based permissions:
- **Delete**: Admin only
- **Edit project name**: All roles except Viewer (i.e., admin, reviewer, user, approver)
- **Add new project**: Remains admin and reviewer only (existing `canAddNew` logic)

### Changes in `src/pages/Area2DocumentTracking.tsx`

#### 1. New state variables
- `editingProjectId` (`string | null`) -- tracks which project is being edited inline
- `editingProjectName` (`string`) -- the edited name value
- `deleteProjectConfirmId` (`string | null`) -- tracks which project delete confirmation is open

#### 2. New handler functions

**`handleEditProject`**: Updates project name in `prabumulih_projects` table, then calls `fetchProjects()`. Only allowed if role is not viewer (no viewer role exists in the enum, so effectively all authenticated roles can edit).

**`handleDeleteProject`**: Deletes project from `prabumulih_projects` table. Only allowed for admin. Uses AlertDialog for confirmation since deletion is destructive.

#### 3. Updated dialog UI

The "Add Project" dialog title changes to "Manage Projects". Inside:
- **Top section**: Keep existing "Add New Project" form (field select + project name input + add button) -- only shown if `canAddNew`
- **Bottom section**: Scrollable list of existing projects grouped or listed simply, each showing:
  - Project name (text or input if editing)
  - Field badge/label
  - Edit button (pencil icon) -- visible for all roles except viewer
  - Delete button (trash icon) -- visible for admin only
  - Save/Cancel buttons when in edit mode

#### 4. Permission logic
```typescript
const canEditProject = userRole === 'admin' || userRole === 'reviewer' || userRole === 'user' || userRole === 'approver';
const canDeleteProject = userRole === 'admin';
```

The dialog trigger button visibility stays as `canAddNew` OR we broaden it so users who can edit/delete can also see the button. Since all roles except viewer should access it, change the condition:

```typescript
{(canAddNew || canEditProject) && (
  <Dialog ...>
    <DialogTrigger>
      <Button variant="outline">
        <FolderOpen /> Manage Projects
      </Button>
    </DialogTrigger>
    ...
  </Dialog>
)}
```

#### 5. Dialog layout sketch
```
┌─────────────────────────────┐
│ Manage Projects             │
├─────────────────────────────┤
│ [Add New Project section]   │  ← only if canAddNew
│  Field: [Select]            │
│  Name: [Input]              │
│  [Add Project]              │
├─────────────────────────────┤
│ Existing Projects           │
│ ┌─────────────────────────┐ │
│ │ Project A  (Limau) ✏️🗑️│ │
│ │ Project B  (OK-RT) ✏️🗑️│ │
│ │ Project C  (Prabu) ✏️   │ │  ← non-admin: no delete
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Summary

| Change | Detail |
|--------|--------|
| New state | `editingProjectId`, `editingProjectName`, `deleteProjectConfirmId` |
| New handlers | `handleEditProject`, `handleDeleteProject` |
| Permission vars | `canEditProject` (all except viewer), `canDeleteProject` (admin only) |
| Dialog UI | Rename to "Manage Projects", add project list with edit/delete actions |
| Button visibility | Show for `canAddNew || canEditProject` |

Single file: `src/pages/Area2DocumentTracking.tsx`

