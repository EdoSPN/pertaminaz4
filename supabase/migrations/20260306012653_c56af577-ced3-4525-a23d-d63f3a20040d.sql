
-- Drop existing update policy
DROP POLICY IF EXISTS "Admin and reviewer can update projects" ON public.prabumulih_projects;

-- Create new update policy allowing all roles except viewer
CREATE POLICY "All roles except viewer can update projects"
ON public.prabumulih_projects
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'reviewer'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role) OR 
  has_role(auth.uid(), 'approver'::app_role)
);
