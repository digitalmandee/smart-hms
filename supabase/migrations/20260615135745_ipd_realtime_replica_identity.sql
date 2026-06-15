-- Ensure DELETE events on realtime carry filter columns (admission_id, patient_id)
ALTER TABLE public.ipd_charges REPLICA IDENTITY FULL;
ALTER TABLE public.patient_deposits REPLICA IDENTITY FULL;
