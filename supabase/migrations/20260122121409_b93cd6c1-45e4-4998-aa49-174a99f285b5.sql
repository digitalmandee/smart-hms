-- Phase 1: Fix RLS policy for service_types to allow branch_admin
DROP POLICY IF EXISTS "Org admins can manage service types" ON service_types;
DROP POLICY IF EXISTS "Admins can manage service types" ON service_types;

CREATE POLICY "Admins can manage service types" ON service_types
FOR ALL
USING (
  organization_id = get_user_organization_id() 
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'branch_admin')
  )
)
WITH CHECK (
  organization_id = get_user_organization_id() 
  AND (
    has_role(auth.uid(), 'org_admin') 
    OR has_role(auth.uid(), 'branch_admin')
  )
);

-- Phase 2: Create editable service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT 'gray',
  sort_order INT DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view categories in their org" ON service_categories
FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage categories" ON service_categories
FOR ALL USING (
  organization_id = get_user_organization_id() 
  AND (has_role(auth.uid(), 'org_admin') OR has_role(auth.uid(), 'branch_admin'))
)
WITH CHECK (
  organization_id = get_user_organization_id() 
  AND (has_role(auth.uid(), 'org_admin') OR has_role(auth.uid(), 'branch_admin'))
);

-- Seed default categories for existing organizations
INSERT INTO service_categories (organization_id, code, name, icon, color, sort_order, is_system)
SELECT 
  o.id,
  cat.code,
  cat.name,
  cat.icon,
  cat.color,
  cat.sort_order,
  true
FROM organizations o
CROSS JOIN (
  VALUES 
    ('consultation', 'Consultation', 'stethoscope', 'blue', 1),
    ('procedure', 'Procedure', 'syringe', 'purple', 2),
    ('lab', 'Lab Test', 'flask-conical', 'orange', 3),
    ('radiology', 'Radiology', 'scan', 'pink', 4),
    ('pharmacy', 'Pharmacy', 'pill', 'green', 5),
    ('room', 'Room Charges', 'building', 'cyan', 6),
    ('other', 'Other', 'more-horizontal', 'gray', 7)
) AS cat(code, name, icon, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Add category_id column to service_types for future foreign key reference
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id);

-- Backfill category_id from existing category enum
UPDATE service_types st
SET category_id = sc.id
FROM service_categories sc
WHERE sc.organization_id = st.organization_id
  AND sc.code = st.category::text
  AND st.category_id IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();