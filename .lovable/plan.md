

# Fix: Paid Walk-ins Showing "Unpaid" on Doctor Queue

## Root Cause Analysis

Two separate bugs are causing this:

### Bug 1: Race condition in trigger
The walk-in flow creates the **invoice first**, then the **appointment 2-3 seconds later**. The DB trigger `sync_appointment_payment_status` fires on invoice INSERT — but at that moment, the appointment doesn't exist yet. By the time the appointment is created, the trigger has already fired and missed it.

**Evidence** (all today's walk-ins):
- Invoice created at 19:06:48 → Appointment created at 19:06:50 (Muhammad Ali)
- Invoice created at 09:31:04 → Appointment created at 09:31:08 (NEW OPD)
- Same pattern for all 5 unpaid appointments

### Bug 2: Timezone mismatch (Muhammad Ali specifically)
`format(new Date(), "yyyy-MM-dd")` uses local time (PKT, UTC+5). After 7pm UTC (midnight PKT), it generates the **next day's date**. Muhammad Ali's appointment was created at 19:06 UTC → local date is March 10, but invoice_date is March 9. This breaks the trigger's fallback match on `appointment_date = invoice_date`.

### Why the previous fix didn't help
The code fix (passing `invoice_id` directly in `createAppointment.mutateAsync`) was correct but was deployed **after** these appointments were already created. The existing 5 appointments remain broken.

## Plan

### 1. Data fix: Link existing orphaned appointments
Run a migration to retroactively link today's paid invoices to their unlinked appointments by matching `patient_id` and allowing ±1 day date tolerance (to handle timezone edge cases).

```sql
UPDATE appointments a
SET invoice_id = i.id, payment_status = 'paid'
FROM invoices i
WHERE i.patient_id = a.patient_id
  AND i.status = 'paid'
  AND ABS(a.appointment_date - i.invoice_date) <= 1
  AND a.invoice_id IS NULL
  AND a.payment_status = 'pending'
  AND a.appointment_date >= '2026-03-09';
```

### 2. Fix timezone issue in OPDWalkInPage.tsx
The `appointment_date` should use UTC date (matching invoice_date) to avoid mismatches. Replace `format(new Date(), "yyyy-MM-dd")` with a UTC-based date string, or better yet, use the invoice's date to guarantee consistency.

### 3. Improve trigger to handle race condition (belt-and-suspenders)
Update `sync_appointment_payment_status` trigger to also fire on appointment INSERT — so when a new appointment is created with a `patient_id` that already has a paid invoice for that date, it auto-links. This covers any edge case where `invoice_id` isn't passed in the code.

### Files to modify
- **SQL Migration**: Data fix + trigger enhancement
- `src/pages/app/opd/OPDWalkInPage.tsx`: Fix timezone in appointment_date

