
-- Fix: Add patient_deposit and credit_note to journal_entries reference_type check
ALTER TABLE public.journal_entries DROP CONSTRAINT journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check 
  CHECK (reference_type = ANY (ARRAY['invoice','payment','pos_session','pos_transaction','grn','vendor_payment','manual','adjustment','opening','closing','donation','payroll','expense','shipment','stock_adjustment','patient_deposit','credit_note']));
