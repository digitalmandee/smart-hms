

# Add MediCare Pharmacy Quick Login to Demo Page

## What Changes

Add a third demo section on the login page for the independent pharmacy, following the same pattern as the existing Hospital and Clinic sections.

## Details

**File: `src/pages/auth/LoginPage.tsx`**

1. Add a new `pharmacyDemoAccounts` array after `clinicDemoAccounts` (line 47):
   - `pharmacy@medicare.demo` -- Pharmacist (Pill icon, orange theme)

2. Add a new separator + grid section after the Clinic section (after line 347), with the heading **"Independent Pharmacy (MediCare Pharmacy)"** -- same layout pattern as the clinic section but single button in a 2-column grid.

No other files need changes. The `handleQuickLogin` function already handles any email with the shared `Demo@123` password.

