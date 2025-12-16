-- Create prabumulih_monitoring_data table for project-specific document tracking
CREATE TABLE public.prabumulih_monitoring_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.prabumulih_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  status_category status_category NOT NULL DEFAULT 'IFR'::status_category,
  status_description_ifr status_description DEFAULT 'Not Yet'::status_description,
  status_description_ifa status_description DEFAULT 'Not Yet'::status_description,
  status_description_ifb status_description DEFAULT 'Not Yet'::status_description,
  target_submit_ifr TIMESTAMP WITH TIME ZONE,
  target_submit_ifa TIMESTAMP WITH TIME ZONE,
  target_submit_ifb TIMESTAMP WITH TIME ZONE,
  actual_submit_ifr TIMESTAMP WITH TIME ZONE,
  actual_submit_ifa TIMESTAMP WITH TIME ZONE,
  actual_submit_ifb TIMESTAMP WITH TIME ZONE,
  pic TEXT,
  approval_status approval_status NOT NULL DEFAULT 'Pending'::approval_status,
  approval_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prabumulih_monitoring_data ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (same as monitoring_data)
CREATE POLICY "All authenticated users can view prabumulih monitoring data"
ON public.prabumulih_monitoring_data
FOR SELECT
USING (true);

CREATE POLICY "Admin and reviewer can insert prabumulih monitoring data"
ON public.prabumulih_monitoring_data
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reviewer'::app_role));

CREATE POLICY "Admin can update all prabumulih monitoring data"
ON public.prabumulih_monitoring_data
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Reviewer can update file info and target dates"
ON public.prabumulih_monitoring_data
FOR UPDATE
USING (has_role(auth.uid(), 'reviewer'::app_role))
WITH CHECK (has_role(auth.uid(), 'reviewer'::app_role));

CREATE POLICY "User can update status and actual dates"
ON public.prabumulih_monitoring_data
FOR UPDATE
USING (has_role(auth.uid(), 'user'::app_role))
WITH CHECK (has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Approver can update approval status"
ON public.prabumulih_monitoring_data
FOR UPDATE
USING (has_role(auth.uid(), 'approver'::app_role))
WITH CHECK (has_role(auth.uid(), 'approver'::app_role));

CREATE POLICY "Only admin can delete prabumulih monitoring data"
ON public.prabumulih_monitoring_data
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prabumulih_monitoring_data_updated_at
BEFORE UPDATE ON public.prabumulih_monitoring_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();