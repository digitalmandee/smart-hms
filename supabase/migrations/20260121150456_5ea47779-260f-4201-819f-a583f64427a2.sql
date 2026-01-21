-- Fix the trigger to also handle 'TEMP' as a safety net
DROP TRIGGER IF EXISTS generate_patient_number_trigger ON patients;

CREATE TRIGGER generate_patient_number_trigger
BEFORE INSERT ON public.patients
FOR EACH ROW
WHEN (
  new.patient_number IS NULL 
  OR new.patient_number = '' 
  OR new.patient_number = 'TEMP'
)
EXECUTE FUNCTION generate_patient_number();

-- Fix any existing patients with TEMP patient_number
UPDATE patients p
SET patient_number = (
  SELECT UPPER(COALESCE(o.slug, 'ORG')) || '-' || COALESCE(b.code, 'HQ') || '-' || 
         TO_CHAR(p.created_at::date, 'YYMMDD') || '-' ||
         LPAD(
           (ROW_NUMBER() OVER (
             PARTITION BY p.organization_id, p.created_at::date 
             ORDER BY p.created_at
           ))::text, 4, '0'
         )
  FROM organizations o
  LEFT JOIN branches b ON b.id = p.branch_id
  WHERE o.id = p.organization_id
)
WHERE p.patient_number = 'TEMP';