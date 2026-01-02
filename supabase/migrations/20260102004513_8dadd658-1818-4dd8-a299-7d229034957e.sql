-- Add finished_at column to all Area 2 project tables
ALTER TABLE public.limau_projects ADD COLUMN finished_at timestamp with time zone;
ALTER TABLE public.okrt_projects ADD COLUMN finished_at timestamp with time zone;
ALTER TABLE public.prabumulih_projects ADD COLUMN finished_at timestamp with time zone;