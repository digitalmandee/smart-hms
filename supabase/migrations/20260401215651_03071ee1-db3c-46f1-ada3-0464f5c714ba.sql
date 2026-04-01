
DO $$
BEGIN
  ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
  ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_reference_type_check
    CHECK (reference_type IN (
      'invoice', 'payment', 'expense', 'transfer', 'adjustment',
      'opening_balance', 'manual', 'payroll', 'patient_deposit',
      'deposit_application', 'deposit_refund', 'pos_sale', 'pos_transaction',
      'credit_note', 'debit_note', 'grn', 'vendor_payment',
      'stock_writeoff', 'donation', 'cash_to_bank'
    ));
END $$;
