-- Create prabumulih_projects table for project list management
CREATE TABLE public.prabumulih_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prabumulih_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All authenticated users can view projects"
ON public.prabumulih_projects
FOR SELECT
USING (true);

CREATE POLICY "Admin and reviewer can insert projects"
ON public.prabumulih_projects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));

CREATE POLICY "Admin and reviewer can update projects"
ON public.prabumulih_projects
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));

CREATE POLICY "Only admin can delete projects"
ON public.prabumulih_projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prabumulih_projects_updated_at
BEFORE UPDATE ON public.prabumulih_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();