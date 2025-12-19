-- Add document_number column to all monitoring data tables
ALTER TABLE limau_monitoring_data ADD COLUMN document_number text;
ALTER TABLE okrt_monitoring_data ADD COLUMN document_number text;
ALTER TABLE prabumulih_monitoring_data ADD COLUMN document_number text;
ALTER TABLE monitoring_data ADD COLUMN document_number text;