-- Table: notification_logs - Track sent notifications
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'overdue_invoice', 'appointment_reminder'
  reference_id UUID NOT NULL, -- invoice_id or appointment_id
  recipient_email TEXT,
  recipient_phone TEXT,
  channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp'
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX idx_notification_logs_reference ON public.notification_logs(reference_id, notification_type);
CREATE INDEX idx_notification_logs_org ON public.notification_logs(organization_id, created_at);
CREATE INDEX idx_notification_logs_type_status ON public.notification_logs(notification_type, status);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's notification logs"
  ON public.notification_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "System can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (true);

-- Add API integration settings to system_settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, is_editable)
VALUES 
  ('resend_api_key', NULL, 'string', 'Resend API key for email notifications', true),
  ('sms_provider', NULL, 'string', 'SMS provider name (twilio, messagebird, etc.)', true),
  ('sms_api_key', NULL, 'string', 'SMS provider API key', true),
  ('notification_from_email', 'noreply@clinic.com', 'string', 'Email address used as sender for notifications', true)
ON CONFLICT (setting_key) DO NOTHING;