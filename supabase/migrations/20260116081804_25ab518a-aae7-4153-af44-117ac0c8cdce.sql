-- =====================================================
-- HMS Enhancement Migration: All Missing Features
-- =====================================================

-- =====================================================
-- PHASE 1: Lab Test Categories (for dynamic categorization)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lab_test_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_test_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lab test categories for their organization"
  ON public.lab_test_categories FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage lab test categories for their organization"
  ON public.lab_test_categories FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 2: Insurance Module Tables
-- =====================================================

-- Insurance Companies
CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insurance companies for their organization"
  ON public.insurance_companies FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage insurance companies for their organization"
  ON public.insurance_companies FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Insurance Plans
CREATE TABLE IF NOT EXISTS public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan_code TEXT,
  plan_type TEXT, -- 'individual', 'family', 'corporate', 'government'
  coverage_percentage DECIMAL(5,2) DEFAULT 0,
  max_coverage_amount DECIMAL(12,2),
  copay_amount DECIMAL(10,2) DEFAULT 0,
  copay_percentage DECIMAL(5,2) DEFAULT 0,
  deductible_amount DECIMAL(10,2) DEFAULT 0,
  annual_limit DECIMAL(12,2),
  waiting_period_days INTEGER DEFAULT 0,
  pre_auth_required BOOLEAN DEFAULT false,
  covered_services JSONB DEFAULT '[]'::jsonb,
  excluded_services JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insurance plans for their organization"
  ON public.insurance_plans FOR SELECT
  USING (insurance_company_id IN (
    SELECT id FROM public.insurance_companies 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can manage insurance plans for their organization"
  ON public.insurance_plans FOR ALL
  USING (insurance_company_id IN (
    SELECT id FROM public.insurance_companies 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

-- Patient Insurance
CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  insurance_plan_id UUID REFERENCES public.insurance_plans(id) NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  member_id TEXT,
  subscriber_name TEXT,
  subscriber_relationship TEXT, -- 'self', 'spouse', 'child', 'other'
  start_date DATE NOT NULL,
  end_date DATE,
  is_primary BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient insurance for their organization"
  ON public.patient_insurance FOR SELECT
  USING (patient_id IN (
    SELECT id FROM public.patients 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can manage patient insurance for their organization"
  ON public.patient_insurance FOR ALL
  USING (patient_id IN (
    SELECT id FROM public.patients 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

-- Insurance Claims
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  patient_insurance_id UUID REFERENCES public.patient_insurance(id) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  claim_number TEXT NOT NULL,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submission_date DATE,
  total_amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  copay_amount DECIMAL(10,2) DEFAULT 0,
  deductible_amount DECIMAL(10,2) DEFAULT 0,
  patient_responsibility DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, submitted, in_review, approved, partially_approved, rejected, paid, appealed
  pre_auth_number TEXT,
  pre_auth_date DATE,
  approval_date DATE,
  rejection_reason TEXT,
  appeal_notes TEXT,
  payment_reference TEXT,
  payment_date DATE,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  submitted_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insurance claims for their organization"
  ON public.insurance_claims FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage insurance claims for their organization"
  ON public.insurance_claims FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Claim Items
CREATE TABLE IF NOT EXISTS public.claim_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE CASCADE NOT NULL,
  invoice_item_id UUID REFERENCES public.invoice_items(id),
  service_code TEXT,
  service_name TEXT NOT NULL,
  service_date DATE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, partially_approved, rejected
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.claim_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view claim items for their organization"
  ON public.claim_items FOR SELECT
  USING (claim_id IN (
    SELECT id FROM public.insurance_claims 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can manage claim items for their organization"
  ON public.claim_items FOR ALL
  USING (claim_id IN (
    SELECT id FROM public.insurance_claims 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

-- =====================================================
-- PHASE 3: Report Templates (Dynamic)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  report_type TEXT NOT NULL, -- 'lab', 'radiology', 'discharge', 'prescription', 'invoice', 'receipt'
  name TEXT NOT NULL,
  template_content TEXT, -- HTML/Markdown template
  header_content TEXT,
  footer_content TEXT,
  styles TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Available template variables
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view report templates for their organization"
  ON public.report_templates FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage report templates for their organization"
  ON public.report_templates FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 4: Lab Test Panels
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lab_test_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  tests JSONB DEFAULT '[]'::jsonb, -- Array of test template IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_test_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lab test panels for their organization"
  ON public.lab_test_panels FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage lab test panels for their organization"
  ON public.lab_test_panels FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 5: Notification Logs (for SMS/Email tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  notification_type TEXT NOT NULL, -- 'sms', 'email', 'push'
  recipient TEXT NOT NULL, -- phone or email
  recipient_name TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  template_used TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed
  provider TEXT, -- 'twilio', 'telenor', 'jazz', 'resend'
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  related_entity_type TEXT, -- 'appointment', 'invoice', 'claim'
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notification logs for their organization"
  ON public.notification_logs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create notification logs for their organization"
  ON public.notification_logs FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 6: Departments Table (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  name TEXT NOT NULL,
  code TEXT,
  department_type TEXT, -- 'clinical', 'administrative', 'support', 'diagnostic'
  parent_department_id UUID REFERENCES public.departments(id),
  head_employee_id UUID REFERENCES public.employees(id),
  description TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view departments for their organization"
  ON public.departments FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage departments for their organization"
  ON public.departments FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- Menu Items for All New Features
-- =====================================================

-- Lab Test Templates under Lab
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'lab_test_templates', 'Test Templates', 'FlaskConical', '/app/lab/templates', id, 50, 'lab.manage', true
FROM public.menu_items WHERE code = 'lab' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'lab_test_templates');

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'lab_test_panels', 'Test Panels', 'Layers', '/app/lab/panels', id, 51, 'lab.manage', true
FROM public.menu_items WHERE code = 'lab' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'lab_test_panels');

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'lab_categories', 'Categories', 'FolderTree', '/app/lab/categories', id, 52, 'lab.manage', true
FROM public.menu_items WHERE code = 'lab' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'lab_categories');

-- Insurance under Billing
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'insurance_companies', 'Insurance Companies', 'Building2', '/app/billing/insurance/companies', id, 60, 'billing.manage', true
FROM public.menu_items WHERE code = 'billing' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'insurance_companies');

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'insurance_plans', 'Insurance Plans', 'FileText', '/app/billing/insurance/plans', id, 61, 'billing.manage', true
FROM public.menu_items WHERE code = 'billing' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'insurance_plans');

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'insurance_claims', 'Claims', 'ClipboardList', '/app/billing/claims', id, 62, 'billing.manage', true
FROM public.menu_items WHERE code = 'billing' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'insurance_claims');

-- Financial Reports under Accounts
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'financial_reports', 'Financial Reports', 'BarChart3', '/app/accounts/reports', id, 50, 'accounts.view', true
FROM public.menu_items WHERE code = 'accounts' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'financial_reports');

-- Audit Logs under Settings
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'audit_logs', 'Audit Logs', 'ScrollText', '/app/settings/audit-logs', id, 80, 'settings.manage', true
FROM public.menu_items WHERE code = 'settings' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'audit_logs');

-- SMS Settings under Settings
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'sms_settings', 'SMS Gateway', 'MessageSquare', '/app/settings/sms', id, 45, 'settings.manage', true
FROM public.menu_items WHERE code = 'settings' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'sms_settings');

-- Report Templates under Settings
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'report_templates', 'Report Templates', 'FileCode', '/app/settings/report-templates', id, 46, 'settings.manage', true
FROM public.menu_items WHERE code = 'settings' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'report_templates');

-- Departments under Settings (separate from HR departments page)
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'departments_config', 'Departments', 'Network', '/app/settings/departments', id, 47, 'settings.manage', true
FROM public.menu_items WHERE code = 'settings' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'departments_config');

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_insurance_claims_organization ON public.insurance_claims(organization_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_claim_date ON public.insurance_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON public.patient_insurance(patient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_organization ON public.notification_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_categories_organization ON public.lab_test_categories(organization_id);

-- =====================================================
-- Sequences for Claim Numbers
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1000;

-- Function to generate claim numbers
CREATE OR REPLACE FUNCTION generate_claim_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  org_code TEXT;
  seq_num INTEGER;
BEGIN
  SELECT COALESCE(SUBSTRING(name, 1, 3), 'CLM') INTO org_code FROM public.organizations WHERE id = org_id;
  seq_num := nextval('claim_number_seq');
  RETURN UPPER(org_code) || '-CLM-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;