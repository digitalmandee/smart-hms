ALTER TABLE public.employee_salaries
  ADD COLUMN IF NOT EXISTS revision_reason text,
  ADD COLUMN IF NOT EXISTS revision_notes text;