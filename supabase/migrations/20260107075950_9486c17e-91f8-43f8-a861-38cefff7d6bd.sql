
-- ============================================
-- PHASE 1: COMPLETE DATABASE SCHEMA
-- Smart Hospital Management System (SaaS)
-- ============================================

-- 1. ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'org_admin',
  'branch_admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'lab_technician',
  'accountant'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trial',
  'active',
  'suspended',
  'cancelled'
);

CREATE TYPE public.subscription_plan AS ENUM (
  'basic',
  'professional',
  'enterprise'
);

CREATE TYPE public.gender AS ENUM (
  'male',
  'female',
  'other'
);

CREATE TYPE public.appointment_status AS ENUM (
  'scheduled',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE public.appointment_type AS ENUM (
  'walk_in',
  'scheduled',
  'follow_up'
);

CREATE TYPE public.medicine_unit AS ENUM (
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'cream',
  'drops',
  'inhaler',
  'powder',
  'gel',
  'ointment'
);

CREATE TYPE public.prescription_status AS ENUM (
  'created',
  'dispensed',
  'partially_dispensed',
  'cancelled'
);

CREATE TYPE public.invoice_status AS ENUM (
  'draft',
  'pending',
  'partially_paid',
  'paid',
  'cancelled',
  'refunded'
);

CREATE TYPE public.service_category AS ENUM (
  'consultation',
  'procedure',
  'lab',
  'pharmacy',
  'room',
  'other'
);

CREATE TYPE public.medical_history_type AS ENUM (
  'allergy',
  'chronic_disease',
  'surgery',
  'medication',
  'family_history'
);

CREATE TYPE public.notification_channel AS ENUM (
  'sms',
  'email',
  'whatsapp'
);

CREATE TYPE public.setting_type AS ENUM (
  'string',
  'number',
  'boolean',
  'json'
);

CREATE TYPE public.field_type AS ENUM (
  'text',
  'number',
  'date',
  'select',
  'checkbox',
  'textarea',
  'email',
  'phone'
);

-- 2. CORE TABLES
-- ============================================

-- 2.1 Organizations (Tenants)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_number TEXT,
  subscription_status subscription_status DEFAULT 'trial',
  subscription_plan subscription_plan DEFAULT 'basic',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.2 Branches
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  is_main_branch BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

-- 2.3 User Roles (Security Table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- 2.4 Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. PERMISSIONS & MENU SYSTEM
-- ============================================

-- 3.1 Permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 Role Permissions (per organization customizable)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  is_granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, role, permission_id)
);

-- 3.3 Menu Items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  path TEXT,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  required_permission TEXT,
  required_module TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. SETTINGS TABLES
-- ============================================

-- 4.1 System Settings (Platform-wide)
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type setting_type DEFAULT 'string',
  description TEXT,
  is_editable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4.2 Organization Settings
CREATE TABLE public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type setting_type DEFAULT 'string',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, setting_key)
);

-- 4.3 Branch Settings
CREATE TABLE public.branch_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type setting_type DEFAULT 'string',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(branch_id, setting_key)
);

-- 4.4 Organization Modules
CREATE TABLE public.organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  module_code TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMPTZ DEFAULT now(),
  enabled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, module_code)
);

-- 5. PATIENT MANAGEMENT
-- ============================================

-- 5.1 Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  patient_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  date_of_birth DATE,
  gender gender,
  blood_group TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  national_id TEXT,
  profile_photo_url TEXT,
  qr_code TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, patient_number)
);

-- 5.2 Patient Medical History
CREATE TABLE public.patient_medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  condition_type medical_history_type NOT NULL,
  description TEXT NOT NULL,
  diagnosed_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. DOCTORS & APPOINTMENTS
-- ============================================

-- 6.1 Doctors
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  specialization TEXT,
  qualification TEXT,
  license_number TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6.2 Doctor Schedules
CREATE TABLE public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT DEFAULT 15,
  max_patients_per_slot INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6.3 Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  token_number INT,
  status appointment_status DEFAULT 'scheduled',
  appointment_type appointment_type DEFAULT 'scheduled',
  chief_complaint TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6.4 Consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  chief_complaint TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  clinical_notes TEXT,
  follow_up_date DATE,
  vitals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. PHARMACY & INVENTORY
-- ============================================

-- 7.1 Medicine Categories
CREATE TABLE public.medicine_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7.2 Medicines
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.medicine_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  unit medicine_unit DEFAULT 'tablet',
  strength TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7.3 Medicine Inventory
CREATE TABLE public.medicine_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT,
  quantity INT DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE,
  supplier_name TEXT,
  reorder_level INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7.4 Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  prescription_number TEXT NOT NULL,
  notes TEXT,
  status prescription_status DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7.5 Prescription Items
CREATE TABLE public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  quantity INT DEFAULT 1,
  instructions TEXT,
  is_dispensed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. BILLING & PAYMENTS
-- ============================================

-- 8.1 Service Types
CREATE TABLE public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category service_category DEFAULT 'other',
  default_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8.2 Payment Methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_reference BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

-- 8.3 Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status invoice_status DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, invoice_number)
);

-- 8.4 Invoice Items
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL,
  medicine_inventory_id UUID REFERENCES public.medicine_inventory(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8.5 Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  reference_number TEXT,
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. ADDITIONAL TABLES
-- ============================================

-- 9.1 Custom Fields
CREATE TABLE public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type field_type DEFAULT 'text',
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9.2 Custom Field Values
CREATE TABLE public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_id UUID REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9.3 Notification Templates
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel notification_channel NOT NULL,
  subject TEXT,
  template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9.4 Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. INDEXES
-- ============================================

CREATE INDEX idx_branches_organization ON public.branches(organization_id);
CREATE INDEX idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX idx_profiles_branch ON public.profiles(branch_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_patients_organization ON public.patients(organization_id);
CREATE INDEX idx_patients_branch ON public.patients(branch_id);
CREATE INDEX idx_patients_number ON public.patients(patient_number);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);

-- 11. SECURITY HELPER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Get user's branch ID
CREATE OR REPLACE FUNCTION public.get_user_branch_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(_permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_perm BOOLEAN := false;
  _user_org_id UUID;
BEGIN
  -- Super admins have all permissions
  IF public.is_super_admin() THEN
    RETURN true;
  END IF;
  
  SELECT organization_id INTO _user_org_id FROM public.profiles WHERE id = auth.uid();
  
  -- Check if user's role has the permission
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid()
      AND p.code = _permission_code
      AND rp.is_granted = true
      AND (rp.organization_id IS NULL OR rp.organization_id = _user_org_id)
  ) INTO _has_perm;
  
  RETURN _has_perm;
END;
$$;

-- 12. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 12.1 Organizations Policies
CREATE POLICY "Super admins can do everything with organizations"
  ON public.organizations FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (id = public.get_user_organization_id());

CREATE POLICY "Org admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.2 Branches Policies
CREATE POLICY "Super admins can do everything with branches"
  ON public.branches FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view branches in their organization"
  ON public.branches FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage branches"
  ON public.branches FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.3 User Roles Policies
CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- 12.4 Profiles Policies
CREATE POLICY "Super admins can do everything with profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage profiles in their organization"
  ON public.profiles FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.5 Permissions & Menu (Read-only for most)
CREATE POLICY "Anyone can view permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage permissions"
  ON public.permissions FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage menu items"
  ON public.menu_items FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());

CREATE POLICY "Super admins can manage all role permissions"
  ON public.role_permissions FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Org admins can manage their org role permissions"
  ON public.role_permissions FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.6 Settings Policies
CREATE POLICY "Super admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Anyone can view system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their org settings"
  ON public.organization_settings FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage their org settings"
  ON public.organization_settings FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Users can view their branch settings"
  ON public.branch_settings FOR SELECT
  USING (branch_id = public.get_user_branch_id() OR 
         branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Branch admins can manage their branch settings"
  ON public.branch_settings FOR ALL
  USING (branch_id = public.get_user_branch_id() AND public.has_role(auth.uid(), 'branch_admin'));

CREATE POLICY "Users can view their org modules"
  ON public.organization_modules FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage their org modules"
  ON public.organization_modules FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.7 Patient Policies
CREATE POLICY "Super admins can manage all patients"
  ON public.patients FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view patients in their organization"
  ON public.patients FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage patients in their organization"
  ON public.patients FOR ALL
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Super admins can manage all medical history"
  ON public.patient_medical_history FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view medical history for org patients"
  ON public.patient_medical_history FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Users can manage medical history for org patients"
  ON public.patient_medical_history FOR ALL
  USING (patient_id IN (SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()));

-- 12.8 Doctor & Appointment Policies
CREATE POLICY "Super admins can manage all doctors"
  ON public.doctors FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view doctors in their organization"
  ON public.doctors FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage doctors"
  ON public.doctors FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Super admins can manage all schedules"
  ON public.doctor_schedules FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view doctor schedules in their org"
  ON public.doctor_schedules FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Doctors can manage their own schedules"
  ON public.doctor_schedules FOR ALL
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid()));

CREATE POLICY "Super admins can manage all appointments"
  ON public.appointments FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view appointments in their organization"
  ON public.appointments FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage appointments in their organization"
  ON public.appointments FOR ALL
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Super admins can manage all consultations"
  ON public.consultations FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view consultations in their branch"
  ON public.consultations FOR SELECT
  USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Doctors can manage their own consultations"
  ON public.consultations FOR ALL
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid()));

-- 12.9 Pharmacy Policies
CREATE POLICY "Super admins can manage all medicine categories"
  ON public.medicine_categories FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view medicine categories in their org"
  ON public.medicine_categories FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage medicine categories"
  ON public.medicine_categories FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Super admins can manage all medicines"
  ON public.medicines FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view medicines in their org"
  ON public.medicines FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Pharmacists can manage medicines"
  ON public.medicines FOR ALL
  USING (organization_id = public.get_user_organization_id() AND 
         (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'org_admin')));

CREATE POLICY "Super admins can manage all inventory"
  ON public.medicine_inventory FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view inventory in their org"
  ON public.medicine_inventory FOR SELECT
  USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Pharmacists can manage inventory"
  ON public.medicine_inventory FOR ALL
  USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()) AND
         (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'org_admin')));

CREATE POLICY "Super admins can manage all prescriptions"
  ON public.prescriptions FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view prescriptions in their org"
  ON public.prescriptions FOR SELECT
  USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Doctors can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid()));

CREATE POLICY "Pharmacists can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()) AND
         public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Super admins can manage all prescription items"
  ON public.prescription_items FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view prescription items in their org"
  ON public.prescription_items FOR SELECT
  USING (prescription_id IN (SELECT id FROM public.prescriptions WHERE branch_id IN 
         (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id())));

CREATE POLICY "Users can manage prescription items in their org"
  ON public.prescription_items FOR ALL
  USING (prescription_id IN (SELECT id FROM public.prescriptions WHERE branch_id IN 
         (SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id())));

-- 12.10 Billing Policies
CREATE POLICY "Super admins can manage all service types"
  ON public.service_types FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view service types in their org"
  ON public.service_types FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage service types"
  ON public.service_types FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Super admins can manage all payment methods"
  ON public.payment_methods FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view payment methods in their org"
  ON public.payment_methods FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Super admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view invoices in their org"
  ON public.invoices FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage invoices in their org"
  ON public.invoices FOR ALL
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Super admins can manage all invoice items"
  ON public.invoice_items FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view invoice items in their org"
  ON public.invoice_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Users can manage invoice items in their org"
  ON public.invoice_items FOR ALL
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Super admins can manage all payments"
  ON public.payments FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view payments in their org"
  ON public.payments FOR SELECT
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Users can manage payments in their org"
  ON public.payments FOR ALL
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id = public.get_user_organization_id()));

-- 12.11 Custom Fields & Notifications
CREATE POLICY "Super admins can manage all custom fields"
  ON public.custom_fields FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view custom fields in their org"
  ON public.custom_fields FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage custom fields"
  ON public.custom_fields FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Super admins can manage all custom field values"
  ON public.custom_field_values FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view custom field values in their org"
  ON public.custom_field_values FOR SELECT
  USING (custom_field_id IN (SELECT id FROM public.custom_fields WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Users can manage custom field values in their org"
  ON public.custom_field_values FOR ALL
  USING (custom_field_id IN (SELECT id FROM public.custom_fields WHERE organization_id = public.get_user_organization_id()));

CREATE POLICY "Super admins can manage all notification templates"
  ON public.notification_templates FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view notification templates"
  ON public.notification_templates FOR SELECT
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());

CREATE POLICY "Org admins can manage their notification templates"
  ON public.notification_templates FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.has_role(auth.uid(), 'org_admin'));

-- 12.12 Audit Logs (Read-only for most)
CREATE POLICY "Super admins can manage all audit logs"
  ON public.audit_logs FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view audit logs in their org"
  ON public.audit_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 13. TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_inventory_updated_at BEFORE UPDATE ON public.medicine_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branch_settings_updated_at BEFORE UPDATE ON public.branch_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON public.custom_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. PROFILE CREATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. PATIENT NUMBER GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_patient_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  org_prefix TEXT;
  branch_code TEXT;
  date_part TEXT;
  seq_num INT;
  new_number TEXT;
BEGIN
  -- Get organization slug
  SELECT slug INTO org_prefix FROM public.organizations WHERE id = NEW.organization_id;
  
  -- Get branch code
  SELECT code INTO branch_code FROM public.branches WHERE id = NEW.branch_id;
  
  -- Date part
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Get sequence number for today
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(patient_number FROM LENGTH(org_prefix) + LENGTH(branch_code) + 10) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.patients
  WHERE organization_id = NEW.organization_id
    AND patient_number LIKE org_prefix || '-' || COALESCE(branch_code, '%') || '-' || date_part || '-%';
  
  -- Generate new patient number
  new_number := UPPER(org_prefix) || '-' || COALESCE(branch_code, 'HQ') || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  NEW.patient_number := new_number;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_patient_number_trigger
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  WHEN (NEW.patient_number IS NULL OR NEW.patient_number = '')
  EXECUTE FUNCTION public.generate_patient_number();

-- 16. INVOICE NUMBER GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  date_part TEXT;
  seq_num INT;
  new_number TEXT;
BEGIN
  -- Get prefix from org settings or default
  SELECT setting_value INTO prefix
  FROM public.organization_settings
  WHERE organization_id = NEW.organization_id AND setting_key = 'invoice_prefix';
  
  prefix := COALESCE(prefix, 'INV');
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Get sequence number
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM LENGTH(prefix) + 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.invoices
  WHERE organization_id = NEW.organization_id
    AND invoice_number LIKE prefix || '-' || date_part || '-%';
  
  new_number := prefix || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  NEW.invoice_number := new_number;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

-- 17. TOKEN NUMBER GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_token_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  last_token INT;
BEGIN
  -- Get last token for today, branch, and doctor
  SELECT COALESCE(MAX(token_number), 0)
  INTO last_token
  FROM public.appointments
  WHERE branch_id = NEW.branch_id
    AND appointment_date = NEW.appointment_date
    AND (NEW.doctor_id IS NULL OR doctor_id = NEW.doctor_id);
  
  NEW.token_number := last_token + 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_token_number_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  WHEN (NEW.token_number IS NULL)
  EXECUTE FUNCTION public.generate_token_number();

-- 18. PRESCRIPTION NUMBER GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(prescription_number FROM 5) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.prescriptions
  WHERE prescription_number LIKE 'RX-' || date_part || '-%';
  
  NEW.prescription_number := 'RX-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_prescription_number_trigger
  BEFORE INSERT ON public.prescriptions
  FOR EACH ROW
  WHEN (NEW.prescription_number IS NULL OR NEW.prescription_number = '')
  EXECUTE FUNCTION public.generate_prescription_number();
