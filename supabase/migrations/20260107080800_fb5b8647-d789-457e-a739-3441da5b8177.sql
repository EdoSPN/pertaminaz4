-- Create chart_datasets table for storing user datasets
CREATE TABLE public.chart_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  columns JSONB NOT NULL DEFAULT '[]',
  data JSONB NOT NULL DEFAULT '[]',
  x_axis TEXT,
  y_axis TEXT,
  chart_type TEXT DEFAULT 'line',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_datasets ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own datasets
CREATE POLICY "Users can view own datasets" ON public.chart_datasets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create datasets" ON public.chart_datasets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own datasets" ON public.chart_datasets
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own datasets" ON public.chart_datasets
  FOR DELETE USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_chart_datasets_updated_at
  BEFORE UPDATE ON public.chart_datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();