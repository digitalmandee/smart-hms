
-- Delete duplicate journal entry lines first
DELETE FROM journal_entry_lines WHERE journal_entry_id = (
  SELECT id FROM journal_entries WHERE entry_number = 'JE-GRN-260401-1924' LIMIT 1
);

-- Delete duplicate journal entry
DELETE FROM journal_entries WHERE entry_number = 'JE-GRN-260401-1924';

-- Recalculate balances for INV-001 and AP-001
UPDATE accounts SET current_balance = COALESCE(opening_balance, 0) + COALESCE((
  SELECT SUM(jel.debit_amount - jel.credit_amount)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.account_id = accounts.id AND je.is_posted = true
), 0)
WHERE account_number IN ('INV-001', 'AP-001');
