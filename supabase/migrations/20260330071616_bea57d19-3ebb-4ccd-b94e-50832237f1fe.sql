
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check
  CHECK (reference_type IN ('invoice', 'payment', 'expense', 'transfer', 'opening_balance', 'manual', 'vendor_payment', 'payroll', 'patient_deposit', 'credit_note', 'debit_note', 'settlement', 'stock_adjustment', 'shipment', 'grn', 'pos_transaction', 'financial_donation', 'donation'));
