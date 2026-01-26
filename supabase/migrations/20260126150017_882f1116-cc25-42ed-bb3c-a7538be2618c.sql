-- Phase 1: Clean up existing duplicate room charges (keep the earliest one per admission+date)
DELETE FROM public.ipd_charges
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY admission_id, charge_date, charge_type ORDER BY created_at) as rn
    FROM public.ipd_charges
    WHERE charge_type = 'room'
  ) dupes
  WHERE rn > 1
);

-- Phase 2: Add unique constraint to prevent duplicate room charges per admission per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_ipd_charges_unique_room_per_day 
ON public.ipd_charges (admission_id, charge_date, charge_type) 
WHERE charge_type = 'room';