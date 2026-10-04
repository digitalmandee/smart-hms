# Blood Bank: fix flows to meet blood bank standards

## What the check found

The screens are all there (donors, donations, testing, stock, requests, cross-match, transfusions, reactions). Most of the rules behind them are missing or broken:

- **Donor eligibility is not checked.** Age, weight, Hb, the 56-day gap since the last donation and deferral dates are recorded but never enforced. There is no donor health questionnaire.
- **Every donation becomes one whole-blood bag with a fixed 35-day expiry.** There is no step to split it into red cells, plasma, platelets or cryo, each with its own shelf life.
- **"Issue Blood" doesn't touch stock.** It only changes the request's status. The bag stays "available", the issued count stays 0, and no transfusion record is made. The separate Transfusion screen picks any bag, not the cross-matched one.
- **A matched bag isn't held for its patient.** It can be given to someone else.
- **Expired bags stay "available".** Nothing marks them expired, and the oldest bag is not offered first.
- **Transfusion vitals are never recorded.** Reactions can be reported but don't stop the transfusion.
- **Issued blood is never billed.** Nothing links it to the thalassemia patients either.
- **13 of the 25 blood bank pages are English only.**

## Plan

1. **Donor eligibility check before donation**
   - Short questionnaire: feeling well, recent illness, medicines, travel, tattoos, pregnancy and similar.
   - Automatic checks: age 18–60, weight at least 50 kg, Hb at least 12.5, 56 days since the last whole-blood donation (112 days for double red cells), and no active deferral.
   - A failed check blocks the donation, defers the donor with a reason and a date, and shows why on screen.
2. **Splitting a donation into components**
   - After collection, staff choose which products the bag becomes.
   - The system creates one stock bag per product, each with its standard expiry: red cells 35/42 days, plasma and cryo 1 year frozen, platelets 5 days.
   - All bags start in quarantine until screening passes. Screening results are also saved per test.
3. **One request → cross-match → issue → transfusion flow**
   - A compatible cross-match holds that bag for that patient.
   - "Issue Blood" takes the held bags, oldest first, and marks them issued.
   - It updates the issued count and opens a transfusion record for each bag.
   - When everything requested has been issued, the request completes on its own.
4. **Transfusion vitals and reactions**
   - Record temperature, pulse, BP and breathing before, at 15 minutes and after.
   - Reporting a reaction stops the transfusion, records what happens to the bag, and alerts the doctor.
5. **Stock control**
   - A daily automatic job marks out-of-date bags as expired.
   - Bags are offered oldest first everywhere.
   - Discarding a bag needs a proper reason (expired, failed screening, damaged, reaction). These reasons feed a wastage report.
6. **Billing, with welfare and thalassemia links**
   - Each issued bag adds a charge to the patient's bill, priced per product from the service list.
   - Charges are recorded in the accounts automatically, never typed in by hand.
   - Welfare patients can have the charge covered by a fund through the existing Front Desk fund split.
   - A transfusion for a thalassemia patient appears on their Transfusion visits tab.
7. **Urdu and Arabic on every blood bank page**
   - Translate the 13 English-only pages.
   - Fix right-to-left layout for Urdu and Arabic.

## Technical details

- Move the rules into the database so every screen follows them:
  - an eligibility check function;
  - a component-split function with a per-product shelf-life table;
  - one atomic issue function that updates stock, the request and the transfusion together.
- Triggers keep the bag's status in step with cross-match and transfusion status.
- A pg_cron job runs the daily expiry update.
- New columns:
  - transfusion vitals at 15 minutes;
  - a dedicated discard reason and the user who discarded the bag.
- Billing is posted by a database trigger that adds `invoice_items` lines with the `BB-` prefix, so revenue goes to the Blood Bank revenue account. The trigger includes an `IF EXISTS` guard, so the same bag can't be charged twice.
- Fix the recall view's `organization_id IS NULL` match, which can show donors to other hospitals.
- Existing data is kept; new rules apply to new records only.
