

# Fix: Add NPHIES Dashboard Widget to Main Dashboard

## Problem
The `NphiesDashboardCard` is only rendered on the **Billing Dashboard** (`/app/billing`), but branch_admin users land on `/app/dashboard` which renders `DashboardPage.tsx` — this page has no NPHIES widget.

## Solution
Add the `NphiesDashboardCard` to `DashboardPage.tsx` for clinical facility types. It will appear alongside the existing Pharmacy Alerts section, only when NPHIES is enabled (the component already handles this check internally with `if (!nphiesConfig?.nphies_enabled) return null`).

## Changes

| File | Change |
|------|--------|
| `src/pages/app/DashboardPage.tsx` | Import `NphiesDashboardCard` and render it in the bottom grid section alongside `PharmacyAlertsWidget` for clinical facilities |

The widget self-hides when NPHIES is not enabled, so no extra role/permission checks are needed. The RLS on `organization_settings` already allows any org member to read settings.

