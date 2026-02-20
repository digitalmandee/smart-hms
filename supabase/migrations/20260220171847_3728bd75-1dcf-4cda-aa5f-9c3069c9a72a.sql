
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse_user';
