-- Fix: Add 'pos_transaction' to journal_entries reference_type constraint
-- The post_pos_to_journal() trigger uses 'pos_transaction' but it's not in the allowed list

ALTER TABLE journal_entries 
DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;

ALTER TABLE journal_entries 
ADD CONSTRAINT journal_entries_reference_type_check 
CHECK (reference_type = ANY (ARRAY[
  'invoice'::text, 
  'payment'::text, 
  'pos_session'::text,
  'pos_transaction'::text,
  'grn'::text, 
  'vendor_payment'::text, 
  'manual'::text, 
  'adjustment'::text, 
  'opening'::text, 
  'closing'::text
]));