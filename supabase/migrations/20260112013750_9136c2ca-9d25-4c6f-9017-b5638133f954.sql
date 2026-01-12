-- Configure storage bucket with file size limit and allowed MIME types
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'repository-files';