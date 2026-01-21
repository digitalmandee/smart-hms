-- Add biometric sync logs table
CREATE TABLE IF NOT EXISTS public.biometric_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id UUID REFERENCES biometric_devices(id) ON DELETE SET NULL,
  sync_type TEXT CHECK (sync_type IN ('manual', 'scheduled', 'real-time')) DEFAULT 'manual',
  status TEXT CHECK (status IN ('success', 'failed', 'partial', 'in_progress')) DEFAULT 'in_progress',
  records_synced INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biometric_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sync logs for their organization"
ON public.biometric_sync_logs FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create sync logs for their organization"
ON public.biometric_sync_logs FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update sync logs for their organization"
ON public.biometric_sync_logs FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Add payment tracking to admissions
ALTER TABLE public.admissions
ADD COLUMN IF NOT EXISTS admission_invoice_id UUID REFERENCES invoices(id),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'pay_later', 'waived'));

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_biometric_sync_logs_org ON biometric_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sync_logs_device ON biometric_sync_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_admissions_payment_status ON admissions(payment_status);