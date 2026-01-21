-- Fix patient number generation trigger
-- Issues: Case-sensitive LIKE, incorrect substring offset, race conditions

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
  pattern TEXT;
BEGIN
  -- Get organization slug (uppercase for consistency)
  SELECT UPPER(slug) INTO org_prefix FROM public.organizations WHERE id = NEW.organization_id;
  
  -- Get branch code if branch is set
  IF NEW.branch_id IS NOT NULL THEN
    SELECT code INTO branch_code FROM public.branches WHERE id = NEW.branch_id;
  END IF;
  
  -- Date part in YYMMDD format
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Build pattern for matching existing patient numbers
  pattern := org_prefix || '-' || COALESCE(branch_code, '%') || '-' || date_part || '-%';
  
  -- Advisory lock to prevent race conditions during concurrent inserts
  PERFORM pg_advisory_xact_lock(hashtext('patient_' || NEW.organization_id::text || '_' || date_part));
  
  -- Get next sequence number using case-insensitive match
  -- Extract sequence from the last hyphen-separated segment
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(
      SUBSTRING(patient_number FROM '[0-9]+$'),
      '[^0-9]', '', 'g'
    ), '')::INT
  ), 0) + 1
  INTO seq_num
  FROM public.patients
  WHERE organization_id = NEW.organization_id
    AND UPPER(patient_number) LIKE pattern;
  
  -- Generate new patient number
  new_number := org_prefix || '-' || COALESCE(branch_code, 'HQ') || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  NEW.patient_number := new_number;
  RETURN NEW;
END;
$$;