-- Seed default schedules for all active doctors (Monday-Saturday, 9 AM - 5 PM)
-- This enables time slot availability for appointment booking

INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active)
SELECT 
  d.id,
  day.num,
  '09:00'::time,
  '17:00'::time,
  15,  -- 15-minute slots
  1,   -- 1 patient per slot
  true
FROM doctors d
CROSS JOIN (
  SELECT 1 AS num UNION ALL  -- Monday
  SELECT 2 UNION ALL         -- Tuesday
  SELECT 3 UNION ALL         -- Wednesday
  SELECT 4 UNION ALL         -- Thursday
  SELECT 5 UNION ALL         -- Friday
  SELECT 6                   -- Saturday
) day
WHERE d.is_available = true
ON CONFLICT DO NOTHING;