-- Table for storing uploaded files
CREATE TABLE public.document_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitoring_data_id UUID NOT NULL REFERENCES prabumulih_monitoring_data(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status_category TEXT NOT NULL CHECK (status_category IN ('IFR', 'IFA', 'IFB'))
);

-- Table for tracking download/upload logs
CREATE TABLE public.document_file_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_file_id UUID REFERENCES document_files(id) ON DELETE SET NULL,
  monitoring_data_id UUID NOT NULL REFERENCES prabumulih_monitoring_data(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('upload', 'download')),
  user_id UUID NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  status_category TEXT NOT NULL CHECK (status_category IN ('IFR', 'IFA', 'IFB'))
);

-- Enable RLS
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_file_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_files
CREATE POLICY "All authenticated users can view document files"
  ON public.document_files FOR SELECT USING (true);

CREATE POLICY "Users can upload document files"
  ON public.document_files FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files or admin"
  ON public.document_files FOR DELETE
  USING (auth.uid() = uploaded_by OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for document_file_logs
CREATE POLICY "All authenticated users can view logs"
  ON public.document_file_logs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert logs"
  ON public.document_file_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-tracking-files', 'document-tracking-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
CREATE POLICY "Authenticated users can upload to document-tracking-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document-tracking-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read from document-tracking-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-tracking-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files from document-tracking-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'document-tracking-files' AND (storage.foldername(name))[1] = auth.uid()::text);