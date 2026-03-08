

# Plan: Dedicated KSA Integration Pages + Dashboard + Connection Testing

## Overview
Break the current tabbed NphiesSettingsPage into **7 dedicated pages** (one per integration), create a **KSA Integrations Dashboard** with usage stats, add **connection test buttons** on each page, and ensure `branch_admin` has access to all of them.

## New Pages (7 total)

Each page follows the same pattern: PageHeader + config panel + **Test Connection** button that calls the edge function in sandbox mode and shows success/failure toast.

| Page | Route | Component |
|---|---|---|
| NPHIES Settings | `settings/ksa/nphies` | Wraps `NphiesConfigPanel` + test button |
| Wasfaty Settings | `settings/ksa/wasfaty` | Wraps `WasfatyConfigPanel` + test button |
| Tatmeen Settings | `settings/ksa/tatmeen` | Wraps `TatmeenConfigPanel` + test button |
| HESN Settings | `settings/ksa/hesn` | Wraps `HesnConfigPanel` + test button |
| Nafath Settings | `settings/ksa/nafath` | New config panel + test button (calls `nafath-gateway` with sandbox action) |
| Sehhaty Settings | `settings/ksa/sehhaty` | New config panel + test button (calls `sehhaty-gateway` with sandbox push) |
| ZATCA Settings | `settings/ksa/zatca` | New config panel showing Phase 2 status + test button |
| **KSA Dashboard** | `settings/ksa-integrations` | Cards for all 7 integrations with usage counts + status + links |

## New Files

1. **`src/pages/app/settings/ksa/KsaIntegrationsPage.tsx`** — Dashboard with 7 cards (usage stats from DB, status badges, "Configure" links)
2. **`src/pages/app/settings/ksa/NphiesSettingsPage.tsx`** — Dedicated NPHIES page with config + test
3. **`src/pages/app/settings/ksa/WasfatySettingsPage.tsx`** — Dedicated Wasfaty page + test
4. **`src/pages/app/settings/ksa/TatmeenSettingsPage.tsx`** — Dedicated Tatmeen page + test
5. **`src/pages/app/settings/ksa/HesnSettingsPage.tsx`** — Dedicated HESN page + test
6. **`src/pages/app/settings/ksa/NafathSettingsPage.tsx`** — Config + test (calls nafath-gateway sandbox)
7. **`src/pages/app/settings/ksa/SehhatySettingsPage.tsx`** — Config + test (calls sehhaty-gateway sandbox)
8. **`src/pages/app/settings/ksa/ZatcaSettingsPage.tsx`** — Config + test (shows Phase 2 status)
9. **`src/hooks/useKsaIntegrationStats.ts`** — Hook fetching counts from `insurance_claims`, `invoices`, `wasfaty_prescriptions`, `tatmeen_transactions`, `hesn_reports`, `sehhaty_sync_log`, patients with `nafath_verified`
10. **`src/hooks/useKsaConnectionTest.ts`** — Reusable hook for testing each edge function connection (invokes function, shows toast with result)

## Modified Files

1. **`src/App.tsx`** — Add 9 new lazy routes under `settings/ksa/*`
2. **`src/components/DynamicSidebar.tsx`** — Add sidebar name mappings: "KSA Integrations", "NPHIES Settings", "Wasfaty Settings", etc.
3. **`src/pages/app/billing/NphiesSettingsPage.tsx`** — Keep as redirect to new `/app/settings/ksa/nphies` or keep as-is with link to new dashboard

## Connection Test Implementation

Each page gets a "Test Connection" card with a button that:
1. Calls `supabase.functions.invoke('<gateway-name>', { body: { action: 'test' | sandbox action } })`
2. Shows success toast with green checkmark or error toast with details
3. Displays last test timestamp and result

Test actions per integration:
- **NPHIES**: Calls eligibility check with test patient ID
- **Wasfaty**: Sends sandbox prescription push
- **Tatmeen**: Sends sandbox drug movement report
- **HESN**: Sends sandbox disease report
- **Nafath**: Initiates sandbox verification (auto-approves)
- **Sehhaty**: Pushes sandbox appointment sync
- **ZATCA**: Generates test QR code with dummy invoice data

## branch_admin Access

All routes use `<ProtectedRoute>` — no `requiredRole` restriction (same as current NPHIES settings). The `ADMIN_ROLES` array already includes `branch_admin`, so sidebar visibility is handled. Each page checks `country_code === 'SA'` and shows "KSA organizations only" message for non-SA orgs.

## Dashboard Layout

```text
┌─────────────────────────────────────────────────────────┐
│ 🇸🇦 KSA Compliance Integrations                         │
│ Monitor all Saudi regulatory integrations               │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ NPHIES       │ │ ZATCA Ph.2   │ │ Wasfaty      │     │
│ │ ● Connected  │ │ ● Active     │ │ ● Sandbox    │     │
│ │ Claims: 142  │ │ Invoices: 87 │ │ Rx: 23       │     │
│ │ [Configure]  │ │ [Configure]  │ │ [Configure]  │     │
│ │ [Test]       │ │ [Test]       │ │ [Test]       │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Tatmeen/RSD  │ │ HESN         │ │ Nafath       │     │
│ │ ○ Not Config │ │ ○ Sandbox    │ │ ○ Not Config │     │
│ │ Scans: 0     │ │ Reports: 5   │ │ Verified: 0  │     │
│ │ [Setup]      │ │ [Configure]  │ │ [Setup]      │     │
│ │ [Test]       │ │ [Test]       │ │ [Test]       │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
│ ┌──────────────┐                                        │
│ │ Sehhaty      │                                        │
│ │ ○ Not Config │                                        │
│ │ Synced: 0    │                                        │
│ │ [Setup]      │                                        │
│ │ [Test]       │                                        │
│ └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

## i18n

All labels use `t()` with fallback strings in English. Arabic and Urdu fallbacks included inline (e.g., `t("ksa.nphies", "NPHIES Insurance")`).

## Summary

| Type | Count |
|---|---|
| New pages | 9 |
| New hooks | 2 |
| Modified files | 3 |
| Total | ~14 files |

