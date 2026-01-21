-- Create audit log table for daily room charge postings
CREATE TABLE IF NOT EXISTS public.ipd_daily_charge_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  total_admissions INT DEFAULT 0,
  charges_posted INT DEFAULT 0,
  skipped INT DEFAULT 0,
  errors INT DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ipd_daily_charge_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for organization access
CREATE POLICY "Users can view their organization's charge logs"
  ON public.ipd_daily_charge_logs
  FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Create index for efficient queries
CREATE INDEX idx_ipd_daily_charge_logs_org_date 
  ON public.ipd_daily_charge_logs(organization_id, run_date DESC);

-- Enable pg_net extension for HTTP calls from pg_cron
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;