

# Fix: Missing Icons + Add NPHIES Pre-Approvals & Eligibility Pages

## Problems Identified

1. **Missing icons in sidebar icon maps** — The migration uses `CloudUpload` and `FileCheck` icons for menu items, but neither is imported or registered in `DynamicSidebar.tsx` or `MobileSideMenu.tsx`. This causes those menu items to fall back to a default icon or not render properly.

2. **Missing NPHIES pages in navigation** — The insurance module currently only has Claims, Companies, Plans, Claims Report, NPHIES Settings, and NPHIES Analytics. It's missing dedicated pages for:
   - **Eligibility Checks** (currently only accessible inline from patient profiles)
   - **Pre-Authorizations** (currently only accessible from within a claim detail page)

## Changes

### 1. Add missing icons to both sidebar components
Add `CloudUpload` and `FileCheck` to the lucide-react imports and `iconMap` in:
- `src/components/DynamicSidebar.tsx`
- `src/components/mobile/MobileSideMenu.tsx`

### 2. Create Eligibility Checks page
**New file**: `src/pages/app/insurance/EligibilityChecksPage.tsx`
- Table listing all eligibility checks from `nphies_eligibility_logs` for the organization
- Columns: Patient, Insurance Company, Policy Number, Status (eligible/ineligible), Checked At
- Filter by date range and status
- "New Check" button linking to patient search

### 3. Create Pre-Authorizations page
**New file**: `src/pages/app/insurance/PreAuthorizationsPage.tsx`
- Table listing all claims that have pre-auth data (`pre_auth_number IS NOT NULL` or `pre_auth_status IS NOT NULL`)
- Columns: Claim #, Patient, Insurance, Pre-Auth Number, Pre-Auth Status, Amount
- Filter by status (approved/denied/pending)

### 4. Add routes in App.tsx
- `/app/insurance/nphies/eligibility` → EligibilityChecksPage
- `/app/insurance/nphies/pre-authorizations` → PreAuthorizationsPage

### 5. Add menu items via SQL (data insert)
Add two new children under `insurance.nphies`:
- `insurance.nphies.eligibility` → "Eligibility Checks" → `/app/insurance/nphies/eligibility` (icon: `ShieldCheck`)
- `insurance.nphies.pre-auth` → "Pre-Authorizations" → `/app/insurance/nphies/pre-authorizations` (icon: `FileCheck`)

### 6. Add translations (EN, AR, UR)
New keys for eligibility checks page and pre-authorizations page labels.

## Files Summary

| File | Action |
|------|--------|
| `src/components/DynamicSidebar.tsx` | Add `CloudUpload`, `FileCheck` to imports + iconMap |
| `src/components/mobile/MobileSideMenu.tsx` | Add `CloudUpload`, `FileCheck` to imports + iconMap |
| `src/pages/app/insurance/EligibilityChecksPage.tsx` | **New** — Eligibility checks list page |
| `src/pages/app/insurance/PreAuthorizationsPage.tsx` | **New** — Pre-authorizations list page |
| `src/App.tsx` | Add 2 new routes |
| `src/lib/i18n/translations/en.ts` | Add page translations |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |
| SQL data insert | Add 2 new menu_items under `insurance.nphies` |

