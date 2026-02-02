-- Add discipline column to prabumulih_monitoring_data table
ALTER TABLE prabumulih_monitoring_data 
ADD COLUMN discipline TEXT DEFAULT NULL;