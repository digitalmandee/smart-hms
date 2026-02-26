

# Complete Remaining Donation Management Module

## What's Done
- Database: 4 tables, triggers, RLS, journal integration -- all deployed
- Module + menu items registered in DB
- Hooks: `useDonations.ts` -- complete
- All 7 pages created and working (build errors fixed)
- Translations: ~80 keys in en/ar/ur -- done
- `DonationReceiptPrint.tsx` component -- done

## What's Missing

### 1. Routes in `App.tsx`
No donation routes exist. Need to add 7 routes and their lazy imports:

```
donations                → DonationDashboard
donations/donors         → DonorsListPage
donations/donors/new     → DonorFormPage
donations/donors/:id     → DonorDetailPage
donations/record         → RecordDonationPage
donations/receipt/:id    → DonationReceiptPage
donations/recurring      → RecurringSchedulesPage
```

### 2. Sidebar Name Mappings in `DynamicSidebar.tsx`
The menu items in the DB have names "Dashboard", "Donors", "Record Donation", "Recurring Schedules" under the "Donation Management" parent. Need to add mappings so the sidebar renders translated labels:

- "Donation Management" → `nav.donationManagement` (parent)
- "Record Donation" → `nav.recordDonation`
- "Recurring Schedules" → `nav.recurringSchedules`

Note: "Dashboard" and "Donors" may already have generic mappings.

### 3. Heart Icon in OrgModulesPage + ModuleCatalogPage
The module was registered with icon `Heart`, but neither `OrgModulesPage.tsx` nor `ModuleCatalogPage.tsx` have `Heart` in their icon maps. Need to add `Heart` import and mapping in both files.

### 4. Navigation Translation Keys
Need to add `nav.donationManagement`, `nav.recordDonation`, `nav.recurringSchedules` to en/ar/ur translation files.

## Files to Edit

| File | Changes |
|------|---------|
| `src/App.tsx` | Add 7 imports + 7 routes for `/app/donations/*` |
| `src/components/DynamicSidebar.tsx` | Add 3 sidebar name-to-key mappings |
| `src/pages/app/settings/OrgModulesPage.tsx` | Import `Heart`, add to `iconMap` |
| `src/pages/super-admin/ModuleCatalogPage.tsx` | Import `Heart`, add to `iconMap` |
| `src/lib/i18n/translations/en.ts` | Add 3 nav keys |
| `src/lib/i18n/translations/ar.ts` | Add 3 nav keys |
| `src/lib/i18n/translations/ur.ts` | Add 3 nav keys |

