
# OPD Flow Analysis & Fix Plan

## Problems Identified

### 1. Walk-in Flow Actually EXISTS But Has Issues
The `OPDWalkInPage.tsx` DOES have a walk-in workflow (Patient → Doctor → Payment → Token), but:
- **Critical**: Invoice items are created WITHOUT a `doctor_id` column
- This breaks doctor wallet/earnings tracking since there's no way to know which doctor earned the consultation fee

### 2. Missing `doctor_id` in Invoice Items Table
The `invoice_items` table schema shows NO `doctor_id` column:
```
invoice_items: {
  bed_id, booking_dates, description, discount_percent, id, invoice_id,
  lab_order_id, medicine_inventory_id, quantity, service_type_id, total_price, unit_price
}
```
**Impact**: Consultation charges cannot be attributed to specific doctors for wallet credit.

### 3. Appointment Check-in Flow Issues
Current check-in flow (`CheckInPage.tsx`):
- Records vitals and priority ✓
- Prints token slip ✓
- **Does NOT create invoice at check-in**
- **Does NOT enforce payment collection**

The `AppointmentPaymentDialog.tsx` exists but is not integrated into the standard check-in flow.

### 4. Doctor Earnings Trigger is Fragile
The `post_consultation_earning` trigger attempts to find the doctor by:
```sql
SELECT c.id, c.doctor_id FROM consultations c
WHERE c.patient_id = NEW.patient_id
  AND c.created_at::date = NEW.invoice_date
```
This fails because:
- Walk-in patients don't have a consultation record at payment time
- Date matching is imprecise
- No direct link between invoice and doctor

---

## Required Changes

### Database Changes

1. **Add `doctor_id` column to `invoice_items`**
```sql
ALTER TABLE invoice_items 
ADD COLUMN doctor_id UUID REFERENCES doctors(id);
```

2. **Update `post_consultation_earning` trigger** to use direct doctor_id:
```sql
-- Look for doctor_id in invoice_items for consultation category
FOR v_item IN 
  SELECT ii.total_price, ii.doctor_id
  FROM invoice_items ii
  JOIN service_types st ON st.id = ii.service_type_id
  WHERE ii.invoice_id = NEW.id 
    AND st.category = 'consultation'
    AND ii.doctor_id IS NOT NULL
LOOP
  -- Credit doctor wallet using direct doctor_id
END LOOP;
```

### Frontend Changes

#### File: `src/hooks/useBilling.ts`
Update `useCreateInvoice` to accept and store `doctor_id` in invoice items:
```typescript
interface InvoiceItemInput {
  // ... existing fields
  doctor_id?: string | null; // Add this
}
```

#### File: `src/pages/app/opd/OPDWalkInPage.tsx`
Update invoice creation to include doctor_id:
```typescript
const invoice = await createInvoice.mutateAsync({
  patientId: selectedPatientId,
  branchId: profile.branch_id,
  items: [{
    description: `${selectedDoctor.specialty} Consultation - ${selectedDoctor.name}`,
    quantity: 1,
    unit_price: selectedDoctor.fee,
    doctor_id: selectedDoctor.id, // Add this
  }],
});
```

#### File: `src/components/appointments/AppointmentPaymentDialog.tsx`
Update to include doctor_id when creating invoice:
```typescript
const invoice = await createInvoice.mutateAsync({
  patientId: appointment.patient_id,
  branchId: appointment.branch_id,
  items: [{
    description: `Consultation Fee - Dr. ${doctorName}`,
    quantity: 1,
    unit_price: paymentAmount,
    doctor_id: appointment.doctor_id, // Add this
  }],
});
```

#### File: `src/pages/app/appointments/CheckInPage.tsx`
Add payment status check and prompt before completing check-in:
```typescript
// Before check-in, verify payment status
if (appointment.payment_status === 'pending') {
  // Show payment dialog or warning
  setShowPaymentDialog(true);
  return;
}
```

### New Components Needed

#### `PaymentRequiredDialog.tsx`
A dialog that appears at check-in if payment is pending, offering:
- Pay Now (opens payment collection)
- Pay Later (proceeds with warning)
- Waive Off (requires authorization)

---

## Updated OPD Flow

### Walk-in Patient Flow
```
1. Reception: Search/Register Patient
2. Reception: Select Doctor (shows fee, queue count)
3. Reception: Collect Payment (Pay Now / Pay Later / Waive)
   → Creates Invoice with doctor_id in items
   → Creates Appointment with scheduled status
4. Reception: Print Token Slip
5. Nurse: Record Vitals (Check-in with vitals)
6. Doctor: Start Consultation
7. Doctor: Complete Consultation
8. Checkout: Collect any pending fees (lab, pharmacy)
```

### Scheduled Appointment Flow
```
1. Patient arrives for scheduled appointment
2. Reception: Open appointment → Payment Dialog
   → If payment_status = pending: Show payment dialog
   → Collect payment OR Pay Later
   → Creates Invoice with doctor_id in items
3. Nurse: Check-in with vitals → Print Token
4. Doctor: Start Consultation
5. Doctor: Complete Consultation
6. Checkout: Collect any pending fees
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add `doctor_id` to `invoice_items`, update trigger |
| `src/hooks/useBilling.ts` | Add `doctor_id` to `InvoiceItemInput` interface |
| `src/pages/app/opd/OPDWalkInPage.tsx` | Pass `doctor_id` when creating invoice |
| `src/components/appointments/AppointmentPaymentDialog.tsx` | Include `doctor_id` in invoice items |
| `src/pages/app/appointments/CheckInPage.tsx` | Add payment status check before check-in |
| `src/pages/app/appointments/AppointmentDetailPage.tsx` | Show payment status, integrate payment dialog |
| NEW: `src/components/appointments/PaymentRequiredDialog.tsx` | Payment prompt component |

---

## Summary of Issues & Fixes

| Issue | Current State | Fix |
|-------|---------------|-----|
| Doctor not linked to invoice | `invoice_items` has no `doctor_id` | Add column, update creation logic |
| Doctor wallet not credited | Trigger uses fragile date-based lookup | Use direct `doctor_id` from invoice items |
| No payment at check-in | Check-in doesn't verify payment | Add payment status check before check-in |
| Token not printed at check-in | Actually works | No change needed |
| Walk-in flow missing | Actually exists at `/app/opd/walk-in` | Needs awareness + doctor_id fix |
