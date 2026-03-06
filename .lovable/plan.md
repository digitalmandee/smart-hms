

# Separate Insurance Module from Billing

## Problem
All insurance pages (companies, plans, claims, NPHIES settings, NPHIES analytics) are nested under **Billing** in the sidebar. The NPHIES pages were never added to `menu_items` at all. The user wants:
1. Insurance as its own top-level sidebar module — separate from Billing
2. Within Insurance, two clear sections: **Manual Insurance** (companies, plans, claims) and **NPHIES** (settings, analytics)

## Current State
- `menu_items` has `billing.insurance` as a child of `billing` with children: companies, plans, claims, claims-report
- NPHIES Settings and NPHIES Analytics have **no menu_items** entries — they're invisible in navigation
- `available_modules` has no `insurance` module — insurance visibility is not independently controllable
- There are also duplicate legacy entries (`insurance_companies`, `insurance_plans`, `insurance_claims`) still in the table
- Routes are all under `/app/billing/insurance/*` and `/app/billing/claims/*`

## Solution

### 1. Add `insurance` to `available_modules` table
New module with code `insurance`, name `Insurance`, category `clinical`, so organizations can enable/disable it independently from billing.

### 2. Create new top-level `insurance` menu item with two sub-groups

```text
Insurance (top-level, icon: ShieldCheck)
├── Manual Insurance (group header)
│   ├── Insurance Companies → /app/insurance/companies
│   ├── Insurance Plans     → /app/insurance/plans
│   ├── Claims              → /app/insurance/claims
│   └── Claims Report       → /app/insurance/claims-report
└── NPHIES (group header)
    ├── NPHIES Settings     → /app/insurance/nphies/settings
    └── NPHIES Analytics    → /app/insurance/nphies/analytics
```

### 3. Database migration (SQL)
- Insert `insurance` into `available_modules`
- Insert new top-level `insurance` menu item
- Insert two sub-group headers: `insurance.manual` and `insurance.nphies`
- Insert 6 child menu items under the appropriate groups
- Set `required_module = 'insurance'` on the top-level item
- Deactivate old `billing.insurance.*` and legacy `insurance_*` menu items
- Enable `insurance` module for all existing organizations

### 4. New routes in App.tsx
Add new route paths under `/app/insurance/*`:
- `/app/insurance/companies` → InsuranceCompaniesPage
- `/app/insurance/plans` → InsurancePlansPage  
- `/app/insurance/claims` → ClaimsListPage
- `/app/insurance/claims/new` → ClaimFormPage
- `/app/insurance/claims/:id` → ClaimDetailPage
- `/app/insurance/claims-report` → ClaimsReportPage
- `/app/insurance/nphies/settings` → NphiesSettingsPage
- `/app/insurance/nphies/analytics` → NphiesAnalyticsPage

Keep old `/app/billing/insurance/*` routes as redirects for backward compatibility.

### 5. Translation updates
Add insurance module translations in EN, AR, UR for the new menu labels.

### 6. Facility type filter update
Add `/app/insurance` to the clinical path prefixes in `facility-type-filter.ts` so warehouse/pharmacy types don't see insurance.

## Files to Change

| File | Action |
|------|--------|
| SQL migration | New module, menu items, deactivate old entries |
| `src/App.tsx` | Add `/app/insurance/*` routes, keep old routes as redirects |
| `src/lib/facility-type-filter.ts` | Add `/app/insurance` to clinical paths |
| `src/lib/i18n/translations/en.ts` | Insurance module translations |
| `src/lib/i18n/translations/ar.ts` | Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Urdu translations |
| `src/components/insurance/NphiesDashboardCard.tsx` | Update "View Analytics" link to new path |

