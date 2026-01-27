
# OPD Workflow Evaluation & Enhancement Plan

## Executive Summary
The current OPD implementation is **well-structured** with a 7-step clinical workflow in place. However, there are some gaps in end-to-end data flow, Visit ID standardization, and checkout completion tracking that need attention.

---

## Current OPD Workflow Analysis

### Implemented 7-Step Process

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CURRENT OPD WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REGISTRATION          2. CHECK-IN              3. NURSE VITALS          │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │ Patient Reg  │───────▶│ Token Gen    │───────▶│ Record BP,   │          │
│  │ Walk-in/Apt  │        │ Queue Entry  │        │ Temp, Pulse  │          │
│  │ Fee Payment  │        │ Priority Set │        │ Chief Cmplnt │          │
│  └──────────────┘        └──────────────┘        └──────────────┘          │
│         │                       │                       │                   │
│         ▼                       ▼                       ▼                   │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │ OPDWalkIn    │        │ CheckInPage  │        │ NurseDashbd  │          │
│  │ AppointForm  │        │ TokenSlip    │        │ OPDVitals    │          │
│  └──────────────┘        └──────────────┘        └──────────────┘          │
│                                                                             │
│  4. QUEUE DISPLAY         5. CONSULTATION          6. ORDERS               │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐          │
│  │ Token Kiosk  │───────▶│ Doctor Exam  │───────▶│ Prescription │          │
│  │ Queue Screen │        │ Diagnosis    │        │ Lab Orders   │          │
│  │ Now Serving  │        │ Clinical Nte │        │ Imaging Req  │          │
│  └──────────────┘        └──────────────┘        └──────────────┘          │
│                                                                             │
│  7. BILLING/CHECKOUT                                                        │
│  ┌──────────────┐                                                           │
│  │ Pending Fees │                                                           │
│  │ Invoice Gen  │                                                           │
│  │ Payment      │                                                           │
│  └──────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What's Working Well

| Component | Status | Details |
|-----------|--------|---------|
| **Patient Registration** | Complete | Quick walk-in + scheduled appointment booking |
| **Token Generation** | Complete | Auto-increments per doctor/date, format: `OPD-YYYYMMDD-###` |
| **Check-In with Vitals** | Complete | Nurse can record BP, pulse, temp, SpO2, weight, height, BMI |
| **Priority/Triage** | Complete | 3-level (Normal, Urgent, Emergency) with visual badges |
| **Queue Management** | Complete | Priority-sorted, real-time refresh (30s interval) |
| **Doctor Dashboard** | Complete | Current patient, queue view, consultation entry |
| **Consultation** | Complete | Vitals pre-fill, symptoms, diagnosis, prescription, lab orders |
| **Patient Profile Integration** | Complete | OPD tab, Vitals tab, Billing tab all populated |
| **Payment Tracking** | Partial | `payment_status` and `invoice_id` columns exist |

---

## Gaps & Issues Identified

### 1. Visit ID Not Consistently Displayed
**Issue**: The `generateVisitId()` utility exists but not shown in all touchpoints.

| Page | Visit ID Shown? |
|------|-----------------|
| Check-In Page | No |
| Token Slip | No |
| Nurse Dashboard | No |
| Doctor Dashboard | No |
| Consultation Page | Yes |
| OPD Checkout | Yes |
| Patient Profile OPD Tab | Yes |

### 2. Walk-In Skips Nurse Vitals Step
**Issue**: `OPDWalkInPage.tsx` creates appointment with `status: 'checked_in'` but no vitals recorded.
- Patient goes directly to doctor queue without nurse triage
- Chief complaint defaulted to "OPD Consultation" (generic)

### 3. Consultation Completion Doesn't Navigate to Checkout
**Issue**: After completing consultation, doctor is sent to `/app/opd` but:
- No prompt to proceed to OPD Checkout
- Patient may leave without paying for lab/pharmacy orders

### 4. OPD Checkout Not Linked from Queue
**Issue**: Reception has no visibility on which completed patients need checkout.
- No "Pending Checkout" queue or filter
- Must manually track which patients finished consultation

### 5. Nurse Station Vitals Not Saved to Patient History
**Issue**: While `check_in_vitals` is stored in `appointments` table, the `usePatientVitalsHistory` hook already correctly fetches it. But:
- If doctor records different vitals in consultation, both should be visible
- Currently working correctly, but UI doesn't clarify "Nurse recorded" vs "Doctor recorded"

### 6. Follow-Up Appointment Not Auto-Created
**Issue**: Doctor can set `follow_up_date` in consultation, but:
- No automatic appointment created
- No reminder system

---

## Ideal OPD Process Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IDEAL OPD WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 1: PATIENT ARRIVAL                                             │   │
│  │ - Search existing patient OR register new                           │   │
│  │ - Select doctor (with queue count display)                          │   │
│  │ - Collect consultation fee (or mark as "pay later")                 │   │
│  │ - Generate Token with Visit ID: OPD-YYYYMMDD-###                    │   │
│  │ - Print Token Slip + Receipt                                        │   │
│  │ - Status: SCHEDULED (payment pending) or CHECKED_IN (fee paid)      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 2: NURSE TRIAGE (Optional but Recommended)                     │   │
│  │ - Patient appears in Nurse Station queue                            │   │
│  │ - Record vitals: BP, Pulse, Temp, SpO2, Weight, Height              │   │
│  │ - Set priority: Normal / Urgent / Emergency                         │   │
│  │ - Update chief complaint from patient interview                     │   │
│  │ - Status: CHECKED_IN + check_in_vitals populated                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 3: QUEUE DISPLAY                                               │   │
│  │ - Token Kiosk shows "Now Serving" per doctor                        │   │
│  │ - Priority-sorted queue (Emergency > Urgent > Normal)               │   │
│  │ - Estimated wait time based on avg consultation duration            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 4: DOCTOR CONSULTATION                                         │   │
│  │ - Doctor sees patient queue with vitals preview                     │   │
│  │ - Click to start: Status changes to IN_PROGRESS                     │   │
│  │ - Review/update vitals (pre-filled from nurse)                      │   │
│  │ - Record symptoms, examination, diagnosis                           │   │
│  │ - Create prescription (Rx) if needed                                │   │
│  │ - Order lab tests if needed                                         │   │
│  │ - Set follow-up date if needed                                      │   │
│  │ - Complete consultation: Status changes to COMPLETED                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 5: OPD CHECKOUT                                                │   │
│  │ - Patient proceeds to reception/billing                             │   │
│  │ - View pending charges: Lab, Pharmacy, Follow-up                    │   │
│  │ - Generate consolidated invoice                                     │   │
│  │ - Collect payment (or schedule for later)                           │   │
│  │ - Print visit summary + receipts                                    │   │
│  │ - Mark visit as CLOSED                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 6: FOLLOW-UP SERVICES                                          │   │
│  │ - Lab: Sample collection → Results → Notify patient                 │   │
│  │ - Pharmacy: Dispense prescription → Record in profile               │   │
│  │ - Follow-up: Auto-create next appointment if date set               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Patient Profile Integration Audit

### Data Flowing to Patient Profile

| Tab | Data Source | Status |
|-----|-------------|--------|
| **OPD Visits** | `appointments` table | Working - shows all visits with Visit ID |
| **Vitals** | `appointments.check_in_vitals` + `consultations.vitals` + `ipd_vitals` | Working - aggregated by `usePatientVitalsHistory` |
| **Consults** | `consultations` table | Working - shows diagnosis, symptoms |
| **Prescriptions** | `prescriptions` + `prescription_items` | Working - linked to consultation |
| **Lab** | `lab_orders` + `lab_order_items` | Working - linked to consultation |
| **Billing** | `invoices` + `payments` | Working - shows all financial records |

### Verified Working
- All OPD visits appear in patient profile OPD tab
- Vitals from nurse check-in are saved and visible in Vitals tab
- Vitals from doctor consultation are saved and visible
- Prescriptions appear in Rx tab
- Lab orders appear in Lab tab
- Invoices and payments appear in Billing tab

---

## Recommended Enhancements

### Priority 1: Critical Fixes

1. **Add Visit ID to Token Slip & Check-In Page**
   - Display `OPD-YYYYMMDD-TOKEN` prominently
   - Files: `PrintableTokenSlip.tsx`, `CheckInPage.tsx`

2. **Walk-In Should Not Skip Vitals**
   - Change `OPDWalkInPage` to set status as `scheduled` (not `checked_in`)
   - Or add a "Record Vitals Now" step before payment
   - File: `OPDWalkInPage.tsx`

3. **Consultation Completion Should Prompt Checkout**
   - After "Complete Consultation", show dialog with options:
     - "Send to Checkout" (if pending lab/Rx charges)
     - "Mark Complete" (if no pending charges)
   - File: `ConsultationPage.tsx`

### Priority 2: Workflow Improvements

4. **Add "Pending Checkout" Queue for Reception**
   - New page: `/app/opd/pending-checkout`
   - Filter appointments where `status = 'completed'` AND `has_pending_charges = true`
   - File: Create `PendingCheckoutPage.tsx`

5. **Auto-Create Follow-Up Appointment**
   - When doctor sets `follow_up_date`, create a tentative appointment
   - File: `ConsultationPage.tsx`, add to `saveConsultation()` function

6. **Nurse Station: Show Visit ID**
   - Add Visit ID column to nursing queue
   - File: `NurseDashboard.tsx`

### Priority 3: UX Enhancements

7. **Doctor Dashboard: Show Vitals Preview**
   - Before starting consultation, show key vitals inline
   - File: `DoctorDashboard.tsx`

8. **Token Kiosk: Estimated Wait Time**
   - Calculate based on average consultation duration
   - File: `TokenKioskPage.tsx`

9. **SMS Notification on Token Call**
   - Send SMS when patient's token is next
   - Requires: Supabase Edge Function + SMS provider

---

## Technical Implementation Details

### Files to Modify

| File | Change |
|------|--------|
| `src/components/clinic/PrintableTokenSlip.tsx` | Add Visit ID display |
| `src/pages/app/appointments/CheckInPage.tsx` | Add Visit ID in header |
| `src/pages/app/opd/OPDWalkInPage.tsx` | Status should be `scheduled` not `checked_in`, add vitals step option |
| `src/pages/app/opd/ConsultationPage.tsx` | Add checkout prompt after completion |
| `src/pages/app/opd/DoctorDashboard.tsx` | Show vitals inline for queue items |
| `src/pages/app/opd/NurseDashboard.tsx` | Add Visit ID column |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/app/opd/PendingCheckoutPage.tsx` | List patients needing checkout after consultation |

### Database Changes Required

None - existing schema is sufficient. The `appointments` table already has:
- `token_number` for Visit ID generation
- `payment_status` for tracking (pending/paid)
- `check_in_vitals` for nurse-recorded data
- `status` enum covering full workflow

---

## Summary of Findings

### What's Complete
- Full 7-step OPD workflow is implemented
- Token generation and queue management working
- Nurse vitals recording working
- Doctor consultation with Rx and Lab orders working
- Patient profile correctly aggregates all OPD data
- Billing integration with invoices and payments

### What Needs Attention
1. Visit ID not shown consistently across all touchpoints
2. Walk-in flow skips nurse triage (goes directly to queue)
3. No "Pending Checkout" visibility after consultation completion
4. Follow-up appointment not auto-created when doctor sets date

### Recommended Action
Implement Priority 1 fixes first to ensure complete data traceability, then add Priority 2/3 enhancements for smoother workflow.
