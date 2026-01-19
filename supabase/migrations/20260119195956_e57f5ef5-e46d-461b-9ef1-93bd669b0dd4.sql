-- =====================================================
-- Dynamic IPD Configuration Tables (Complete)
-- =====================================================

-- 1. IPD Bed Types
CREATE TABLE IF NOT EXISTS public.ipd_bed_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  daily_rate NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 2. IPD Bed Features
CREATE TABLE IF NOT EXISTS public.ipd_bed_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 3. IPD Ward Types
CREATE TABLE IF NOT EXISTS public.ipd_ward_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 4. IPD Floors/Buildings
CREATE TABLE IF NOT EXISTS public.ipd_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  building TEXT NOT NULL,
  floor_name TEXT NOT NULL,
  floor_number INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, branch_id, building, floor_name)
);

-- =====================================================
-- Enable RLS
-- =====================================================
ALTER TABLE public.ipd_bed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_bed_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_ward_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_floors ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies - Bed Types
-- =====================================================
DROP POLICY IF EXISTS "Users can view own org bed types" ON public.ipd_bed_types;
DROP POLICY IF EXISTS "Users can insert own org bed types" ON public.ipd_bed_types;
DROP POLICY IF EXISTS "Users can update own org bed types" ON public.ipd_bed_types;
DROP POLICY IF EXISTS "Users can delete own org bed types" ON public.ipd_bed_types;

CREATE POLICY "Users can view own org bed types" ON public.ipd_bed_types
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can insert own org bed types" ON public.ipd_bed_types
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can update own org bed types" ON public.ipd_bed_types
  FOR UPDATE USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can delete own org bed types" ON public.ipd_bed_types
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- RLS Policies - Bed Features
-- =====================================================
DROP POLICY IF EXISTS "Users can view own org bed features" ON public.ipd_bed_features;
DROP POLICY IF EXISTS "Users can insert own org bed features" ON public.ipd_bed_features;
DROP POLICY IF EXISTS "Users can update own org bed features" ON public.ipd_bed_features;
DROP POLICY IF EXISTS "Users can delete own org bed features" ON public.ipd_bed_features;

CREATE POLICY "Users can view own org bed features" ON public.ipd_bed_features
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can insert own org bed features" ON public.ipd_bed_features
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can update own org bed features" ON public.ipd_bed_features
  FOR UPDATE USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can delete own org bed features" ON public.ipd_bed_features
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- RLS Policies - Ward Types
-- =====================================================
DROP POLICY IF EXISTS "Users can view own org ward types" ON public.ipd_ward_types;
DROP POLICY IF EXISTS "Users can insert own org ward types" ON public.ipd_ward_types;
DROP POLICY IF EXISTS "Users can update own org ward types" ON public.ipd_ward_types;
DROP POLICY IF EXISTS "Users can delete own org ward types" ON public.ipd_ward_types;

CREATE POLICY "Users can view own org ward types" ON public.ipd_ward_types
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can insert own org ward types" ON public.ipd_ward_types
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can update own org ward types" ON public.ipd_ward_types
  FOR UPDATE USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can delete own org ward types" ON public.ipd_ward_types
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- RLS Policies - Floors
-- =====================================================
DROP POLICY IF EXISTS "Users can view own org floors" ON public.ipd_floors;
DROP POLICY IF EXISTS "Users can insert own org floors" ON public.ipd_floors;
DROP POLICY IF EXISTS "Users can update own org floors" ON public.ipd_floors;
DROP POLICY IF EXISTS "Users can delete own org floors" ON public.ipd_floors;

CREATE POLICY "Users can view own org floors" ON public.ipd_floors
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can insert own org floors" ON public.ipd_floors
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can update own org floors" ON public.ipd_floors
  FOR UPDATE USING (organization_id = public.get_user_organization_id());
CREATE POLICY "Users can delete own org floors" ON public.ipd_floors
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- Triggers for updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_ipd_bed_types_updated_at ON public.ipd_bed_types;
DROP TRIGGER IF EXISTS update_ipd_bed_features_updated_at ON public.ipd_bed_features;
DROP TRIGGER IF EXISTS update_ipd_ward_types_updated_at ON public.ipd_ward_types;
DROP TRIGGER IF EXISTS update_ipd_floors_updated_at ON public.ipd_floors;

CREATE TRIGGER update_ipd_bed_types_updated_at
  BEFORE UPDATE ON public.ipd_bed_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ipd_bed_features_updated_at
  BEFORE UPDATE ON public.ipd_bed_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ipd_ward_types_updated_at
  BEFORE UPDATE ON public.ipd_ward_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ipd_floors_updated_at
  BEFORE UPDATE ON public.ipd_floors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Add IPD Setup Permission and Menu Items
-- =====================================================

-- Add the permission
INSERT INTO public.permissions (code, name, description, module)
VALUES ('ipd.setup.manage', 'Manage IPD Setup', 'Configure bed types, ward types, features, and floors', 'ipd')
ON CONFLICT (code) DO NOTHING;

-- Grant to org_admin and branch_admin
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'org_admin', id, true FROM public.permissions WHERE code = 'ipd.setup.manage'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin', id, true FROM public.permissions WHERE code = 'ipd.setup.manage'
ON CONFLICT DO NOTHING;

-- Get IPD parent menu ID and insert setup submenu
DO $$
DECLARE
  v_ipd_parent_id UUID;
  v_setup_parent_id UUID;
BEGIN
  SELECT id INTO v_ipd_parent_id FROM public.menu_items WHERE code = 'ipd' LIMIT 1;
  
  IF v_ipd_parent_id IS NOT NULL THEN
    INSERT INTO public.menu_items (name, code, path, icon, parent_id, sort_order, required_permission, is_active)
    VALUES ('IPD Setup', 'ipd.setup', NULL, 'Settings2', v_ipd_parent_id, 90, 'ipd.setup.manage', true)
    ON CONFLICT (code) DO UPDATE SET parent_id = v_ipd_parent_id, is_active = true
    RETURNING id INTO v_setup_parent_id;
    
    INSERT INTO public.menu_items (name, code, path, icon, parent_id, sort_order, required_permission, is_active) VALUES
      ('Ward Types', 'ipd.setup.ward_types', '/app/ipd/setup/ward-types', 'Building2', v_setup_parent_id, 1, 'ipd.setup.manage', true),
      ('Bed Types', 'ipd.setup.bed_types', '/app/ipd/setup/bed-types', 'BedDouble', v_setup_parent_id, 2, 'ipd.setup.manage', true),
      ('Bed Features', 'ipd.setup.bed_features', '/app/ipd/setup/bed-features', 'Sparkles', v_setup_parent_id, 3, 'ipd.setup.manage', true),
      ('Floors & Buildings', 'ipd.setup.floors', '/app/ipd/setup/floors', 'Layers', v_setup_parent_id, 4, 'ipd.setup.manage', true)
    ON CONFLICT (code) DO UPDATE SET parent_id = EXCLUDED.parent_id, is_active = true;
  END IF;
END $$;

-- =====================================================
-- Seed Default Data
-- =====================================================

-- Seed Bed Types
INSERT INTO public.ipd_bed_types (organization_id, name, code, description, sort_order)
SELECT o.id, bt.name, bt.code, bt.description, bt.sort_order
FROM public.organizations o
CROSS JOIN (VALUES
  ('Standard', 'standard', 'Regular hospital bed', 1),
  ('Semi-Fowler', 'semi_fowler', 'Adjustable backrest bed', 2),
  ('Fowler', 'fowler', 'Fully adjustable bed', 3),
  ('ICU Bed', 'icu', 'Intensive care unit bed with monitoring', 4),
  ('Electric', 'electric', 'Electrically adjustable bed', 5),
  ('Bariatric', 'bariatric', 'Heavy-duty bed for larger patients', 6),
  ('Pediatric', 'pediatric', 'Specialized bed for children', 7),
  ('Crib', 'crib', 'Infant crib/cot', 8)
) AS bt(name, code, description, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Seed Bed Features
INSERT INTO public.ipd_bed_features (organization_id, name, code, description, icon, sort_order)
SELECT o.id, bf.name, bf.code, bf.description, bf.icon, bf.sort_order
FROM public.organizations o
CROSS JOIN (VALUES
  ('Oxygen Supply', 'oxygen_supply', 'Central oxygen supply connection', 'Wind', 1),
  ('Suction', 'suction', 'Suction apparatus connection', 'Droplets', 2),
  ('Cardiac Monitor', 'cardiac_monitor', 'Cardiac monitoring equipment', 'Heart', 3),
  ('Ventilator Ready', 'ventilator_ready', 'Ventilator connection available', 'Activity', 4),
  ('IV Stand', 'iv_stand', 'Intravenous fluid stand', 'Pill', 5),
  ('Call Bell', 'call_bell', 'Nurse call system', 'Bell', 6),
  ('AC', 'ac', 'Air conditioning', 'Snowflake', 7),
  ('Attached Bathroom', 'attached_bathroom', 'Private bathroom facility', 'Bath', 8)
) AS bf(name, code, description, icon, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Seed Ward Types
INSERT INTO public.ipd_ward_types (organization_id, name, code, description, color, sort_order)
SELECT o.id, wt.name, wt.code, wt.description, wt.color, wt.sort_order
FROM public.organizations o
CROSS JOIN (VALUES
  ('General Ward', 'general', 'Standard shared ward', '#6B7280', 1),
  ('Semi-Private', 'semi_private', 'Shared room with 2-3 beds', '#3B82F6', 2),
  ('Private Room', 'private', 'Single occupancy room', '#8B5CF6', 3),
  ('Deluxe Room', 'deluxe', 'Premium single room with amenities', '#EC4899', 4),
  ('VIP Suite', 'vip', 'Luxury suite with full amenities', '#F59E0B', 5),
  ('ICU', 'icu', 'Intensive Care Unit', '#EF4444', 6),
  ('NICU', 'nicu', 'Neonatal Intensive Care Unit', '#F97316', 7),
  ('CCU', 'ccu', 'Cardiac Care Unit', '#DC2626', 8),
  ('HDU', 'hdu', 'High Dependency Unit', '#D97706', 9),
  ('Isolation', 'isolation', 'Isolation ward for infectious patients', '#7C3AED', 10),
  ('Maternity', 'maternity', 'Obstetrics and Gynecology ward', '#DB2777', 11),
  ('Pediatric', 'pediatric', 'Childrens ward', '#10B981', 12),
  ('Emergency', 'emergency', 'Emergency observation ward', '#F43F5E', 13)
) AS wt(name, code, description, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Seed Floors for organizations with branches
INSERT INTO public.ipd_floors (organization_id, branch_id, building, floor_name, floor_number, sort_order)
SELECT DISTINCT 
  b.organization_id,
  b.id,
  'Main Building',
  f.floor_name,
  f.floor_number,
  f.sort_order
FROM public.branches b
CROSS JOIN (VALUES
  ('Ground Floor', 0, 1),
  ('1st Floor', 1, 2),
  ('2nd Floor', 2, 3),
  ('3rd Floor', 3, 4)
) AS f(floor_name, floor_number, sort_order)
ON CONFLICT (organization_id, branch_id, building, floor_name) DO NOTHING;