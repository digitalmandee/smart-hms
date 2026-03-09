

## Analysis Results

### 1. Doctor Wallet / Earnings: NOT WORKING

**Root cause**: There is NO automated mechanism to create `doctor_earnings` records when invoices are paid. The `doctor_earnings` table has only 1 record ever (from Feb 17, created manually). The OPD checkout flow creates invoices and records payments but never calls `useCreateDoctorEarning()` or inserts into `doctor_earnings`.

The doctor wallet system reads from `doctor_earnings` to calculate balances. Since no records are being created, the wallet shows Rs. 0 for all doctors.

**What needs to happen**: When an invoice is paid and contains a consultation item with a `doctor_id`, the system should automatically create a `doctor_earnings` record using the doctor's compensation plan (e.g., 50% consultation share for Dr. Ayesha = Rs. 1000 per Rs. 2000 consultation).

### 2. Invoice Items: `doctor_id` is NULL

All invoice items in the DB show `doctor_id = null`, even for consultation fees. The checkout code at line 226 correctly sets `doctorId: appointment.doctor?.id`, and the `createInvoice` mutation at line 235 maps it: `doctor_id: item.doctor_id || null`. The mapping chain looks correct (`doctorId` → `doctor_id`), so either the doctor object shape doesn't have `.id` at the top level, or a Supabase type issue is silently dropping it.

Looking at the select: `doctor:doctors(id, profiles(full_name), consultation_fee)` — this returns `appointment.doctor` as an object with `id`. The charge sets `doctorId: appointment.doctor?.id` which should work. I'd need to verify the actual runtime value, but the pattern appears correct.

### 3. Invoices Display: WORKING

All consultation invoices are showing correctly — 10+ invoices today with descriptions like "General Physician Consultation - Dr. Ayesha Nawaz", all with `status: paid` and correct amounts.

---

## Proposed Fix: Auto-create Doctor Earnings on Invoice Payment

### Approach: Database trigger on `invoice_payments` INSERT

Create a PostgreSQL trigger function that fires when a payment is recorded. It:
1. Checks if the invoice is now fully paid
2. Finds invoice items with a `doctor_id`
3. Looks up the doctor's compensation plan
4. Creates `doctor_earnings` records with correct share calculations

This is better than client-side code because it ensures earnings are always created regardless of which UI path creates the payment (OPD checkout, manual invoice, walk-in, etc).

### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.auto_create_doctor_earnings()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
  item RECORD;
  comp_plan RECORD;
  share_pct NUMERIC;
  share_amt NUMERIC;
  hosp_amt NUMERIC;
BEGIN
  -- Get the invoice
  SELECT * INTO inv FROM invoices WHERE id = NEW.invoice_id;
  IF NOT FOUND OR inv.status != 'paid' THEN
    RETURN NEW;
  END IF;

  -- Process each invoice item that has a doctor_id
  FOR item IN 
    SELECT * FROM invoice_items 
    WHERE invoice_id = NEW.invoice_id AND doctor_id IS NOT NULL
  LOOP
    -- Get compensation plan
    SELECT * INTO comp_plan 
    FROM doctor_compensation_plans 
    WHERE doctor_id = item.doctor_id AND is_active = true
    LIMIT 1;

    IF FOUND THEN
      share_pct := comp_plan.consultation_share_percent;
    ELSE
      share_pct := 0;
    END IF;

    share_amt := ROUND(item.total_price * share_pct / 100, 2);
    hosp_amt := item.total_price - share_amt;

    -- Avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM doctor_earnings 
      WHERE source_id = inv.id AND doctor_id = item.doctor_id
    ) THEN
      INSERT INTO doctor_earnings (
        organization_id, doctor_id, compensation_plan_id,
        earning_date, source_type, source_id, source_reference,
        patient_id, gross_amount, doctor_share_percent,
        doctor_share_amount, hospital_share_amount
      ) VALUES (
        inv.organization_id, item.doctor_id, comp_plan.id,
        CURRENT_DATE, 'consultation', inv.id, inv.invoice_number,
        inv.patient_id, item.total_price, share_pct,
        share_amt, hosp_amt
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fix `doctor_id` on invoice items

Also need to investigate why `doctor_id` is null. If it's a runtime issue, the trigger won't help. Need to add debug logging or fix the data mapping.

### Backfill existing data

Create a migration to backfill `doctor_earnings` for today's paid consultation invoices, and also fix `invoice_items.doctor_id` for existing consultation items.

### Summary of changes

1. **Migration 1**: Create trigger `auto_create_doctor_earnings` on `invoice_payments` INSERT
2. **Migration 2**: Fix `invoice_items.doctor_id` for existing consultation items + backfill `doctor_earnings` for today's paid invoices
3. **Code fix**: Verify/fix the `doctor_id` mapping in OPDCheckoutPage charge building to ensure it's not silently undefined

