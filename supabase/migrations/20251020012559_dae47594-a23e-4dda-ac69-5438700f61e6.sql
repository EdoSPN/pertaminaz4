-- Add separate status description columns for each status category
ALTER TABLE public.monitoring_data 
ADD COLUMN status_description_ifr status_description DEFAULT 'Not Yet'::status_description,
ADD COLUMN status_description_ifa status_description DEFAULT 'Not Yet'::status_description,
ADD COLUMN status_description_ifb status_description DEFAULT 'Not Yet'::status_description;

-- Migrate existing status_description data to all three new columns
UPDATE public.monitoring_data 
SET 
  status_description_ifr = status_description,
  status_description_ifa = status_description,
  status_description_ifb = status_description;

-- Drop the old status_description column
ALTER TABLE public.monitoring_data DROP COLUMN status_description;