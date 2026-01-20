-- =============================================
-- DYNAMIC CONFIGURATION TABLES FOR ALL MODULES
-- =============================================

-- IPD Configuration Tables
-- -------------------------

-- Admission Types
CREATE TABLE IF NOT EXISTS public.config_admission_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-blue-100 text-blue-800',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Discharge Types
CREATE TABLE IF NOT EXISTS public.config_discharge_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-green-100 text-green-800',
  requires_reason BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Transfer Reasons
CREATE TABLE IF NOT EXISTS public.config_transfer_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Condition Statuses (for daily rounds)
CREATE TABLE IF NOT EXISTS public.config_condition_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  severity_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Emergency Module Configuration Tables
-- -------------------------------------

-- Arrival Modes
CREATE TABLE IF NOT EXISTS public.config_arrival_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Triage Levels
CREATE TABLE IF NOT EXISTS public.config_triage_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  zone TEXT,
  max_wait_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, level)
);

-- ER Zones
CREATE TABLE IF NOT EXISTS public.config_er_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-blue-100 text-blue-800',
  capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Radiology Configuration Tables
-- -------------------------------

-- Imaging Priorities
CREATE TABLE IF NOT EXISTS public.config_imaging_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  max_wait_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Imaging Modalities
CREATE TABLE IF NOT EXISTS public.config_imaging_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Enable RLS on all config tables
ALTER TABLE public.config_admission_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_discharge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_transfer_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_condition_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_arrival_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_triage_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_er_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_imaging_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_imaging_modalities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for all config tables (users can view their org's config)
CREATE POLICY "Users can view their org config_admission_types" ON public.config_admission_types
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_admission_types" ON public.config_admission_types
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_discharge_types" ON public.config_discharge_types
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_discharge_types" ON public.config_discharge_types
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_transfer_reasons" ON public.config_transfer_reasons
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_transfer_reasons" ON public.config_transfer_reasons
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_condition_statuses" ON public.config_condition_statuses
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_condition_statuses" ON public.config_condition_statuses
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_arrival_modes" ON public.config_arrival_modes
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_arrival_modes" ON public.config_arrival_modes
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_triage_levels" ON public.config_triage_levels
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_triage_levels" ON public.config_triage_levels
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_er_zones" ON public.config_er_zones
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_er_zones" ON public.config_er_zones
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_imaging_priorities" ON public.config_imaging_priorities
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_imaging_priorities" ON public.config_imaging_priorities
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can view their org config_imaging_modalities" ON public.config_imaging_modalities
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Admins can manage config_imaging_modalities" ON public.config_imaging_modalities
  FOR ALL USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Create updated_at triggers for all config tables
CREATE TRIGGER update_config_admission_types_updated_at
  BEFORE UPDATE ON public.config_admission_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_discharge_types_updated_at
  BEFORE UPDATE ON public.config_discharge_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_transfer_reasons_updated_at
  BEFORE UPDATE ON public.config_transfer_reasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_condition_statuses_updated_at
  BEFORE UPDATE ON public.config_condition_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_arrival_modes_updated_at
  BEFORE UPDATE ON public.config_arrival_modes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_triage_levels_updated_at
  BEFORE UPDATE ON public.config_triage_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_er_zones_updated_at
  BEFORE UPDATE ON public.config_er_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_imaging_priorities_updated_at
  BEFORE UPDATE ON public.config_imaging_priorities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_imaging_modalities_updated_at
  BEFORE UPDATE ON public.config_imaging_modalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();