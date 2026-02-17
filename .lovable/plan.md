

# OPD Flow Audit: Gaps and Enhancements

## Audit Summary

I traced the entire OPD flow end-to-end: Walk-in registration, token generation, token screen display, doctor dashboard, consultation, prescription, checkout/invoicing, and doctor wallet commissions. Here are the findings.

---

## Critical Bug Found

### Checkout Page Never Receives Appointment ID (CRITICAL)

The `ConsultationPage` and `PendingCheckoutPage` both navigate to:
```
/app/opd/checkout?appointmentId=XXX  (query parameter)
```

But `OPDCheckoutPage` reads from:
```
const { appointmentId } = useParams();  (route parameter)
```

This means when a doctor completes a consultation with pending orders and gets redirected to checkout, the `appointmentId` is **always undefined**, making the checkout page show "Appointment not found". This breaks the entire post-consultation billing flow.

**Fix:** Add `useSearchParams` fallback in `OPDCheckoutPage` so it reads from either route params or query params.

---

## Commission Pipeline Verification

### Previously Fixed (confirmed working in code)

The last round of changes correctly added `doctor_id` and `service_type_id` to invoice items in both `OPDCheckoutPage` and `OPDWalkInPage`. The database trigger `post_consultation_earning` is properly structured to:

1. Find invoice items with `doctor_id` + `service_type_id` (consultation category)
2. Look up the doctor's `compensation_plan` (50% default share)
3. Insert into `doctor_earnings`
4. Has fallback logic for backwards compatibility

### Still Broken: Historical invoices have no commission

Verified in the database: the paid invoice `INV-20260128-610` ("General Physician Consultation - Dr. Dr. Ayesha Nawaz") has `doctor_id: NULL` and `service_type_id: NULL`. No `doctor_earnings` records exist. These were created before the fix and cannot be retroactively corrected by the trigger (it only fires on status change to "paid").

---

## Token Display Gap

### Department-Prefixed Token Not Shown (MEDIUM)

The `generate_opd_token` RPC returns `token_display` (e.g., "MED-001") but this value is:
- Generated in `useCreateAppointment` and returned as part of the result
- **Never stored** in the appointments table (no `token_display` column)
- **Never used** in any UI component

The walk-in complete screen shows just `{tokenNumber}` (plain number), the `PrintableTokenSlip` shows `#{tokenNumber}`, and the doctor dashboard shows `Token #{apt.token_number}`. The department prefix is lost.

**Fix:** Use `formatTokenDisplay()` from `src/lib/opd-token.ts` along with the OPD department code from the appointment's `opd_department` relation.

---

## Complete Fix Plan

### 1. Fix Checkout Page Routing (CRITICAL)

**File:** `src/pages/app/opd/OPDCheckoutPage.tsx`

- Import `useSearchParams` from react-router-dom
- Read `appointmentId` from either route params or query params:
  ```
  const { appointmentId: routeAppointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = routeAppointmentId || searchParams.get("appointmentId");
  ```

### 2. Show Department-Prefixed Token in Walk-In Complete Screen

**File:** `src/pages/app/opd/OPDWalkInPage.tsx`

- Store `token_display` from `createAppointment` result (it already returns this)
- Show `token_display || tokenNumber` in the complete step UI
- Pass `token_display` to `PrintableTokenSlip` (update the component to accept and display it)

### 3. Show Department-Prefixed Token in Doctor Dashboard

**File:** `src/pages/app/opd/DoctorDashboard.tsx`

- Use the `opd_department` relation (already fetched via `useAppointments`) to format token display
- Replace `Token #{apt.token_number}` with formatted token using department code

### 4. Show Department-Prefixed Token in PrintableTokenSlip

**File:** `src/components/clinic/PrintableTokenSlip.tsx`

- Add optional `tokenDisplay` prop
- Show `tokenDisplay` when available, fall back to `#{tokenNumber}`

### 5. Remove `(supabase as any)` Cast

**File:** `src/pages/app/opd/OPDCheckoutPage.tsx` and `OPDWalkInPage.tsx`

The `service_types` table is in the Supabase types, so the `as any` cast is unnecessary. Remove it for proper type safety.

---

## Technical Changes Summary

| File | Change | Priority |
|------|--------|----------|
| `OPDCheckoutPage.tsx` | Fix appointmentId routing (useSearchParams fallback) | CRITICAL |
| `OPDCheckoutPage.tsx` | Remove `(supabase as any)` cast | LOW |
| `OPDWalkInPage.tsx` | Store and display `token_display` from appointment result | MEDIUM |
| `OPDWalkInPage.tsx` | Remove `(supabase as any)` cast | LOW |
| `PrintableTokenSlip.tsx` | Add `tokenDisplay` prop, show prefixed token | MEDIUM |
| `DoctorDashboard.tsx` | Format token with department code | MEDIUM |
| `MobileDoctorView.tsx` | Format token with department code | MEDIUM |

