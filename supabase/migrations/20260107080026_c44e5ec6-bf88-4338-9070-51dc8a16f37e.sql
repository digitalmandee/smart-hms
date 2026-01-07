
-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_patient_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.generate_token_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

-- Fix the permissive audit_logs INSERT policy by adding organization check
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    organization_id = public.get_user_organization_id() OR
    public.is_super_admin()
  );
