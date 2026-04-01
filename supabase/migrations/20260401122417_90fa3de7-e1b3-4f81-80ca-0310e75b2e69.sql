-- First clear FK reference from patient_deposits
UPDATE public.patient_deposits
SET journal_entry_id = NULL
WHERE journal_entry_id = 'c32e0ccb-1027-4a7e-b201-22a722cc877f';

-- Delete journal entry lines
DELETE FROM public.journal_entry_lines
WHERE journal_entry_id = 'c32e0ccb-1027-4a7e-b201-22a722cc877f';

-- Delete the duplicate journal entry
DELETE FROM public.journal_entries
WHERE id = 'c32e0ccb-1027-4a7e-b201-22a722cc877f';