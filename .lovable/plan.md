

# Blood Bank Analytics Page with Seeded Demo Data

## Overview

Create a dedicated analytics page at `/app/blood-bank/analytics` with interactive recharts visualizations and hardcoded seed data so charts render immediately without requiring database records.

---

## New File: `src/pages/app/blood-bank/BloodBankAnalyticsPage.tsx`

A full analytics page with 4 chart sections and summary stats, using **hardcoded seed data** (no DB queries needed for the charts to display):

### Section 1: Summary Stats Row (4 cards)
- Total Collections This Month: 147
- Units Consumed This Month: 112
- Collection Rate: +12% vs last month
- Wastage Rate: 3.2%

Uses `ModernStatsCard` component (already exists).

### Section 2: Monthly Collection vs Consumption (Bar Chart)
- 12-month data (Mar 2025 -- Feb 2026)
- Dual bars: Collections (green) vs Consumption (red)
- Uses `ChartContainer`, `ChartTooltip`, recharts `BarChart`
- Seed data example: `{ month: "Mar", collected: 120, consumed: 98 }`

### Section 3: Blood Group Distribution (Pie Chart)
- 8 blood groups with realistic distribution percentages
- O+ largest (~35%), AB- smallest (~2%)
- Uses recharts `PieChart` with custom colors matching blood group badges
- Legend showing group + count

### Section 4: Donation Trends (Line Chart)
- 12-month line showing donation count trend
- Secondary line for completed vs rejected donations
- Uses recharts `LineChart` with dual lines

### Section 5: Component Type Breakdown (Horizontal Bar)
- whole_blood, packed_rbc, FFP, platelet_concentrate, cryoprecipitate
- Shows volume distribution across component types

All charts use the existing `ChartContainer` and `ChartTooltip` from `src/components/ui/chart.tsx`.

---

## Route Registration: `src/App.tsx`

- Import `BloodBankAnalyticsPage`
- Add route: `blood-bank/analytics` between existing blood-bank routes (after line 726)

---

## Dashboard Link: `src/pages/app/blood-bank/BloodBankDashboard.tsx`

- Add an "Analytics" button in the header actions bar linking to `/app/blood-bank/analytics`

---

## Translations: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`

New keys:
- `bb.analytics`: "Blood Bank Analytics" / "تحليلات بنك الدم" / "بلڈ بینک تجزیات"
- `bb.monthlyCollectionVsConsumption`: "Monthly Collection vs Consumption"
- `bb.bloodGroupDistribution`: "Blood Group Distribution"
- `bb.donationTrends`: "Donation Trends"
- `bb.componentBreakdown`: "Component Type Breakdown"
- `bb.totalCollections`: "Total Collections"
- `bb.totalConsumed`: "Total Consumed"
- `bb.collectionRate`: "Collection Rate"
- `bb.wastageRate`: "Wastage Rate"
- `bb.collected`: "Collected"
- `bb.consumed`: "Consumed"
- `bb.completed`: "Completed"
- `bb.rejected`: "Rejected"

---

## Seed Data Approach

All chart data is hardcoded directly in the page component as `const SEED_DATA = { ... }`. This ensures charts render visually rich content immediately. A comment notes these can later be replaced with real queries from `useBloodBank` hooks.

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/app/blood-bank/BloodBankAnalyticsPage.tsx` | **NEW** -- Full analytics page with 4 recharts charts + seed data |
| `src/App.tsx` | **EDIT** -- Add `blood-bank/analytics` route |
| `src/pages/app/blood-bank/BloodBankDashboard.tsx` | **EDIT** -- Add Analytics button to header |
| `src/lib/i18n/translations/en.ts` | **EDIT** -- Add ~13 translation keys |
| `src/lib/i18n/translations/ar.ts` | **EDIT** -- Add ~13 translation keys |
| `src/lib/i18n/translations/ur.ts` | **EDIT** -- Add ~13 translation keys |

