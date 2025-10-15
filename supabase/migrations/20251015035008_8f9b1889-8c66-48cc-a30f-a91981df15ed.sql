-- Create enum types for monitoring data
CREATE TYPE public.status_category AS ENUM ('IFR', 'IFA', 'IFB');
CREATE TYPE public.status_description AS ENUM ('Not Yet', 'In-Progress', 'Complete');
CREATE TYPE public.approval_status AS ENUM ('Approved', 'Denied', 'Pending');

-- Create monitoring_data table
CREATE TABLE public.monitoring_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  status_category status_category NOT NULL DEFAULT 'IFR',
  status_description status_description NOT NULL DEFAULT 'Not Yet',
  pic TEXT,
  target_submit_ifr TIMESTAMP WITH TIME ZONE,
  target_submit_ifa TIMESTAMP WITH TIME ZONE,
  target_submit_ifb TIMESTAMP WITH TIME ZONE,
  actual_submit_ifr TIMESTAMP WITH TIME ZONE,
  actual_submit_ifa TIMESTAMP WITH TIME ZONE,
  actual_submit_ifb TIMESTAMP WITH TIME ZONE,
  approval_status approval_status NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitoring_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated users can view monitoring data"
  ON public.monitoring_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and user roles can insert monitoring data"
  ON public.monitoring_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'user'::app_role)
  );

CREATE POLICY "Admin and user roles can update monitoring data"
  ON public.monitoring_data
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'user'::app_role)
  );

CREATE POLICY "Only admins can delete monitoring data"
  ON public.monitoring_data
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_monitoring_data_updated_at
  BEFORE UPDATE ON public.monitoring_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();