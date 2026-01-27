
# OPD Consultation Fee Payment Enhancement Plan

## Overview
This plan addresses the Pakistan-specific OPD workflow where consultation fees are typically collected upfront but need flexibility for "Pay Later" and "Waive Off" scenarios. The implementation ensures tokens can move through the queue regardless of payment status while maintaining proper tracking and accountability.

## Current State Analysis

### What Exists
1. **`payment_status` column** on appointments: Supports `pending`, `paid`, `partial`, `waived`
2. **`AppointmentPaymentDialog`**: Has "Pay Now" and "Pay Later" buttons (IPD-style)
3. **`PaymentStatusBadge`** component: Displays payment status visually
4. **OPD Checkout**: Already detects unpaid consultation fees

### What's Missing
1. **OPDWalkInPage**: Only allows "Generate Token" after full payment - no "Pay Later" or "Waive" options
2. **Waiver Tracking**: No columns for `waived_by`, `waiver_reason`, `waived_at`
3. **Clinical Visibility**: Doctor/Nurse dashboards don't show payment status
4. **Doctor Waive Authority**: No UI for doctor to waive fees during consultation

## Proposed Workflow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   OPD CONSULTATION FEE PAYMENT FLOW                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCENARIO 1: PAY NOW (Default - Most Common)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Reception collects fee → Invoice created → Token generated          │   │
│  │ Status: payment_status = 'paid' | Token Color: Green                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SCENARIO 2: PAY LATER (Patient Promises to Pay)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Reception clicks "Pay Later" → Token generated (no invoice)         │   │
│  │ Status: payment_status = 'pending' | Token Color: Yellow/Amber      │   │
│  │ Fee collected at OPD Checkout after consultation                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SCENARIO 3: WAIVE OFF (Authority Required)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Doctor/Admin authorizes waiver → Token generated (no invoice)       │   │
│  │ Status: payment_status = 'waived' | Token Color: Gray               │   │
│  │ Tracked: waived_by (profile_id), waiver_reason, waived_at           │   │
│  │ No fee appears at checkout                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Database Schema Enhancement

**Migration: Add waiver tracking columns to appointments**

```sql
-- Add waiver tracking columns
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS waived_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS waiver_reason TEXT,
ADD COLUMN IF NOT EXISTS waived_at TIMESTAMPTZ;

-- Update payment_status check constraint to include 'pay_later'
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_payment_status_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived', 'pay_later'));

-- Add index for waiver queries
CREATE INDEX IF NOT EXISTS idx_appointments_waived_by ON appointments(waived_by) WHERE waived_by IS NOT NULL;

-- Add comment
COMMENT ON COLUMN appointments.waived_by IS 'Profile ID of person who authorized fee waiver';
COMMENT ON COLUMN appointments.waiver_reason IS 'Reason for waiving consultation fee';
COMMENT ON COLUMN appointments.waived_at IS 'Timestamp when fee was waived';
```

### Phase 2: Update OPDWalkInPage Payment Step

**Modify Step 3 (Payment) to include three options:**

1. **Pay Now (Primary)**: Current flow - collect payment, create invoice
2. **Pay Later (Secondary)**: Generate token with `payment_status: 'pending'`
3. **Waive Fee (Tertiary)**: Opens dialog requiring reason and authorization

**UI Changes:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Payment                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Consultation Fee: Rs. 1,500                                    │
│                                                                 │
│  [Payment Method Selection - if paying now]                     │
│  [Amount Received - if cash]                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Are you sure you want to skip payment?               │   │
│  │ Fee of Rs. 1,500 will be collected at checkout.         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────────┐   │
│  │ Pay Later  │  │ Waive Fee   │  │  Generate Token ➤     │   │
│  │ (pending)  │  │ (requires   │  │  & Collect Payment    │   │
│  │            │  │  reason)    │  │                       │   │
│  └────────────┘  └─────────────┘  └───────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Files to Modify:**
- `src/pages/app/opd/OPDWalkInPage.tsx`
  - Add "Pay Later" button handler
  - Add "Waive Fee" button with dialog
  - Track `waiver_reason` and `waived_by`

### Phase 3: Create Waiver Dialog Component

**New Component: `src/components/appointments/FeeWaiverDialog.tsx`**

```text
┌─────────────────────────────────────────────────────────────────┐
│ Waive Consultation Fee                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Patient: Ahmed Khan (MR-2025-00123)                           │
│  Doctor: Dr. Fatima Noor                                        │
│  Fee: Rs. 1,500                                                 │
│                                                                 │
│  Reason for Waiver *                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▾ Select reason                                         │   │
│  │   ○ Staff/Employee Benefit                              │   │
│  │   ○ Hospital Charity Case                               │   │
│  │   ○ Doctor's Request                                    │   │
│  │   ○ Management Approval                                 │   │
│  │   ○ Follow-up Visit (No Charge)                         │   │
│  │   ○ Other (specify below)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Additional Notes (if Other)                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Authorized By: Dr. Admin Name (auto-filled from session)       │
│                                                                 │
│  ⚠️ This action will be logged for audit purposes.              │
│                                                                 │
│         ┌──────────┐  ┌───────────────────────┐                │
│         │  Cancel  │  │  Confirm Waiver       │                │
│         └──────────┘  └───────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Update Clinical Dashboards with Payment Status

**Show payment status badges in queues so clinical staff are aware:**

1. **Doctor Dashboard** (`DoctorDashboard.tsx`):
   - Add `PaymentStatusBadge` next to token number
   - Color coding: Green (paid), Amber (pending), Gray (waived)

2. **Nurse Dashboard** (`NurseDashboard.tsx`):
   - Add payment status indicator to queue items
   - Enable nurse to see if patient still needs to pay

3. **Patient Queue** (`PatientVitalsCard.tsx`):
   - Include payment status in the card display

**Example Queue Item Display:**
```text
┌─────────────────────────────────────────────────────────────────┐
│  #15  │ Ahmed Khan          │ Urgent │ BP: 140/90 │ ⚠️ Unpaid │
│       │ MR-2025-00123       │        │ P: 88      │           │
│       │ Chief: Chest pain   │        │ T: 99.2°F  │           │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 5: Update Consultation Page for Doctor Waiver

**Allow doctor to waive fees during/after consultation:**

Add a "Waive Fee" option in the consultation page for cases where:
- Payment is still pending
- Doctor determines patient qualifies for charity/waiver

**Location:** Sidebar or action menu in `ConsultationPage.tsx`

### Phase 6: Enhanced Checkout Flow

**Update `OPDCheckoutPage.tsx` to handle different payment scenarios:**

1. If `payment_status = 'pending'` or `'pay_later'`:
   - Show consultation fee in pending charges
   - Allow collection at this point

2. If `payment_status = 'waived'`:
   - Show "Fee Waived" badge with reason
   - Do not include in charges

3. Display waiver audit info:
   - "Waived by: Dr. Admin"
   - "Reason: Staff Benefit"
   - "At: Jan 27, 2026 10:30 AM"

### Phase 7: Token Slip Enhancement

**Update `PrintableTokenSlip.tsx` to show payment status:**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    SMART HMS HOSPITAL                           │
│                     OPD Token Slip                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           TOKEN: 015                                            │
│           Visit: OPD-20260127-015                               │
│                                                                 │
│  Patient: Ahmed Khan                                            │
│  MR#: MR-2025-00123                                             │
│  Doctor: Dr. Fatima Noor (General Medicine)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Payment Status: ⚠️ PENDING - Rs. 1,500                  │   │
│  │ Please pay at billing counter after consultation        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Date: Jan 27, 2026 | Time: 10:30 AM                           │
└─────────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/appointments/FeeWaiverDialog.tsx` | Waiver authorization dialog |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/app/opd/OPDWalkInPage.tsx` | Add Pay Later, Waive Fee buttons and handlers |
| `src/pages/app/opd/DoctorDashboard.tsx` | Show payment status badge in queue |
| `src/pages/app/opd/NurseDashboard.tsx` | Show payment status in patient cards |
| `src/pages/app/opd/ConsultationPage.tsx` | Add waiver option for doctors |
| `src/pages/app/opd/OPDCheckoutPage.tsx` | Handle waived status in checkout |
| `src/components/clinic/PrintableTokenSlip.tsx` | Display payment status |
| `src/components/appointments/PrintableTokenSlip.tsx` | Display payment status |
| `src/components/nursing/PatientVitalsCard.tsx` | Add payment badge |
| `src/components/radiology/PaymentStatusBadge.tsx` | Add 'pay_later' status |

## Technical Considerations

1. **Permission Check**: Waiver authorization should verify user has appropriate role (doctor, admin)
2. **Audit Trail**: All waivers are tracked with who, when, and why
3. **Queue Movement**: Token moves through queue regardless of payment status
4. **Checkout Enforcement**: Unpaid fees surface at checkout (unless waived)
5. **Reusable Component**: `FeeWaiverDialog` can be used in AppointmentFormPage too

## Summary

This implementation provides:
- **Flexibility**: Three payment options (Pay Now, Pay Later, Waive)
- **Accountability**: Full audit trail for waivers
- **Visibility**: Payment status shown across all clinical touchpoints
- **Enforcement**: Unpaid fees collected at checkout
- **Pakistan Context**: Matches local hospital workflow expectations
