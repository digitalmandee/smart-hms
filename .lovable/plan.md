
# Fix Plan: OPD Lab/Radiology Commission Not Added to Doctor Wallet

## What I verified
- The recent paid OPD invoices do contain the expected items:
  - `INV-20260331-078` → `Lab Tests: Blood Culture` + `XRAY: Chest X-Ray (PA)`
  - `INV-20260331-182` → `Lab Tests: APTT` + `XRAY: Chest X-Ray (PA)`
- Both invoices are linked to appointments for **Dr. Ayesha Nawaz**
- The doctor has an active compensation plan with:
  - `consultation_share_percent = 50%`
  - `lab_referral_percent = 5%`
  - `radiology_referral_percent = 5%`
- But the database currently has:
  - consultation earnings present
  - **0** `lab_referral` earnings
  - **0** `radiology_referral` earnings

## Real root cause
There are **two different earnings triggers** right now:

1. `trg_post_consultation_earning`  
   - runs **AFTER UPDATE ON invoices**
   - this is why consultation is appearing

2. `trg_auto_create_doctor_earnings`  
   - runs **AFTER INSERT ON payments**
   - it immediately checks `inv.status = 'paid'`
   - but in app flow, payment is inserted **before** invoice status is updated to `paid`
   - so it exits early and never creates lab/radiology earnings

There is also a second bug in the new trigger function:
- it inserts into `doctor_earnings.reference_number`
- but the real column is `doctor_earnings.source_reference`

So even after the timing issue is fixed, that insert mapping must also be corrected.

## Implementation plan

### 1. Consolidate earnings creation into one invoice-paid trigger
**File:** new Supabase migration

Replace the current split logic with a single source of truth:
- create one unified function that runs when invoice status changes to `paid`
- handle all supported source types inside it:
  - consultation
  - lab_referral
  - radiology_referral
  - procedure
  - surgery

This removes the race condition caused by the payment trigger.

### 2. Move lab/radiology logic from payment trigger to invoice trigger
**File:** same migration

Update trigger wiring:
- **drop** `trg_auto_create_doctor_earnings` on `payments`
- create or reuse an **AFTER UPDATE ON invoices** trigger with:
  - `WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status)`

That matches how payment completion actually happens in the app.

### 3. Fix the insert column mapping
**File:** same migration

In the unified function:
- use `source_reference` instead of `reference_number`
- keep `source_id` as the invoice UUID
- use `item.total_price` for gross/share calculations

### 4. Preserve doctor resolution for OPD recommended services
**File:** same migration

Keep this lookup order:
1. `invoice_items.doctor_id`
2. fallback to `appointments.invoice_id -> appointments.doctor_id`

That is important because current OPD lab/radiology invoice items often have `doctor_id = null`, but the appointment still has the recommending doctor.

### 5. Keep duplicate protection per invoice + doctor + source type
**File:** same migration

Use duplicate check like:
- `source_id`
- `doctor_id`
- `source_type`

This allows one invoice to generate:
- one consultation earning
- one lab referral earning
- one radiology referral earning

without collisions.

### 6. Backfill the already-paid missing earnings
**Not schema; run as one-time data repair after deploy**

After the trigger fix, repair already-paid invoices that missed earnings:
- scan paid invoices with lab/radiology items
- insert missing `doctor_earnings` rows only where they do not already exist

This is required for the invoices you already tested today, otherwise only future payments will be fixed.

## Technical details

### Current problem in app flow
`useRecordPayment()` does:
1. insert into `payments`
2. then update `invoices.status = 'paid'`

So a trigger attached to `payments` cannot safely require `invoice.status = 'paid'` at trigger time.

### Safer architecture
```text
Invoice created
  -> Payment inserted
  -> Invoice status updated to paid
  -> Unified invoice-paid trigger creates all doctor earnings
```

### Patterns that should be supported
- `%consultation%` → `consultation`
- `%lab%`, `%test%`, `%pathology%`, `%blood%`, `%urine%`, `%culture%`, `%biopsy%`, `%cbc%`, `%hba1c%` → `lab_referral`
- `%radiology%`, `%imaging%`, `%x-ray%`, `%xray%`, `%ultrasound%`, `%ct scan%`, `%mri%`, `%echo%`, `%mammograph%` → `radiology_referral`
- `%procedure%` → `procedure`
- `%surgery%`, `%operation%`, `%surgical%` → `surgery`

### Earnings expected for the verified doctor setup
For Dr. Ayesha’s current plan:
- `APTT 900` → doctor share `45`
- `Chest X-Ray 300` → doctor share `15`
- `Blood Culture 2500` → doctor share `125`
- `Chest X-Ray 300` → doctor share `15`

These should appear as separate wallet lines under Lab Referral and Radiology Referral.

## Files to change
- `supabase/migrations/...sql`
  - replace the trigger/function design
  - remove payment-trigger dependency
  - fix `source_reference` mapping

## After implementation I will verify
1. pay a fresh OPD invoice with consultation + lab + radiology
2. confirm 3 earnings rows are created
3. confirm wallet page shows all categories
4. confirm backfilled rows appear for the already-paid missing invoices
