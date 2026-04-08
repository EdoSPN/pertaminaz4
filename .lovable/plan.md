

## Plan: Make Area 1 Feature-Complete (Match Area 2)

### Overview
Area 1 is missing: Project management system, PIC tracking, Project Name filter, DocumentFilesDialog, and Data Recap project selection. The fix is to add the missing database columns/table and rewrite Area1DocumentTracking.tsx as a copy of Area2 adapted for Area 1.

---

### Database Migration

**1. Add `project_id` and `pic` columns to `area1_monitoring_data`:**
```sql
ALTER TABLE public.area1_monitoring_data ADD COLUMN project_id uuid;
ALTER TABLE public.area1_monitoring_data ADD COLUMN pic text;
```

**2. Create `area1_projects` table (same structure as `prabumulih_projects`):**
```sql
CREATE TABLE public.area1_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  field text DEFAULT 'Adera',
  description text,
  status text DEFAULT 'Active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  CONSTRAINT check_area1_project_field CHECK (field IN ('Adera', 'Pendopo', 'Ramba'))
);

ALTER TABLE public.area1_projects ENABLE ROW LEVEL SECURITY;
-- Same RLS as prabumulih_projects
CREATE POLICY "All can view area1 projects" ON public.area1_projects FOR SELECT USING (true);
CREATE POLICY "Admin/reviewer can insert area1 projects" ON public.area1_projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));
CREATE POLICY "All except viewer can update area1 projects" ON public.area1_projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'approver'));
CREATE POLICY "Only admin can delete area1 projects" ON public.area1_projects FOR DELETE USING (has_role(auth.uid(), 'admin'));
```

---

### File Change: `src/pages/Area1DocumentTracking.tsx`

**Full rewrite** -- copy Area2DocumentTracking.tsx with these substitutions:

| Area 2 Value | Area 1 Value |
|---|---|
| `prabumulih_monitoring_data` | `area1_monitoring_data` |
| `prabumulih_projects` | `area1_projects` |
| `'Limau' \| 'OK - RT' \| 'Prabumulih'` | `'Adera' \| 'Pendopo' \| 'Ramba'` |
| Default field `'Prabumulih'` | `'Adera'` |
| Title "Area 2 - Document Tracking" | "Area 1 - Document Tracking" |
| Component name `Area2DocumentTracking` | `Area1DocumentTracking` |

All features preserved: Manage Projects dialog, Project Name filter, PIC filter/combobox, DocumentFilesDialog, Data Recap with project selection, field multi-select filter.

---

### Summary

| Area | Change |
|---|---|
| Database | Add `project_id` + `pic` to `area1_monitoring_data`; create `area1_projects` table with RLS |
| `Area1DocumentTracking.tsx` | Full rewrite as copy of Area 2 with Area 1 table/field names |

