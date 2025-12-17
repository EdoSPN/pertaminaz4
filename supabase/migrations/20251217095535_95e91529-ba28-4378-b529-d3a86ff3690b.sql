-- Create limau_projects table
CREATE TABLE public.limau_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on limau_projects
ALTER TABLE public.limau_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for limau_projects
CREATE POLICY "All authenticated users can view limau projects" ON public.limau_projects FOR SELECT USING (true);
CREATE POLICY "Admin and reviewer can insert limau projects" ON public.limau_projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Admin and reviewer can update limau projects" ON public.limau_projects FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Only admin can delete limau projects" ON public.limau_projects FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create limau_monitoring_data table
CREATE TABLE public.limau_monitoring_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.limau_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  pic TEXT,
  status_category status_category NOT NULL DEFAULT 'IFR',
  status_description_ifr status_description DEFAULT 'Not Yet',
  status_description_ifa status_description DEFAULT 'Not Yet',
  status_description_ifb status_description DEFAULT 'Not Yet',
  target_submit_ifr TIMESTAMP WITH TIME ZONE,
  target_submit_ifa TIMESTAMP WITH TIME ZONE,
  target_submit_ifb TIMESTAMP WITH TIME ZONE,
  actual_submit_ifr TIMESTAMP WITH TIME ZONE,
  actual_submit_ifa TIMESTAMP WITH TIME ZONE,
  actual_submit_ifb TIMESTAMP WITH TIME ZONE,
  approval_status approval_status NOT NULL DEFAULT 'Pending',
  approval_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on limau_monitoring_data
ALTER TABLE public.limau_monitoring_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for limau_monitoring_data
CREATE POLICY "All authenticated users can view limau monitoring data" ON public.limau_monitoring_data FOR SELECT USING (true);
CREATE POLICY "Admin and reviewer can insert limau monitoring data" ON public.limau_monitoring_data FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Admin can update all limau monitoring data" ON public.limau_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Reviewer can update limau file info and target dates" ON public.limau_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'reviewer'::app_role)) WITH CHECK (has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "User can update limau status and actual dates" ON public.limau_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'user'::app_role)) WITH CHECK (has_role(auth.uid(), 'user'::app_role));
CREATE POLICY "Approver can update limau approval status" ON public.limau_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'approver'::app_role)) WITH CHECK (has_role(auth.uid(), 'approver'::app_role));
CREATE POLICY "Only admin can delete limau monitoring data" ON public.limau_monitoring_data FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create okrt_projects table
CREATE TABLE public.okrt_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on okrt_projects
ALTER TABLE public.okrt_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for okrt_projects
CREATE POLICY "All authenticated users can view okrt projects" ON public.okrt_projects FOR SELECT USING (true);
CREATE POLICY "Admin and reviewer can insert okrt projects" ON public.okrt_projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Admin and reviewer can update okrt projects" ON public.okrt_projects FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Only admin can delete okrt projects" ON public.okrt_projects FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create okrt_monitoring_data table
CREATE TABLE public.okrt_monitoring_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.okrt_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  pic TEXT,
  status_category status_category NOT NULL DEFAULT 'IFR',
  status_description_ifr status_description DEFAULT 'Not Yet',
  status_description_ifa status_description DEFAULT 'Not Yet',
  status_description_ifb status_description DEFAULT 'Not Yet',
  target_submit_ifr TIMESTAMP WITH TIME ZONE,
  target_submit_ifa TIMESTAMP WITH TIME ZONE,
  target_submit_ifb TIMESTAMP WITH TIME ZONE,
  actual_submit_ifr TIMESTAMP WITH TIME ZONE,
  actual_submit_ifa TIMESTAMP WITH TIME ZONE,
  actual_submit_ifb TIMESTAMP WITH TIME ZONE,
  approval_status approval_status NOT NULL DEFAULT 'Pending',
  approval_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on okrt_monitoring_data
ALTER TABLE public.okrt_monitoring_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for okrt_monitoring_data
CREATE POLICY "All authenticated users can view okrt monitoring data" ON public.okrt_monitoring_data FOR SELECT USING (true);
CREATE POLICY "Admin and reviewer can insert okrt monitoring data" ON public.okrt_monitoring_data FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Admin can update all okrt monitoring data" ON public.okrt_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Reviewer can update okrt file info and target dates" ON public.okrt_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'reviewer'::app_role)) WITH CHECK (has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "User can update okrt status and actual dates" ON public.okrt_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'user'::app_role)) WITH CHECK (has_role(auth.uid(), 'user'::app_role));
CREATE POLICY "Approver can update okrt approval status" ON public.okrt_monitoring_data FOR UPDATE USING (has_role(auth.uid(), 'approver'::app_role)) WITH CHECK (has_role(auth.uid(), 'approver'::app_role));
CREATE POLICY "Only admin can delete okrt monitoring data" ON public.okrt_monitoring_data FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_limau_projects_updated_at BEFORE UPDATE ON public.limau_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_limau_monitoring_data_updated_at BEFORE UPDATE ON public.limau_monitoring_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_okrt_projects_updated_at BEFORE UPDATE ON public.okrt_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_okrt_monitoring_data_updated_at BEFORE UPDATE ON public.okrt_monitoring_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();