-- Create surgery_reschedule_requests table
CREATE TABLE IF NOT EXISTS surgery_reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID REFERENCES surgeries(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES profiles(id) NOT NULL,
  requested_by_role TEXT NOT NULL,
  original_date DATE NOT NULL,
  original_time TIME NOT NULL,
  proposed_date DATE,
  proposed_time TIME,
  reason TEXT NOT NULL,
  reason_category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE surgery_reschedule_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view reschedule requests in their organization"
ON surgery_reschedule_requests FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create reschedule requests in their organization"
ON surgery_reschedule_requests FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update reschedule requests in their organization"
ON surgery_reschedule_requests FOR UPDATE
USING (organization_id = public.get_user_organization_id());