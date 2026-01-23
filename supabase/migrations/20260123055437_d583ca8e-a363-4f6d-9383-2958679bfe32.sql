-- Fix the surgery number generation function to count by creation date pattern
-- instead of scheduled_date to prevent duplicate constraint violations

CREATE OR REPLACE FUNCTION public.generate_surgery_number(org_id UUID, branch_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  branch_code TEXT;
  date_part TEXT;
  today_count INTEGER;
  surgery_num TEXT;
BEGIN
  -- Get branch code
  SELECT code INTO branch_code FROM public.branches WHERE id = branch_id;
  
  -- Date part for today (when surgery record is being CREATED)
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Count surgeries with surgery_number matching today's date pattern
  -- This ensures unique numbers regardless of when the surgery is scheduled
  SELECT COUNT(*) + 1 INTO today_count
  FROM public.surgeries
  WHERE organization_id = org_id
    AND surgery_number LIKE 'SURG-' || COALESCE(branch_code, 'XX') || '-' || date_part || '-%';
  
  -- Generate unique number: SURG-BRANCHCODE-YYYYMMDD-XXXX
  surgery_num := 'SURG-' || COALESCE(branch_code, 'XX') || '-' || 
                 date_part || '-' || 
                 LPAD(today_count::TEXT, 4, '0');
  
  RETURN surgery_num;
END;
$$;