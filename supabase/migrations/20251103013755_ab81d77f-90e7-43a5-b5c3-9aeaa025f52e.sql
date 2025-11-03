-- Add reviewer and approver roles to app_role enum if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'reviewer', 'approver');
  ELSE
    -- Add new enum values if they don't exist
    BEGIN
      ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'reviewer';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'approver';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Add approval_comment column to monitoring_data table
ALTER TABLE public.monitoring_data 
ADD COLUMN IF NOT EXISTS approval_comment text;

-- Drop existing policies on monitoring_data
DROP POLICY IF EXISTS "Admin and user roles can insert monitoring data" ON public.monitoring_data;
DROP POLICY IF EXISTS "Admin and user roles can update monitoring data" ON public.monitoring_data;
DROP POLICY IF EXISTS "All authenticated users can view monitoring data" ON public.monitoring_data;
DROP POLICY IF EXISTS "Only admins can delete monitoring data" ON public.monitoring_data;

-- Create new granular RLS policies

-- SELECT: All authenticated users can view
CREATE POLICY "All authenticated users can view monitoring data"
ON public.monitoring_data
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Admin and Reviewer can insert
CREATE POLICY "Admin and reviewer can insert monitoring data"
ON public.monitoring_data
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'reviewer'::app_role)
);

-- UPDATE: Admin can update everything
CREATE POLICY "Admin can update all monitoring data"
ON public.monitoring_data
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE: Reviewer can update file_name, pic, target_submit fields
CREATE POLICY "Reviewer can update file info and target dates"
ON public.monitoring_data
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'reviewer'::app_role))
WITH CHECK (has_role(auth.uid(), 'reviewer'::app_role));

-- UPDATE: User can update status descriptions and actual submit dates
CREATE POLICY "User can update status and actual dates"
ON public.monitoring_data
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'user'::app_role))
WITH CHECK (has_role(auth.uid(), 'user'::app_role));

-- UPDATE: Approver can update approval_status and approval_comment
CREATE POLICY "Approver can update approval status"
ON public.monitoring_data
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'approver'::app_role))
WITH CHECK (has_role(auth.uid(), 'approver'::app_role));

-- DELETE: Only admin can delete
CREATE POLICY "Only admin can delete monitoring data"
ON public.monitoring_data
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));