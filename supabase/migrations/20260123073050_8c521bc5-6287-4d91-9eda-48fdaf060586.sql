-- Fix existing approved discharge summaries with NULL approved_by
UPDATE discharge_summaries ds
SET 
  approved_by = COALESCE(
    (SELECT attending_doctor_id FROM admissions WHERE id = ds.admission_id),
    ds.prepared_by
  ),
  approved_at = COALESCE(ds.approved_at, ds.updated_at)
WHERE ds.status = 'approved' AND ds.approved_by IS NULL;