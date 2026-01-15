-- Radiology & Imaging Module Schema

-- Enums for Radiology module
CREATE TYPE public.imaging_modality AS ENUM (
  'xray', 'ultrasound', 'ct_scan', 'mri', 'fluoroscopy', 
  'mammography', 'dexa', 'ecg', 'echo', 'pet_ct', 'other'
);

CREATE TYPE public.imaging_order_status AS ENUM (
  'ordered', 'scheduled', 'in_progress', 'completed', 'reported', 'verified', 'cancelled'
);

CREATE TYPE public.imaging_priority AS ENUM (
  'routine', 'urgent', 'stat'
);

CREATE TYPE public.imaging_finding_status AS ENUM (
  'normal', 'abnormal', 'critical'
);

-- Imaging Modalities Master Table
CREATE TABLE public.imaging_modalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  modality_type public.imaging_modality NOT NULL DEFAULT 'xray',
  department TEXT,
  preparation_instructions TEXT,
  default_duration_minutes INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imaging Procedures Catalog
CREATE TABLE public.imaging_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  modality_id UUID REFERENCES public.imaging_modalities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  modality_type public.imaging_modality NOT NULL,
  body_part TEXT,
  default_views TEXT,
  preparation TEXT,
  estimated_duration_minutes INT DEFAULT 15,
  base_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imaging Orders
CREATE TABLE public.imaging_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  admission_id UUID REFERENCES public.admissions(id) ON DELETE SET NULL,
  er_registration_id UUID REFERENCES public.emergency_registrations(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.imaging_procedures(id) ON DELETE SET NULL,
  modality public.imaging_modality NOT NULL,
  procedure_name TEXT NOT NULL,
  priority public.imaging_priority NOT NULL DEFAULT 'routine',
  clinical_indication TEXT,
  clinical_history TEXT,
  status public.imaging_order_status NOT NULL DEFAULT 'ordered',
  ordered_by UUID NOT NULL REFERENCES public.profiles(id),
  ordered_at TIMESTAMPTZ DEFAULT now(),
  scheduled_date DATE,
  scheduled_time TIME,
  technician_id UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ,
  radiologist_id UUID REFERENCES public.doctors(id),
  reported_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.doctors(id),
  verified_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imaging Results
CREATE TABLE public.imaging_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.imaging_orders(id) ON DELETE CASCADE,
  findings TEXT,
  impression TEXT,
  recommendations TEXT,
  finding_status public.imaging_finding_status,
  images JSONB DEFAULT '[]'::jsonb,
  structured_findings JSONB,
  technique TEXT,
  comparison TEXT,
  report_template_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imaging Report Templates
CREATE TABLE public.imaging_report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  modality public.imaging_modality NOT NULL,
  procedure_id UUID REFERENCES public.imaging_procedures(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  template_structure JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Function to generate imaging order number
CREATE OR REPLACE FUNCTION public.generate_imaging_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5 + LENGTH(date_part)) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.imaging_orders
  WHERE organization_id = NEW.organization_id
    AND order_number LIKE 'IMG-' || date_part || '-%';
  
  NEW.order_number := 'IMG-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating order numbers
CREATE TRIGGER generate_imaging_order_number_trigger
BEFORE INSERT ON public.imaging_orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
EXECUTE FUNCTION public.generate_imaging_order_number();

-- Triggers for updated_at
CREATE TRIGGER update_imaging_modalities_updated_at
BEFORE UPDATE ON public.imaging_modalities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_procedures_updated_at
BEFORE UPDATE ON public.imaging_procedures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_orders_updated_at
BEFORE UPDATE ON public.imaging_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_results_updated_at
BEFORE UPDATE ON public.imaging_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imaging_report_templates_updated_at
BEFORE UPDATE ON public.imaging_report_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for efficient querying
CREATE INDEX idx_imaging_orders_organization ON public.imaging_orders(organization_id);
CREATE INDEX idx_imaging_orders_branch ON public.imaging_orders(branch_id);
CREATE INDEX idx_imaging_orders_patient ON public.imaging_orders(patient_id);
CREATE INDEX idx_imaging_orders_status ON public.imaging_orders(status);
CREATE INDEX idx_imaging_orders_modality ON public.imaging_orders(modality);
CREATE INDEX idx_imaging_orders_scheduled_date ON public.imaging_orders(scheduled_date);
CREATE INDEX idx_imaging_orders_priority ON public.imaging_orders(priority);
CREATE INDEX idx_imaging_procedures_modality ON public.imaging_procedures(modality_type);
CREATE INDEX idx_imaging_modalities_organization ON public.imaging_modalities(organization_id);

-- RLS Policies
ALTER TABLE public.imaging_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_report_templates ENABLE ROW LEVEL SECURITY;

-- Imaging Modalities policies
CREATE POLICY "Users can view modalities in their organization"
ON public.imaging_modalities FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage modalities in their organization"
ON public.imaging_modalities FOR ALL
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Imaging Procedures policies
CREATE POLICY "Users can view procedures in their organization"
ON public.imaging_procedures FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage procedures in their organization"
ON public.imaging_procedures FOR ALL
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Imaging Orders policies
CREATE POLICY "Users can view orders in their organization"
ON public.imaging_orders FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage orders in their organization"
ON public.imaging_orders FOR ALL
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Imaging Results policies
CREATE POLICY "Users can view results in their organization"
ON public.imaging_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.imaging_orders o 
    WHERE o.id = imaging_results.order_id 
    AND (o.organization_id = public.get_user_organization_id() OR public.is_super_admin())
  )
);

CREATE POLICY "Users can manage results in their organization"
ON public.imaging_results FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.imaging_orders o 
    WHERE o.id = imaging_results.order_id 
    AND (o.organization_id = public.get_user_organization_id() OR public.is_super_admin())
  )
);

-- Imaging Report Templates policies
CREATE POLICY "Users can view templates in their organization"
ON public.imaging_report_templates FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage templates in their organization"
ON public.imaging_report_templates FOR ALL
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Add Radiology menu items
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, required_module, required_permission, is_active) VALUES
('radiology', 'Radiology', '/app/radiology', 'Scan', NULL, 65, 'radiology', 'radiology.view', true);

INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, required_module, required_permission, is_active) VALUES
('radiology_dashboard', 'Dashboard', '/app/radiology', 'LayoutDashboard', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 1, 'radiology', 'radiology.view', true),
('radiology_orders', 'Orders', '/app/radiology/orders', 'ClipboardList', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 2, 'radiology', 'radiology.view', true),
('radiology_worklist', 'Technician Worklist', '/app/radiology/worklist', 'ListChecks', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 3, 'radiology', 'radiology.technician', true),
('radiology_schedule', 'Schedule', '/app/radiology/schedule', 'Calendar', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 4, 'radiology', 'radiology.view', true),
('radiology_reporting', 'Reporting', '/app/radiology/reporting', 'FileText', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 5, 'radiology', 'radiology.report', true),
('radiology_modalities', 'Modalities', '/app/radiology/modalities', 'Monitor', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 10, 'radiology', 'radiology.setup', true),
('radiology_procedures', 'Procedures', '/app/radiology/procedures', 'Stethoscope', (SELECT id FROM public.menu_items WHERE code = 'radiology'), 11, 'radiology', 'radiology.setup', true);