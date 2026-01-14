-- Add field column to prabumulih_monitoring_data table
ALTER TABLE prabumulih_monitoring_data 
ADD COLUMN field text DEFAULT 'Prabumulih';

-- Add check constraint for valid field values
ALTER TABLE prabumulih_monitoring_data 
ADD CONSTRAINT check_field_values 
CHECK (field IN ('Limau', 'OK - RT', 'Prabumulih'));