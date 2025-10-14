-- Create storage bucket for repository files
INSERT INTO storage.buckets (id, name, public)
VALUES ('repository-files', 'repository-files', false);

-- Allow authenticated users to upload files (except viewer role)
CREATE POLICY "Allow upload for non-viewers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'repository-files' 
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

-- Allow authenticated users to view/download files (except viewer role)
CREATE POLICY "Allow download for non-viewers"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'repository-files' 
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

-- Allow users to update their own files (except viewer role)
CREATE POLICY "Allow update own files for non-viewers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repository-files' 
  AND owner = auth.uid()
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

-- Allow users to delete their own files (except viewer role)
CREATE POLICY "Allow delete own files for non-viewers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'repository-files' 
  AND owner = auth.uid()
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
);