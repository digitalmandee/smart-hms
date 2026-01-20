-- Patient Demographics Configuration Tables

-- Cities/Locations
CREATE TABLE config_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  province TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Languages
CREATE TABLE config_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Occupations
CREATE TABLE config_occupations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relations (for emergency contacts/NOK)
CREATE TABLE config_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Referral Sources
CREATE TABLE config_referral_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance Providers
CREATE TABLE config_insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_number TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diet Types for IPD
CREATE TABLE config_diet_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nurse Specializations
CREATE TABLE config_nurse_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document Categories for HR
CREATE TABLE config_document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document Types for HR
CREATE TABLE config_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES config_document_categories(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  requires_expiry BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE config_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_referral_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_diet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_nurse_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_document_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for all config tables
CREATE POLICY "Users can view org config_cities" ON config_cities FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_cities" ON config_cities FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_languages" ON config_languages FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_languages" ON config_languages FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_occupations" ON config_occupations FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_occupations" ON config_occupations FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_relations" ON config_relations FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_relations" ON config_relations FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_referral_sources" ON config_referral_sources FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_referral_sources" ON config_referral_sources FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_insurance_providers" ON config_insurance_providers FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_insurance_providers" ON config_insurance_providers FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_diet_types" ON config_diet_types FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_diet_types" ON config_diet_types FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_nurse_specializations" ON config_nurse_specializations FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_nurse_specializations" ON config_nurse_specializations FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_document_categories" ON config_document_categories FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_document_categories" ON config_document_categories FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view org config_document_types" ON config_document_types FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can manage org config_document_types" ON config_document_types FOR ALL USING (organization_id = get_user_organization_id());