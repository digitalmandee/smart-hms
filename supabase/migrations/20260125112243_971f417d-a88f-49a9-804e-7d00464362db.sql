-- Create surgeon fee templates table for storing procedure-specific pricing per surgeon
CREATE TABLE IF NOT EXISTS public.surgeon_fee_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgeon_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  procedure_code TEXT,
  surgeon_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  default_anesthesia_type TEXT CHECK (default_anesthesia_type IN ('local', 'spinal', 'general', 'sedation')),
  default_anesthesia_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  nursing_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  ot_room_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  consumables_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  recovery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_package NUMERIC(12,2) GENERATED ALWAYS AS (
    surgeon_fee + default_anesthesia_fee + nursing_fee + ot_room_fee + consumables_fee + recovery_fee
  ) STORED,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(surgeon_id, procedure_name, organization_id)
);

-- Enable RLS
ALTER TABLE public.surgeon_fee_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view surgeon fee templates in their organization"
ON public.surgeon_fee_templates FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users with settings permission can manage templates"
ON public.surgeon_fee_templates FOR ALL
USING (organization_id = public.get_user_organization_id());

-- Create index for faster lookups
CREATE INDEX idx_surgeon_fee_templates_surgeon ON public.surgeon_fee_templates(surgeon_id);
CREATE INDEX idx_surgeon_fee_templates_org ON public.surgeon_fee_templates(organization_id);

-- Add surgery_charges JSONB column to surgeries for storing the pricing breakdown
ALTER TABLE public.surgeries 
ADD COLUMN IF NOT EXISTS surgery_charges JSONB DEFAULT '{}';

-- Add template_id to surgeries for tracking which template was used
ALTER TABLE public.surgeries 
ADD COLUMN IF NOT EXISTS fee_template_id UUID REFERENCES public.surgeon_fee_templates(id);

-- Create function to auto-generate invoice when all team members confirm
CREATE OR REPLACE FUNCTION public.create_surgery_invoice_on_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_surgery RECORD;
  v_all_confirmed BOOLEAN;
  v_has_admission BOOLEAN;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_date_part TEXT;
  v_seq_num INT;
  v_charges JSONB;
  v_total NUMERIC(12,2);
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.confirmation_status != 'accepted' THEN
    RETURN NEW;
  END IF;

  -- Check if ALL team members for this surgery have confirmed
  SELECT NOT EXISTS (
    SELECT 1 FROM surgery_team_members 
    WHERE surgery_id = NEW.surgery_id 
      AND confirmation_status != 'accepted'
  ) INTO v_all_confirmed;

  -- If not all confirmed, just return
  IF NOT v_all_confirmed THEN
    RETURN NEW;
  END IF;

  -- Get surgery details
  SELECT s.*, o.id as org_id
  INTO v_surgery
  FROM surgeries s
  JOIN organizations o ON o.id = s.organization_id
  WHERE s.id = NEW.surgery_id;

  -- Skip if invoice already exists
  IF v_surgery.invoice_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get charges from surgery record
  v_charges := COALESCE(v_surgery.surgery_charges, '{}'::jsonb);
  
  -- Calculate total from charges
  v_total := COALESCE((v_charges->>'surgeon_fee')::numeric, 0) +
             COALESCE((v_charges->>'anesthesia_fee')::numeric, 0) +
             COALESCE((v_charges->>'nursing_fee')::numeric, 0) +
             COALESCE((v_charges->>'ot_room_fee')::numeric, 0) +
             COALESCE((v_charges->>'consumables_fee')::numeric, 0) +
             COALESCE((v_charges->>'recovery_fee')::numeric, 0);

  -- If no charges defined, skip invoice creation
  IF v_total <= 0 THEN
    RETURN NEW;
  END IF;

  -- Check if patient has active admission
  SELECT EXISTS (
    SELECT 1 FROM admissions 
    WHERE patient_id = v_surgery.patient_id 
      AND status IN ('admitted', 'confirmed')
  ) INTO v_has_admission;

  IF v_has_admission THEN
    -- Post to IPD charges instead of creating invoice
    INSERT INTO ipd_charges (
      admission_id,
      organization_id,
      charge_type,
      description,
      quantity,
      unit_price,
      total_amount,
      charge_date,
      is_billable,
      notes
    )
    SELECT 
      a.id,
      v_surgery.organization_id,
      'surgery',
      'Surgery: ' || COALESCE(v_surgery.procedure_name, 'Procedure'),
      1,
      v_total,
      v_total,
      CURRENT_DATE,
      true,
      'Auto-posted from surgery ' || v_surgery.surgery_number
    FROM admissions a
    WHERE a.patient_id = v_surgery.patient_id 
      AND a.status IN ('admitted', 'confirmed')
    LIMIT 1;
  ELSE
    -- Create outpatient invoice
    -- Generate invoice number
    v_date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
    
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{6}-([0-9]+)') AS INT)
    ), 0) + 1
    INTO v_seq_num
    FROM invoices
    WHERE organization_id = v_surgery.organization_id
      AND invoice_number LIKE 'INV-' || v_date_part || '-%';
    
    v_invoice_number := 'INV-' || v_date_part || '-' || LPAD(v_seq_num::TEXT, 4, '0');

    -- Create invoice
    INSERT INTO invoices (
      invoice_number,
      patient_id,
      branch_id,
      organization_id,
      status,
      subtotal_amount,
      tax_amount,
      discount_amount,
      total_amount,
      balance_amount,
      notes
    ) VALUES (
      v_invoice_number,
      v_surgery.patient_id,
      v_surgery.branch_id,
      v_surgery.organization_id,
      'pending',
      v_total,
      0,
      0,
      v_total,
      v_total,
      'Surgery Invoice: ' || v_surgery.surgery_number
    )
    RETURNING id INTO v_invoice_id;

    -- Create invoice items for each charge type
    IF (v_charges->>'surgeon_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'Surgeon Fee', 1, (v_charges->>'surgeon_fee')::numeric, (v_charges->>'surgeon_fee')::numeric);
    END IF;

    IF (v_charges->>'anesthesia_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'Anesthesia Fee', 1, (v_charges->>'anesthesia_fee')::numeric, (v_charges->>'anesthesia_fee')::numeric);
    END IF;

    IF (v_charges->>'nursing_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'Nursing Charges', 1, (v_charges->>'nursing_fee')::numeric, (v_charges->>'nursing_fee')::numeric);
    END IF;

    IF (v_charges->>'ot_room_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'OT Room Charges', 1, (v_charges->>'ot_room_fee')::numeric, (v_charges->>'ot_room_fee')::numeric);
    END IF;

    IF (v_charges->>'consumables_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'Consumables', 1, (v_charges->>'consumables_fee')::numeric, (v_charges->>'consumables_fee')::numeric);
    END IF;

    IF (v_charges->>'recovery_fee')::numeric > 0 THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice_id, 'Recovery/PACU Charges', 1, (v_charges->>'recovery_fee')::numeric, (v_charges->>'recovery_fee')::numeric);
    END IF;

    -- Link invoice to surgery
    UPDATE surgeries SET invoice_id = v_invoice_id WHERE id = NEW.surgery_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-invoice generation
DROP TRIGGER IF EXISTS trg_create_surgery_invoice ON surgery_team_members;
CREATE TRIGGER trg_create_surgery_invoice
AFTER UPDATE OF confirmation_status ON surgery_team_members
FOR EACH ROW
WHEN (NEW.confirmation_status = 'accepted')
EXECUTE FUNCTION create_surgery_invoice_on_confirmation();

-- Add trigger for updated_at
CREATE TRIGGER update_surgeon_fee_templates_updated_at
BEFORE UPDATE ON surgeon_fee_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();