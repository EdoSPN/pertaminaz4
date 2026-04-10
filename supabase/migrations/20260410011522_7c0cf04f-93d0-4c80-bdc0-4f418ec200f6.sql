
CREATE TABLE public.file_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_file_id uuid NOT NULL REFERENCES public.document_files(id) ON DELETE CASCADE,
  page_number integer NOT NULL DEFAULT 1,
  annotation_type text NOT NULL,
  data jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.file_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view annotations"
  ON public.file_annotations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own annotations"
  ON public.file_annotations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own annotations"
  ON public.file_annotations FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own annotations"
  ON public.file_annotations FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any annotation"
  ON public.file_annotations FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_file_annotations_updated_at
  BEFORE UPDATE ON public.file_annotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
