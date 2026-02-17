

# OPD Consultation UI/UX Overhaul + AI Enhancements + Session & Token Fixes

## Overview

This plan covers four major areas: (1) Consultation page redesign for better doctor UX, (2) AI-powered medicine alternatives and prescription assistance, (3) Session enforcement for walk-in payments, and (4) Token display and real-time updates.

---

## 1. Consultation Page UI/UX Redesign

### Current Problems
- Vitals form takes up a large card with 8 input fields always visible, even when nurse already recorded them
- All sections (chief complaint, vitals, symptoms, diagnosis, prescription, labs, follow-up) are stacked vertically in a long scroll
- No visual separation between "review" data (patient info, vitals) and "action" data (diagnosis, prescription)
- The AI panel is buried in the sidebar as a collapsible that most doctors won't notice

### Proposed Changes

**File: `src/pages/app/opd/ConsultationPage.tsx`**
- Restructure the 3-column layout:
  - **Left sidebar (narrow):** Patient Quick Info card (already exists), Allergies warning, Previous Visits
  - **Center (main):** Tabbed interface with tabs: "Clinical" | "Prescription" | "Labs" | "AI Assistant"
    - Clinical tab: Chief Complaint, Symptoms, Diagnosis, Clinical Notes, Follow-up
    - Prescription tab: PrescriptionBuilder + AI Medicine Alternatives panel
    - Labs tab: LabOrderBuilder
    - AI Assistant tab: Full DoctorAIPanel (expanded, not collapsed)
  - **Right sidebar:** Vitals summary (compact read-only badge view when nurse-recorded, expandable to edit)

**File: `src/components/consultation/VitalsForm.tsx`**
- Add a `compact` mode prop that shows vitals as a row of colored badges (e.g., "BP 120/80", "P 72", "T 98.6F", "SpO2 98%")
- When nurse vitals exist, default to compact mode with an "Edit Vitals" button to expand
- When no nurse vitals exist, show the full editable form

**File: `src/components/consultation/DiagnosisInput.tsx`**
- No structural change, but will be moved into the "Clinical" tab

---

## 2. AI Medicine Alternatives Panel (New Component)

### Purpose
Doctor types or selects a medicine name and instantly sees AI-suggested alternatives (generic equivalents, different brands, cost-effective options).

**New file: `src/components/ai/MedicineAlternatives.tsx`**
- Small card with a search input
- Doctor types a medicine name (e.g., "Augmentin 625mg")
- Calls existing `ai-assistant` edge function with mode `doctor_assist`
- Prompt asks for: generic name, 3-4 alternative brands available in Pakistan/region, price comparison hints, and any contraindication notes
- Results displayed as a compact list with "Use This" button to swap into the prescription

**Integration in ConsultationPage:**
- Placed inside the Prescription tab, below or beside PrescriptionBuilder
- Also accessible from each medicine row in PrescriptionBuilder via a small "Alternatives" icon button

---

## 3. AI Prescription Assistant Enhancement

### Current State
`PrescriptionSuggester.tsx` exists but is not used in ConsultationPage -- only `DoctorAIPanel` is shown.

### Proposed Changes

**File: `src/pages/app/opd/ConsultationPage.tsx`**
- Add `PrescriptionSuggester` component into the Prescription tab
- It auto-shows when a diagnosis is entered
- Doctor can also use the general DoctorAIPanel chat to ask anything clinical

**File: `src/components/ai/DoctorAIPanel.tsx`**
- Move from collapsed sidebar to a dedicated "AI Assistant" tab in the main area
- Remove the Collapsible wrapper when rendered inside a tab (add a `standalone` prop)
- Keep the collapsible behavior only when used elsewhere (e.g., mobile)

---

## 4. Session Enforcement for Walk-in Payments

### Current Problem
The walk-in page shows a `SessionStatusBanner` but does NOT block payment collection when no session is active. The `handlePaymentComplete` function proceeds regardless. Only the checkout page uses `SessionRequiredGuard`.

### Proposed Changes

**File: `src/pages/app/opd/OPDWalkInPage.tsx`**
- Wrap the payment step content with `SessionRequiredGuard` (same as OPDCheckoutPage does)
- When no session exists:
  - Show the session required prompt with "Open Session" button
  - Block the "Generate Token & Receipt" button
- "Pay Later" and "Waive Fee" should still work without a session (no cash collection)
- If a session already exists from a previous day, prompt to close it and open a new one (handled by the existing session management logic)

---

## 5. Token Display Enhancements

### 5a. Token Slip: Add Department/OPD Name and Date

**File: `src/components/clinic/PrintableTokenSlip.tsx`**
- Add optional `departmentName` prop
- Display department name below "OPD Token" label (e.g., "Medicine Department")
- Add appointment date display (currently only shows print date/time, but should show the appointment date prominently)

### 5b. Token Reset from Reception

**New file: `src/components/opd/TokenResetButton.tsx`**
- A button component for reception staff to reset the daily token counter
- Calls an RPC or updates the `opd_token_counters` table to reset the sequence for a specific department + date
- Shows confirmation dialog: "This will reset token numbering. Are you sure?"
- Only visible to users with reception/admin role

**Integration:**
- Add to the walk-in page header or as part of a settings dropdown
- Also accessible from the queue control page

### 5c. Doctor Starts Consultation -> Real-time Update on Display Screen

**Current State:**
The QueueDisplayPage already has real-time subscriptions for INSERT and UPDATE on appointments. When a doctor clicks "Start Consultation" on their dashboard, it updates the appointment status to `in_progress`, which triggers the realtime subscription and the display screen refetches and shows the patient as "Now Serving."

**This already works.** The existing implementation in QueueDisplayPage (lines 43-68) subscribes to postgres_changes on the appointments table and calls `refetch()` on any INSERT or UPDATE. No changes needed here.

However, to make it more visible:
- Add a brief animation/highlight on the "Now Serving" card when it changes (CSS transition)
- Add an optional audio chime when a new token is called (using the existing Volume2 icon hint)

**File: `src/pages/app/appointments/QueueDisplayPage.tsx`**
- Add a `previousTokenRef` to detect when the "Now Serving" token changes
- Play a browser notification sound when the token changes
- Add a pulse/scale animation to the token circle on change

---

## 6. Pending OPD Flow Fixes (from previous audit)

These were approved but not yet implemented:

### 6a. Walk-in: Link invoice_id to appointment

**File: `src/pages/app/opd/OPDWalkInPage.tsx`**
- After invoice creation in `handlePaymentComplete`, update appointment with `invoice_id`

### 6b. Walk-in: Auto check-in after registration

**File: `src/pages/app/opd/OPDWalkInPage.tsx`**
- Change status from `scheduled` to `checked_in` after walk-in registration so patient appears in doctor queue immediately

### 6c. Visit ID timezone fix

**File: `src/lib/visit-id.ts`**
- Use string parsing instead of `new Date()` to prevent timezone-shifted dates

---

## Technical Details

### File Changes Summary

| File | Change | Priority |
|------|--------|----------|
| `ConsultationPage.tsx` | Restructure to tabbed layout (Clinical / Prescription / Labs / AI) | HIGH |
| `VitalsForm.tsx` | Add compact badge mode for nurse-recorded vitals | HIGH |
| `MedicineAlternatives.tsx` (NEW) | AI medicine alternatives search panel | HIGH |
| `DoctorAIPanel.tsx` | Add `standalone` prop to remove Collapsible when in tab | MEDIUM |
| `OPDWalkInPage.tsx` | Wrap payment step with SessionRequiredGuard | HIGH |
| `OPDWalkInPage.tsx` | Link invoice_id, auto check-in, timezone fix | MEDIUM |
| `PrintableTokenSlip.tsx` | Add departmentName and appointment date display | MEDIUM |
| `TokenResetButton.tsx` (NEW) | Reception token counter reset | MEDIUM |
| `QueueDisplayPage.tsx` | Audio chime + animation on token change | LOW |
| `PrescriptionSuggester.tsx` | Integrate into Prescription tab | MEDIUM |
| `visit-id.ts` | Fix timezone parsing | LOW |

### Consultation Page New Layout (Desktop)

```text
+------------------+----------------------------------+------------------+
|  Patient Info    |  [Clinical] [Rx] [Labs] [AI]     | Vitals (compact) |
|  - Name, MR#    |                                  | BP: 120/80       |
|  - Age, Gender   |  (Active Tab Content)            | P: 72 bpm        |
|  - Blood Group   |                                  | T: 98.6 F        |
|  - Allergies!    |  Chief Complaint [________]       | SpO2: 98%        |
|                  |  Symptoms [tag] [tag] [+]         | Wt: 70kg         |
|  Previous Visits |  Diagnosis [________]             | [Edit Vitals]    |
|  - Visit 1      |  Clinical Notes [________]        |                  |
|  - Visit 2      |  Follow-up Date [calendar]        |                  |
|                  |                                  |                  |
|  Surgery Reqs    |  [Save Draft] [Recommend] [Done]  |                  |
+------------------+----------------------------------+------------------+
```

### AI Medicine Alternatives Flow

1. Doctor selects medicine in PrescriptionBuilder
2. Clicks alternatives icon on that medicine row
3. `MedicineAlternatives` panel opens showing the medicine name
4. AI returns: generic name, 3-4 brand alternatives, notes
5. Doctor clicks "Use This" on an alternative, it replaces the medicine in the prescription

### Session Guard Logic for Walk-in

```text
Payment Step:
  IF hasActiveSession:
    Show payment form normally
  ELSE:
    Show SessionRequiredGuard overlay
    "Pay Later" and "Waive Fee" buttons remain accessible (no cash involved)
```

