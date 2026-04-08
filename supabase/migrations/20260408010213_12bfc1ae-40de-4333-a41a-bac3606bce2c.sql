
ALTER TABLE public.area1_monitoring_data ADD COLUMN project_id uuid;
ALTER TABLE public.area1_monitoring_data ADD COLUMN pic text;

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

CREATE POLICY "All can view area1 projects" ON public.area1_projects FOR SELECT USING (true);
CREATE POLICY "Admin/reviewer can insert area1 projects" ON public.area1_projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));
CREATE POLICY "All except viewer can update area1 projects" ON public.area1_projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'user') OR has_role(auth.uid(), 'approver'));
CREATE POLICY "Only admin can delete area1 projects" ON public.area1_projects FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_area1_projects_updated_at
BEFORE UPDATE ON public.area1_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
