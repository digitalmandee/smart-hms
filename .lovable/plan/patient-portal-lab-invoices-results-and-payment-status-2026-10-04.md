# Patient Portal: lab invoices, results and payment status

## What already exists
- Portal at /portal with its own login, plus Dashboard, Appointments, Lab Results, Prescriptions, Invoices and Profile pages. All in English, Arabic and Urdu.
- Patients can only see their own bills and lab orders.
- Gaps:
  - Hospital staff have no way to create a portal login for a patient.
  - The Lab Results page shows only a note. It doesn't show each test's values, normal ranges or flags.
  - Patients can't see the test lines on a bill.
  - Payment status doesn't update on its own.

## What we will build

1. **Give a patient portal access (staff side)**
   - A "Patient Portal Access" card on the patient profile, for reception and admin.
   - Staff enter the patient's email. The system then:
     - creates the login with a temporary password,
     - links it to the patient,
     - shows the password once, with Copy and Send by WhatsApp buttons.
   - Staff can also reset the password or switch off access.
   - The card shows whether access is Active or Disabled, and when the patient last signed in.
   - The portal login page gets the hospital's logo and name, and a "Forgot password" link.

2. **Lab Results page (patient)**
   - One card per lab order. Each test shows its result values, units and normal range.
   - Values outside the normal range are flagged High or Low.
   - Results show only after the lab publishes them. Until then the card says "Results pending".
   - Each card shows the payment status of its bill, with a "View invoice" link.
   - Print or download of the report, using the existing report link and access code.

3. **Invoices page (patient)**
   - Tabs for All and Lab.
   - Each bill opens to show its lines (tests and services), the total, the amount paid and the amount owed.
   - Status badges show Paid, Partially paid or Pending, with the payment history.
   - Bills update by themselves when the hospital takes a payment.
   - Bills paid by a welfare fund show the fund's share.

4. **Dashboard**
   - Tiles for amount owed, pending lab results and latest results ready.

All new text will be in English, Arabic and Urdu, with right-to-left layouts for Arabic and Urdu.

## Technical details
- **New edge function `portal-account-manage`:**
  - Actions: create, reset and disable.
  - Checks the staff member's sign-in in code, and allows only org_admin, super_admin or receptionist.
  - Uses the service role inside the function to create the auth user and insert a `patient_portal_accounts` row. That row records `organization_id`, and staff can't access accounts outside their own organisation.
  - Validates every request with Zod.
- **Migration:**
  - Read-only policies for patients to see their own `lab_order_items`, `invoice_items` and payment rows, using `user_owns_patient()` through the parent order or bill.
  - Patients only see `lab_order_items` once the lab order is published.
  - Add `is_active` and `last_login_at` to `patient_portal_accounts` if they're missing.
  - Turn on live updates for `invoices`.
- **Portal pages:**
  - Update `PortalLabResultsPage` and `PortalInvoicesPage`.
  - Add an invoice detail drawer.
  - Live updates scoped to the patient, cleaned up when the page closes.
  - Reuse the existing `useTranslation` keys under `portal.*`, added to the en, ar and ur files.
- **Not included:** online card payment by patients. It can be added later through the existing payment-create function.
