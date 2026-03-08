

# Fix: Add WasfatyStatusBadge to PrescriptionQueuePage

## Problem
`WasfatyStatusBadge` is imported but never rendered in the table columns. The query also doesn't fetch Wasfaty submission data.

## Changes

### 1. Update `usePrescriptionQueue` hook (`src/hooks/usePharmacy.ts`)
- Join `wasfaty_prescriptions` table in the query: add `wasfaty:wasfaty_prescriptions(id, wasfaty_reference_id, submission_status)` to the select
- Extend `PrescriptionQueueItem` interface with optional `wasfaty` field

### 2. Update `PrescriptionQueuePage.tsx`
- Add a conditional Wasfaty status column (only when `showWasfaty === true`) between the "status" and "actions" columns
- The column renders `WasfatyStatusBadge` using the joined wasfaty data, or a "Not Submitted" outline badge when no wasfaty record exists
- Build columns array dynamically: base columns + wasfaty column (if KSA) + actions column

