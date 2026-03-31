ALTER TYPE public.payroll_run_status ADD VALUE IF NOT EXISTS 'pending_approval' AFTER 'processing';
ALTER TYPE public.payroll_run_status ADD VALUE IF NOT EXISTS 'approved' AFTER 'pending_approval';