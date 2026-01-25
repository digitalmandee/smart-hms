-- Add missing surgery status enum values
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'requested' AND enumtypid = 'surgery_status'::regtype) THEN
    ALTER TYPE surgery_status ADD VALUE 'requested' BEFORE 'booked';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'on_hold' AND enumtypid = 'surgery_status'::regtype) THEN
    ALTER TYPE surgery_status ADD VALUE 'on_hold' AFTER 'confirmed';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ready' AND enumtypid = 'surgery_status'::regtype) THEN
    ALTER TYPE surgery_status ADD VALUE 'ready' AFTER 'pre_op';
  END IF;
END $$;

-- Create surgery reschedule requests table
CREATE TABLE IF NOT EXISTS surgery_reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_by_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  reason_category TEXT,
  original_date DATE,
  original_time TIME,
  proposed_date DATE,
  proposed_time TIME,
  postpone_days INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE surgery_reschedule_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view org reschedule requests" 
ON surgery_reschedule_requests FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Clinical staff can create reschedule requests" 
ON surgery_reschedule_requests FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Authorized users can update requests" 
ON surgery_reschedule_requests FOR UPDATE 
USING (organization_id = get_user_organization_id());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_surgery ON surgery_reschedule_requests(surgery_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_status ON surgery_reschedule_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_org ON surgery_reschedule_requests(organization_id);