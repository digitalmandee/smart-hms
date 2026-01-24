-- Add missing specialized roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ot_pharmacist';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'opd_nurse';