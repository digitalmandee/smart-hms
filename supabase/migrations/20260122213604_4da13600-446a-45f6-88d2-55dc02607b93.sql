-- Assign all employees who don't have a current shift to General Duty (24 Hours)
INSERT INTO shift_assignments (employee_id, shift_id, effective_from, is_current)
SELECT 
  e.id,
  s.id,
  CURRENT_DATE,
  true
FROM employees e
JOIN shifts s ON s.organization_id = e.organization_id AND s.code = 'GD24'
WHERE NOT EXISTS (
  SELECT 1 FROM shift_assignments sa 
  WHERE sa.employee_id = e.id AND sa.is_current = true
);

-- Also update the employee's shift_id field for quick reference
UPDATE employees e
SET shift_id = s.id
FROM shifts s
WHERE s.organization_id = e.organization_id 
  AND s.code = 'GD24'
  AND e.shift_id IS NULL;

-- Create roster_publish_status table for publishing workflow
CREATE TABLE IF NOT EXISTS roster_publish_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  roster_type VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, branch_id, week_start, roster_type, department_id)
);

-- Enable RLS
ALTER TABLE roster_publish_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for roster_publish_status
CREATE POLICY "Users can view roster status in their organization"
  ON roster_publish_status FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage roster status in their organization"
  ON roster_publish_status FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));