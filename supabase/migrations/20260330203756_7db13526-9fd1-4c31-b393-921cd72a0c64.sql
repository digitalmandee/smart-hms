ALTER TABLE public.dialysis_sessions
  ADD COLUMN IF NOT EXISTS blood_flow_rate INTEGER,
  ADD COLUMN IF NOT EXISTS dialysate_flow_rate INTEGER,
  ADD COLUMN IF NOT EXISTS dialyzer_type TEXT,
  ADD COLUMN IF NOT EXISTS heparin_dose TEXT;