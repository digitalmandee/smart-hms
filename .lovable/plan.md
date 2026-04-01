

# Fix: Link IPD Deposits to Billing Session + Cash Payment Method Ledger Account

## Two Issues

1. **IPD deposits missing from reception session reports** — `useCreateIPDDeposit` never sets `billing_session_id`, so deposits don't appear in session transaction lists.
2. **Cash payment method missing `ledger_account_id`** — causes trigger to fall back to CASH-001 implicitly instead of explicitly.

## Changes

### 1. `src/hooks/useIPDDeposit.ts` — Accept and pass `billingSessionId`

- Add `billingSessionId?: string` to `CreateIPDDepositParams`
- Include `billing_session_id: params.billingSessionId || null` in the INSERT payload
- Also invalidate `["billing-sessions"]` query key on success

### 2. `src/pages/app/ipd/AdmissionFormPage.tsx` — Pass active session ID

- Import `useRequireSession` from `@/hooks/useRequireSession`
- Call `useRequireSession("reception")` to get the active session
- Pass `billingSessionId: session?.id` in both `handlePaymentComplete` and `handlePayLater` calls to `createIPDDeposit.mutateAsync`

### 3. `supabase/migrations/new.sql` — Link Cash payment method to CASH-001

```sql
UPDATE public.payment_methods pm
SET ledger_account_id = a.id
FROM public.accounts a
WHERE a.account_number = 'CASH-001'
  AND a.organization_id = pm.organization_id
  AND pm.name ILIKE '%cash%'
  AND pm.ledger_account_id IS NULL;
```

Also backfill Ali Raza's existing deposit with the current open session (if one exists):
```sql
UPDATE public.patient_deposits pd
SET billing_session_id = bs.id
FROM public.billing_sessions bs
WHERE pd.billing_session_id IS NULL
  AND bs.user_id = pd.created_by
  AND bs.status = 'open';
```

## Files Changed
- `src/hooks/useIPDDeposit.ts` — add `billingSessionId` param + pass to INSERT
- `src/pages/app/ipd/AdmissionFormPage.tsx` — get active session, pass ID to deposit creation
- `supabase/migrations/new.sql` — link Cash payment method to CASH-001 account + backfill existing deposits

