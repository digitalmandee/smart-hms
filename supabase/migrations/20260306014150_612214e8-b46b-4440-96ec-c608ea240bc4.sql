
-- Phase 1: NPHIES Transaction Audit Logs table
CREATE TABLE public.nphies_transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  request_payload JSONB,
  response_payload JSONB,
  response_status TEXT,
  error_message TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_nphies_tx_logs_org ON public.nphies_transaction_logs(organization_id);
CREATE INDEX idx_nphies_tx_logs_action ON public.nphies_transaction_logs(action);
CREATE INDEX idx_nphies_tx_logs_created ON public.nphies_transaction_logs(created_at DESC);
CREATE INDEX idx_nphies_tx_logs_claim ON public.nphies_transaction_logs(claim_id);

-- Enable RLS
ALTER TABLE public.nphies_transaction_logs ENABLE ROW LEVEL SECURITY;

-- RLS: org-scoped read for authenticated users
CREATE POLICY "Users can view their organization's transaction logs"
  ON public.nphies_transaction_logs
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- RLS: service role can insert (edge function uses service role)
CREATE POLICY "Service role can insert transaction logs"
  ON public.nphies_transaction_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
