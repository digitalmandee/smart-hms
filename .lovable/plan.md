

# NPHIES Analytics Page

## What We're Building
A dedicated full-page NPHIES analytics page at `/app/billing/nphies-analytics` with:
1. **Summary KPI cards** — Total NPHIES claims, approved/rejected/pending counts, total approved SAR, average processing time
2. **Claims history table** — All NPHIES-submitted claims with claim number, patient, payer, amount, NPHIES status, submission date, filterable and sortable
3. **Monthly trends chart** — Bar/line chart showing claims submitted vs approved vs rejected per month
4. **Payer breakdown table + chart** — Per-insurance company: claims count, approval rate, amounts
5. **Exportable** — CSV and PDF export via existing `ReportExportButton`

## Files to Create/Change

| File | Action |
|------|--------|
| `src/pages/app/billing/NphiesAnalyticsPage.tsx` | **New** — Full analytics page |
| `src/hooks/useNphiesAnalytics.ts` | **New** — Hook querying `insurance_claims` where `nphies_claim_id IS NOT NULL`, with date filtering, monthly aggregation, payer breakdown |
| `src/App.tsx` | Add route `billing/nphies-analytics` |
| `src/components/insurance/NphiesDashboardCard.tsx` | Add "View Analytics" link to the new page |
| `src/lib/i18n/translations/en.ts` | Add analytics page translations |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |

## Hook Design (`useNphiesAnalytics`)
- Queries `insurance_claims` joined with `insurance_companies`, `patients`, filtering by `nphies_claim_id IS NOT NULL` and date range
- Computes: summary stats, monthly trend (group by month), payer breakdown (group by company), and returns raw claims list for the table
- Reuses existing patterns from `useClaimsReports.ts`

## Page Layout
- `PageHeader` with title + `ReportExportButton`
- Date range filter card
- 4 KPI `StatsCard`s in a grid
- Tabs: "Claims History" | "Monthly Trends" | "Payer Breakdown"
  - Claims History: filterable table with NPHIES status badges, export
  - Monthly Trends: `BarChart` from recharts (submitted/approved/rejected per month)
  - Payer Breakdown: table + pie chart showing per-company approval rates and amounts

