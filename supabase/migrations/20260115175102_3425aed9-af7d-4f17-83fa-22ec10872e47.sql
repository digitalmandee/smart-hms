-- Add new specialized roles to app_role enum
-- These must be added one at a time outside a transaction, but this migration system handles it
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'blood_bank_technician';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'radiologist';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'radiology_technician';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ipd_nurse';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ot_technician';