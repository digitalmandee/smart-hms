-- Fix JazzCash ledger mapping: point to Bank Account (1010) instead of Cash in Hand (CASH-001)
-- Org b1: JazzCash → Bank Account - Current
UPDATE payment_methods 
SET ledger_account_id = '280997ad-4971-4e03-a032-cae3077106b0'
WHERE id = 'f2a22222-2222-2222-2222-222222222222';

-- Org b2: JazzCash → Bank Account - Current
UPDATE payment_methods 
SET ledger_account_id = '6ace12c8-15d0-4778-b38d-1ef4ff83fffd'
WHERE id = 'f7a77777-7777-7777-7777-777777777777';