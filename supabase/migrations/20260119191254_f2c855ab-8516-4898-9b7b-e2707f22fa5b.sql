-- Add branch branding columns
ALTER TABLE branches ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS custom_styles JSONB DEFAULT '{}';

-- Create branch role restrictions table for org admins to restrict roles per branch
CREATE TABLE IF NOT EXISTS branch_role_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  is_allowed BOOLEAN DEFAULT true,
  restricted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, role)
);

-- Enable RLS
ALTER TABLE branch_role_restrictions ENABLE ROW LEVEL SECURITY;

-- RLS policies for branch_role_restrictions
CREATE POLICY "Org admins can manage branch role restrictions" 
ON branch_role_restrictions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM branches b 
    JOIN profiles p ON p.organization_id = b.organization_id 
    JOIN user_roles ur ON ur.user_id = p.id 
    WHERE b.id = branch_role_restrictions.branch_id 
    AND p.id = auth.uid() 
    AND ur.role IN ('org_admin', 'super_admin')
  )
);

CREATE POLICY "Branch admins can view restrictions for their branch" 
ON branch_role_restrictions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.branch_id = branch_role_restrictions.branch_id
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_branch_role_restrictions_updated_at
BEFORE UPDATE ON branch_role_restrictions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();