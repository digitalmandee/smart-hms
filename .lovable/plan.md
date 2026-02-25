

# Blood Bank Enhancements: Expiry Alerts & Donor History Timeline

## Overview

Two enhancements:
1. **Dashboard expiry alert banner** -- prominently flag units expiring within 3 days on the Blood Bank dashboard
2. **Enhanced Donor Detail page** -- add visual donation timeline, eligibility progress bar, and days-since-last-donation tracking

No database changes needed. All data already exists in `blood_inventory` (expiry_date) and `blood_donations` (donation history per donor).

---

## Task 1: Dashboard Expiry Alert Banner

### New File: `src/components/blood-bank/ExpiryAlertBanner.tsx`

A prominent alert component that:
- Queries `blood_inventory` for units with `status = 'available'` and `expiry_date` within 3 days
- Shows a red/amber alert banner at the top of the dashboard with count and blood group breakdown
- "View Expiring Units" button links to `/app/blood-bank/inventory?expiring=true`
- Only renders when count > 0
- Shows individual blood group counts (e.g., "2x A+, 1x O-")

### New Hook: `useExpiringUnits` in `src/hooks/useBloodBank.ts`

```typescript
export function useExpiringUnits(withinDays: number = 3) {
  // Fetches blood_inventory where status='available' and expiry_date <= now + withinDays
  // Returns array of units with blood_group, unit_number, expiry_date
}
```

### Modified File: `src/pages/app/blood-bank/BloodBankDashboard.tsx`

- Import and render `<ExpiryAlertBanner />` between the page header and stats cards
- The banner auto-hides when no units are expiring

---

## Task 2: Enhanced Donor Detail Page

### Modified File: `src/pages/app/blood-bank/DonorDetailPage.tsx`

Add three new sections:

**A. Eligibility Progress Bar (in sidebar Eligibility card)**
- Visual progress bar showing days elapsed since last donation out of 56-day minimum
- Color-coded: red (0-28 days), amber (28-49 days), green (49-56+ days)
- Text: "32 of 56 days completed" or "Eligible! 72 days since last donation"

**B. Donation Timeline (replaces simple list)**
- Vertical timeline with connected dots and lines
- Each donation shows: date, donation number, volume, status badge
- Color-coded dots: green (completed), blue (processing), red (rejected)
- Shows time gap between donations in the connecting line area
- Most recent donation at top

**C. Donation Stats Summary (new card in sidebar)**
- Average volume per donation
- Most common donation type
- Months since first donation (tenure)
- Success rate (completed / total)

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/blood-bank/ExpiryAlertBanner.tsx` | **NEW** -- Dashboard expiry alert with blood group breakdown |
| `src/hooks/useBloodBank.ts` | **EDIT** -- Add `useExpiringUnits` hook |
| `src/pages/app/blood-bank/BloodBankDashboard.tsx` | **EDIT** -- Add expiry alert banner |
| `src/pages/app/blood-bank/DonorDetailPage.tsx` | **EDIT** -- Add timeline, progress bar, stats |

## Trilingual Support

All new UI strings will support English, Urdu, and Arabic using the existing `useTranslation()` pattern.

