-- =====================================================
-- OT MODULE ENHANCEMENT: Additional Tables
-- =====================================================

-- 1. Surgery Medications Table
CREATE TABLE public.surgery_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  route TEXT,
  timing TEXT NOT NULL DEFAULT 'pre_op',
  scheduled_time TIMESTAMPTZ,
  ordered_by UUID REFERENCES public.profiles(id),
  ordered_at TIMESTAMPTZ DEFAULT now(),
  administered_at TIMESTAMPTZ,
  administered_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  hold_reason TEXT,
  notes TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Surgery Consents Table
CREATE TABLE public.surgery_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_template TEXT,
  procedure_explained TEXT,
  risks_explained TEXT,
  alternatives_explained TEXT,
  patient_questions TEXT,
  patient_signature TEXT,
  patient_signed_at TIMESTAMPTZ,
  patient_relationship TEXT,
  witness_name TEXT,
  witness_signature TEXT,
  witness_signed_at TIMESTAMPTZ,
  explained_by UUID REFERENCES public.profiles(id),
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Surgery Consumables Table
CREATE TABLE public.surgery_consumables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_category TEXT,
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2),
  lot_number TEXT,
  batch_number TEXT,
  serial_number TEXT,
  expiry_date DATE,
  is_implant BOOLEAN DEFAULT false,
  implant_location TEXT,
  implant_size TEXT,
  manufacturer TEXT,
  is_billable BOOLEAN DEFAULT true,
  billed_to_invoice_id UUID REFERENCES public.invoices(id),
  added_by UUID REFERENCES public.profiles(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Post-Op Orders Table
CREATE TABLE public.post_op_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  ordered_by UUID NOT NULL REFERENCES public.profiles(id),
  ordered_at TIMESTAMPTZ DEFAULT now(),
  disposition TEXT NOT NULL DEFAULT 'ward',
  diet_order TEXT DEFAULT 'npo',
  diet_notes TEXT,
  diet_start_time TIMESTAMPTZ,
  activity_level TEXT DEFAULT 'bed_rest',
  activity_restrictions TEXT,
  weight_bearing TEXT,
  pain_management JSONB DEFAULT '[]',
  pca_ordered BOOLEAN DEFAULT false,
  pca_settings JSONB,
  pain_goal INTEGER,
  iv_fluids JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',
  continue_home_meds BOOLEAN DEFAULT false,
  held_medications TEXT,
  vital_signs_frequency TEXT DEFAULT 'q4h',
  neuro_checks BOOLEAN DEFAULT false,
  neuro_frequency TEXT,
  intake_output BOOLEAN DEFAULT true,
  fall_precautions BOOLEAN DEFAULT false,
  bleeding_precautions BOOLEAN DEFAULT false,
  drains JSONB DEFAULT '[]',
  foley_catheter BOOLEAN DEFAULT false,
  foley_removal_date DATE,
  ng_tube BOOLEAN DEFAULT false,
  ng_tube_orders TEXT,
  vte_prophylaxis TEXT,
  vte_medication_details TEXT,
  wound_care_instructions TEXT,
  dressing_change_frequency TEXT,
  incentive_spirometry BOOLEAN DEFAULT false,
  oxygen_therapy TEXT,
  respiratory_treatments TEXT,
  stat_labs TEXT[],
  morning_labs TEXT[],
  imaging_orders TEXT,
  consults TEXT[],
  follow_up_instructions TEXT,
  follow_up_appointment TEXT,
  discharge_criteria TEXT,
  special_instructions TEXT,
  code_status TEXT DEFAULT 'full_code',
  is_active BOOLEAN DEFAULT true,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surgery_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_op_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surgery_medications
CREATE POLICY "Users can view surgery medications in their organization"
ON public.surgery_medications FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert surgery medications in their organization"
ON public.surgery_medications FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update surgery medications in their organization"
ON public.surgery_medications FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete surgery medications in their organization"
ON public.surgery_medications FOR DELETE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for surgery_consents
CREATE POLICY "Users can view surgery consents in their organization"
ON public.surgery_consents FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert surgery consents in their organization"
ON public.surgery_consents FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update surgery consents in their organization"
ON public.surgery_consents FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for surgery_consumables
CREATE POLICY "Users can view surgery consumables in their organization"
ON public.surgery_consumables FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert surgery consumables in their organization"
ON public.surgery_consumables FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update surgery consumables in their organization"
ON public.surgery_consumables FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete surgery consumables in their organization"
ON public.surgery_consumables FOR DELETE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for post_op_orders
CREATE POLICY "Users can view post-op orders in their organization"
ON public.post_op_orders FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert post-op orders in their organization"
ON public.post_op_orders FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update post-op orders in their organization"
ON public.post_op_orders FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_surgery_medications_surgery_id ON public.surgery_medications(surgery_id);
CREATE INDEX idx_surgery_medications_status ON public.surgery_medications(status);
CREATE INDEX idx_surgery_consents_surgery_id ON public.surgery_consents(surgery_id);
CREATE INDEX idx_surgery_consumables_surgery_id ON public.surgery_consumables(surgery_id);
CREATE INDEX idx_post_op_orders_surgery_id ON public.post_op_orders(surgery_id);

-- Updated_at triggers
CREATE TRIGGER update_surgery_medications_updated_at
  BEFORE UPDATE ON public.surgery_medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgery_consents_updated_at
  BEFORE UPDATE ON public.surgery_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgery_consumables_updated_at
  BEFORE UPDATE ON public.surgery_consumables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_op_orders_updated_at
  BEFORE UPDATE ON public.post_op_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();