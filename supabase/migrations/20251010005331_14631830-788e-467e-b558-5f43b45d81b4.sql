-- Add permission for user role to upload files
DROP POLICY IF EXISTS "Admins can insert files" ON public.files;

CREATE POLICY "Admins and users can insert files" 
ON public.files
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);

-- Allow uploaders to delete their own files
CREATE POLICY "Users can delete their own files" 
ON public.files
FOR DELETE
USING (auth.uid() = uploaded_by);

-- Allow uploaders to update their own files
DROP POLICY IF EXISTS "Reviewers and approvers can update files" ON public.files;

CREATE POLICY "Uploaders can update their own files, reviewers/approvers can update all" 
ON public.files
FOR UPDATE
USING (
  auth.uid() = uploaded_by OR 
  has_role(auth.uid(), 'reviewer'::app_role) OR 
  has_role(auth.uid(), 'approver'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create file_comments table
CREATE TABLE IF NOT EXISTS public.file_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on file_comments
ALTER TABLE public.file_comments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view comments
CREATE POLICY "All authenticated users can view comments" 
ON public.file_comments
FOR SELECT
USING (true);

-- Only admins and approvers can add comments
CREATE POLICY "Admins and approvers can insert comments" 
ON public.file_comments
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'approver'::app_role)
);