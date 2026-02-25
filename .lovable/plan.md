

# Blood Bank Module -- Complete Audit & Enhancement Plan

## Current State Assessment

### Routes & Pages (18 routes, 17 pages)

| Route | Page | Status |
|-------|------|--------|
| `/app/blood-bank` | Dashboard | Works |
| `/blood-bank/donors` | DonorsListPage | Works |
| `/blood-bank/donors/new` | DonorFormPage | Works |
| `/blood-bank/donors/:id` | DonorFormPage (edit mode) | **Issue: No read-only detail/profile page** |
| `/blood-bank/donations` | DonationsPage | Works |
| `/blood-bank/donations/new` | DonationFormPage | Works |
| `/blood-bank/donations/:id` | DonationDetailPage | Works |
| `/blood-bank/inventory` | InventoryPage | Works |
| `/blood-bank/inventory/add` | **MISSING** | **Dead link -- 404** |
| `/blood-bank/inventory/:id` | **MISSING** | **Dead link -- clicking row hits 404** |
| `/blood-bank/requests` | RequestsListPage | Works |
| `/blood-bank/requests/new` | BloodRequestFormPage | Works |
| `/blood-bank/requests/:id` | BloodRequestDetailPage | Works |
| `/blood-bank/requests/:id/process` | **MISSING** | **Dead link from RequestCard "Process" button** |
| `/blood-bank/cross-match` | CrossMatchPage | Works |
| `/blood-bank/cross-match/new` | CrossMatchFormPage | Works |
| `/blood-bank/cross-match/:id` | **MISSING** | **Dead link -- clicking row hits 404** |
| `/blood-bank/transfusions` | TransfusionsPage | Works |
| `/blood-bank/transfusions/new` | TransfusionFormPage | Works |
| `/blood-bank/transfusions/:id` | TransfusionDetailPage | Works |
| `/blood-bank/labels` | BloodBagLabelsPage | Works |
| `/blood-bank/donor-cards` | DonorCardPrintPage | Works |

### Broken Links Summary (5 dead routes)

1. **`/blood-bank/inventory/add`** -- "Add Blood Unit" button on InventoryPage navigates here, no route exists
2. **`/blood-bank/inventory/:id`** -- Clicking any inventory row navigates here, no route/page exists
3. **`/blood-bank/requests/:id/process`** -- RequestCard "Process" button navigates here, no route exists
4. **`/blood-bank/cross-match/:id`** -- Clicking any cross-match test row navigates here, no route/page exists
5. **`/blood-bank/donors/:id`** -- Goes to edit form instead of a read-only donor profile/detail page (functional but UX issue)

---

## Implementation Plan

### Task 1: Create Donor Detail/Profile Page

**New file:** `src/pages/app/accounts/../blood-bank/DonorDetailPage.tsx`

Currently `donors/:id` loads the edit form. A proper donor profile page should show:
- Donor info (name, blood group, contact, medical history) in read-only cards
- Donation history timeline (all past donations with status)
- Linked patient record (if any)
- Status badge, eligibility indicator (days since last donation)
- Action buttons: Edit, Start Donation, Print Donor Card
- Trilingual support (EN/UR/AR)

**Route change in App.tsx:**
- Add `blood-bank/donors/:id/edit` for the edit form (DonorFormPage)
- Change `blood-bank/donors/:id` to use the new DonorDetailPage

### Task 2: Create Blood Unit Detail Page

**New file:** `src/pages/app/blood-bank/BloodUnitDetailPage.tsx`

Shows full unit information when clicking an inventory row:
- Unit number, blood group, component type, volume
- Collection date, expiry date with countdown
- Status with workflow actions (quarantine -> available -> reserved -> issued -> transfused)
- Linked donation record
- Storage location, testing results
- Action buttons: Reserve, Issue, Discard, Print Label

**Route:** `blood-bank/inventory/:id`

### Task 3: Create Add Blood Unit Form Page

**New file:** `src/pages/app/blood-bank/BloodUnitFormPage.tsx`

Form to manually add a blood unit to inventory (for units received from external sources or not linked to an in-house donation):
- Blood group, component type, volume
- Collection date, expiry date
- Source (donation link or external source)
- Storage location
- Bag/unit number

**Route:** `blood-bank/inventory/add`

### Task 4: Create Cross-Match Detail Page

**New file:** `src/pages/app/blood-bank/CrossMatchDetailPage.tsx`

Shows full cross-match test details when clicking a row:
- Test number, date/time performed
- Patient blood group vs donor blood group
- Major cross-match result, minor cross-match result, overall result
- Linked blood request, linked blood unit
- Technician/performed by
- Notes

**Route:** `blood-bank/cross-match/:id`

### Task 5: Fix Request Process Button

The "Process" button in `RequestCard.tsx` navigates to `/app/blood-bank/requests/:id/process` which doesn't exist. Fix:
- Change the `onProcess` handler in `RequestsListPage.tsx` to navigate to `/app/blood-bank/requests/${request.id}` (the detail page already has "Start Processing" workflow buttons)

This is a one-line fix in `RequestsListPage.tsx` line 118.

### Task 6: Register All New Routes in App.tsx

Add imports and routes for:
- `blood-bank/donors/:id` -> DonorDetailPage
- `blood-bank/donors/:id/edit` -> DonorFormPage
- `blood-bank/inventory/add` -> BloodUnitFormPage
- `blood-bank/inventory/:id` -> BloodUnitDetailPage
- `blood-bank/cross-match/:id` -> CrossMatchDetailPage

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/app/blood-bank/DonorDetailPage.tsx` | **NEW** -- Read-only donor profile with donation history |
| `src/pages/app/blood-bank/BloodUnitDetailPage.tsx` | **NEW** -- Blood unit detail with status workflow |
| `src/pages/app/blood-bank/BloodUnitFormPage.tsx` | **NEW** -- Add blood unit form |
| `src/pages/app/blood-bank/CrossMatchDetailPage.tsx` | **NEW** -- Cross-match test detail view |
| `src/pages/app/blood-bank/RequestsListPage.tsx` | **EDIT** -- Fix Process button to navigate to detail page |
| `src/App.tsx` | **EDIT** -- Register 5 new routes, update donors/:id |

## Trilingual Support

All new pages will use `useTranslation()` and support English, Urdu, and Arabic with RTL-aware layouts, consistent with existing blood bank pages.

## Existing Strengths (No Changes Needed)

- Dashboard: Well-designed with 6 stat cards, blood stock widget, donation queue, pending requests, active transfusions
- DonorCard/PrintableDonorCard: Credit-card-sized with QR code, RTL support, front/back design
- BloodBagLabel: Barcode-enabled labels with print/PDF export
- ListFilterBar: Consistent search + filter pattern across all list pages
- DonationDetailPage: Good workflow timeline with status progression
- BloodRequestDetailPage: Proper cross-match integration and status workflow
- TransfusionsPage: Active transfusion alert banner
- All forms have proper donor/patient search with auto-selection

