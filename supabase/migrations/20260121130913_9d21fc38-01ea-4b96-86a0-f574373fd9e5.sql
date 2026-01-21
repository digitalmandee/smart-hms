-- Phase 1: Repair orphaned admissions where bed status doesn't match
-- Fix beds where admission is "admitted" but bed status is wrong or current_admission_id is null
UPDATE beds b
SET status = 'occupied', current_admission_id = a.id
FROM admissions a
WHERE a.bed_id = b.id 
  AND a.status = 'admitted' 
  AND (b.status != 'occupied' OR b.current_admission_id IS NULL OR b.current_admission_id != a.id);

-- Fix beds that are marked as occupied but have no active admission
UPDATE beds b
SET status = 'available', current_admission_id = NULL
WHERE b.status = 'occupied'
  AND NOT EXISTS (
    SELECT 1 FROM admissions a 
    WHERE a.bed_id = b.id AND a.status = 'admitted'
  );