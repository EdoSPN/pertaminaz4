

## Plan: Create Area 1 Document Tracking Page

### Overview
1. Remove the collapsible Area 1 submenu (Adera/Pendopo/Ramba) from the sidebar
2. Make Area 1 a direct link to `/area1/document-tracking` (like Area 2)
3. Create a new database table `area1_monitoring_data` (same as `prabumulih_monitoring_data` but without `project_id` and `pic`)
4. Create `Area1DocumentTracking.tsx` -- a simplified copy of Area 2 with fields Adera/Pendopo/Ramba and no Project or PIC features

---

### Database Migration

Create `area1_monitoring_data` table without `project_id` (FK) and `pic` columns:

```sql
CREATE TABLE public.area1_monitoring_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field TEXT DEFAULT 'Adera',
  file_name TEXT NOT NULL,
  document_number TEXT,
  discipline TEXT,
  status_category status_category NOT NULL DEFAULT 'IFR',
  status_description_ifr status_description DEFAULT 'Not Yet',
  status_description_ifa status_description DEFAULT 'Not Yet',
  status_description_ifb status_description DEFAULT 'Not Yet',
  target_start_ifr TIMESTAMPTZ,
  target_start_ifa TIMESTAMPTZ,
  target_start_ifb TIMESTAMPTZ,
  actual_start_ifr TIMESTAMPTZ,
  actual_start_ifa TIMESTAMPTZ,
  actual_start_ifb TIMESTAMPTZ,
  target_submit_ifr TIMESTAMPTZ,
  target_submit_ifa TIMESTAMPTZ,
  target_submit_ifb TIMESTAMPTZ,
  actual_submit_ifr TIMESTAMPTZ,
  actual_submit_ifa TIMESTAMPTZ,
  actual_submit_ifb TIMESTAMPTZ,
  approval_status approval_status NOT NULL DEFAULT 'Pending',
  approval_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_area1_field_values CHECK (field IN ('Adera', 'Pendopo', 'Ramba'))
);

-- RLS (same policies as prabumulih_monitoring_data)
ALTER TABLE public.area1_monitoring_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view area1 data" ON public.area1_monitoring_data FOR SELECT USING (true);
CREATE POLICY "Admin and reviewer can insert area1 data" ON public.area1_monitoring_data FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admin can update all area1 data" ON public.area1_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Reviewer can update area1 file info" ON public.area1_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'reviewer'));
CREATE POLICY "User can update area1 status" ON public.area1_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'user'));
CREATE POLICY "Approver can update area1 approval" ON public.area1_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'approver'));
CREATE POLICY "Only admin can delete area1 data" ON public.area1_monitoring_data FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_area1_monitoring_data_updated_at
BEFORE UPDATE ON public.area1_monitoring_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### File Changes

#### 1. New file: `src/pages/Area1DocumentTracking.tsx`
Copy of Area2DocumentTracking with these removals/changes:
- Title: "Area 1 - Document Tracking"
- Field type: `'Adera' | 'Pendopo' | 'Ramba'` (default: `'Adera'`)
- Table: `area1_monitoring_data` (not `prabumulih_monitoring_data`)
- **Remove**: All project-related code (project state, fetchProjects, project filter, Manage Projects dialog, project_id in inserts/updates, Project Name column)
- **Remove**: All PIC-related code (pic state, fetchExistingPics, PIC filter, PIC combobox in forms, PIC column in table/recap)
- **Remove**: DocumentFilesDialog (since it references `prabumulih_monitoring_data` FK -- can be added later)
- Keep: Field filter, Status Category filter, Data Recap, Add Data, Edit Status, Edit File Info, Approval dialogs

#### 2. Update: `src/components/AppSidebar.tsx`
- Remove `documentTrackingItems` array (Area 1 sub-items) and `openAreas` state
- Remove the nested Collapsible for Area 1 inside Document Tracking
- Make both Area 1 and Area 2 direct links under Document Tracking:
  ```
  Document Tracking (collapsible)
    ├── Area 1  → /area1/document-tracking
    └── Area 2  → /area2/document-tracking
  ```
- Collapsed state remains: A1 icon → `/area1/document-tracking`, A2 icon → `/area2/document-tracking`

#### 3. Update: `src/App.tsx`
- Import `Area1DocumentTracking`
- Add route `/area1/document-tracking` with ProtectedRoute + AppLayout
- Add redirect: `/monitoring/adera`, `/monitoring/pendopo`, `/monitoring/ramba` → `/area1/document-tracking`

### Summary

| Area | Change |
|------|--------|
| Database | New `area1_monitoring_data` table with RLS policies |
| `src/pages/Area1DocumentTracking.tsx` | New page -- Area 2 copy without Project/PIC features, fields = Adera/Pendopo/Ramba |
| `src/components/AppSidebar.tsx` | Remove Area 1 collapsible sub-items, make Area 1 a direct link |
| `src/App.tsx` | Add `/area1/document-tracking` route, update redirects |

