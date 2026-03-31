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