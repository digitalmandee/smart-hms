-- Fix function search path security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;