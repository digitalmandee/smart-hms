-- Create bed issue logs table for tracking maintenance and issues
CREATE TABLE public.bed_issue_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('maintenance', 'housekeeping', 'damage', 'equipment', 'cleaning', 'other')),
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  reported_by UUID REFERENCES public.profiles(id),
  reported_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bed_issue_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view bed issue logs in their organization"
ON public.bed_issue_logs
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create bed issue logs in their organization"
ON public.bed_issue_logs
FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update bed issue logs in their organization"
ON public.bed_issue_logs
FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_bed_issue_logs_bed_id ON public.bed_issue_logs(bed_id);
CREATE INDEX idx_bed_issue_logs_organization_id ON public.bed_issue_logs(organization_id);
CREATE INDEX idx_bed_issue_logs_reported_at ON public.bed_issue_logs(reported_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_bed_issue_logs_updated_at
BEFORE UPDATE ON public.bed_issue_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();