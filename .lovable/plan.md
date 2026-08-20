# Thalassemia Center as a Facility Type

Add `thalassemia_center` as a new facility type so a thalassemia hospital/day-care center only sees the modules it actually uses, instead of the full hospital menu.

## What a thalassemia center actually does

Its whole operating model is repeat transfusion day-care for chronic patients:

- Register patients (mostly children — guardian details mandatory) with a lifelong thalassemia profile
- Recurring transfusion appointments every 2-4 weeks
- Blood bank: donor recruitment, screening panel, cross-match, issue, wastage tracking
- Lab: CBC, ferritin, HPLC/electrophoresis, HbA1c, viral markers (HBV/HCV/HIV), liver/renal panels
- Pharmacy: iron chelators (deferasirox, deferiprone, desferrioxamine), folic acid, hydroxyurea
- Day-care transfusion visit: vitals, pre/post-transfusion Hb, reaction monitoring, discharge same day
- Mostly charity / donation / zakat funded, plus insurance claims — so billing is light, donations are heavy

## Recommended module set

### Offer (enabled by default)

| Module | Why |
|---|---|
| Patients | Core — chronic patient registry, guardian details |
| Appointments | Recurring transfusion scheduling |
| OPD / Consultations | Hematology consults, day-care visit record |
| Blood Bank | The center's core operation |
| Laboratory | Monitoring panels, pre-transfusion testing |
| Pharmacy + Pharmacy POS | Chelation therapy dispensing |
| Billing | Invoices, insurance-covered and zakat/free cases |
| Donation Management | Primary funding channel |
| Accounts | Ledger, donor funds, expenses |
| Inventory | Consumables, blood bags, reagents |
| HR / Employees | Staff, nurses, payroll |
| Insurance | Claims for covered patients |
| Reports, Settings | Core |
| KSA Compliance | NPHIES / ZATCA / Nafath where applicable |

### Do not offer (hidden)

| Module | Why not |
|---|---|
| Operation Theatre / Surgery | No surgical service; splenectomy cases are referred out |
| Emergency / ER | No ER intake; acute cases go to a general hospital |
| Radiology | Rarely on-site; MRI T2* iron load is referred out |
| Dialysis Center | Unrelated service line |
| Warehouse Operations | Full WMS is overkill for a single-site center |
| Dental | Not part of the service line |

### Judgment call: IPD

Keep IPD **available but off by default**. Most centers run transfusion as a day-care chair, not an admission. Centers that do keep overnight beds for severe cases can switch it on from Settings > Modules.

## Implementation

1. Add `thalassemia_center` to the facility-type enum in `CreateOrganizationPage.tsx` and `OrganizationDetailPage.tsx` (label: Thalassemia Center / تخصصي الثلاسيميا / تھیلیسیمیا سینٹر), plus the label line in `OrganizationSettingsPage.tsx`.
2. Add a blocked-prefix set in `src/lib/facility-type-filter.ts` for `thalassemia_center`: `/app/ot`, `/app/emergency`, `/app/radiology`, `/app/dialysis`, `/app/dental`, warehouse-only inventory paths, and the OT/Emergency roster HR sub-paths.
3. Add a default-module preset so a newly created thalassemia org gets the "Offer" list enabled via the existing bulk module update path, using `available_modules` codes.
4. Surface the recommendation note in `OrganizationModulesTab.tsx` (same pattern as the existing clinic hint) so a super-admin sees which modules are not recommended.
5. Keep all new labels trilingual (EN / UR / AR) with RTL-safe layout, per project convention.

No schema changes are required — `available_modules` / `organization_modules` already cover every module in the list above.

## Not in this change

Thalassemia-specific clinical screens (transfusion log with pre/post Hb, chelation compliance tracking, iron-overload trend charts) are a separate build. This change is scoped to facility type and module visibility.
