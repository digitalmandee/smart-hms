-- Link Cash payment methods to CASH-001 ledger account
UPDATE public.payment_methods pm
SET ledger_account_id = a.id
FROM public.accounts a
WHERE a.account_number = 'CASH-001'
  AND a.organization_id = pm.organization_id
  AND pm.name ILIKE '%cash%'
  AND pm.ledger_account_id IS NULL;

-- Backfill existing deposits with open billing sessions
UPDATE public.patient_deposits pd
SET billing_session_id = bs.id
FROM public.billing_sessions bs
WHERE pd.billing_session_id IS NULL
  AND bs.opened_by = pd.created_by
  AND bs.status = 'open';