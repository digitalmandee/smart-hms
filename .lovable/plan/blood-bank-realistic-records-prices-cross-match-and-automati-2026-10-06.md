# Blood Bank: realistic records, prices, cross-match and automatic billing

## 1. Replace practice data with realistic records (Aleem Dar Foundation)
- Remove the earlier practice donors, bags, requests and transfusions, and the TEST camp records.
- Add realistic records with Pakistani names: about 40 donors across all 8 blood groups (more O+ and B+, fewer negatives, the way it really is), about 70 component bags, 10 requests and 8 transfusions.
- Stock, requests and transfusion numbers on the dashboard will add up to each other.
- These are still made-up records. You can swap in your real sheets whenever you upload them.

## 2. Product prices (Rs per bag, typical Pakistan rates)
- Whole blood: 3,500
- Red cells: 3,000
- Plasma (FFP): 2,000
- Platelets: 4,500
- Cryo: 2,500
- These are added to the service list, so you can change them later from Services.

## 3. Cross-match screen shows real blood groups
- Fix how blood groups are read so a request's patient blood group shows up, along with matching compatible bags (oldest first) and donors.
- An O- patient only sees O- bags, an AB+ patient sees every group, and so on.

## 4. Issue makes the bill automatically and posts it to the ledger
- When a bag is issued, the patient's bill gets a line with that product's price.
- The bill is recorded in the accounts as Blood Bank revenue. The same bag can never be charged twice.
- Welfare patients can still have the bill covered at Front Desk.
- I'll check this once from start to finish: issue a bag, then confirm the bill amount and the ledger entry.

## Technical details
- Data changes go through run_sql. Delete in this order: transfusions, cross-matches, requests, inventory, donations, donors, camp records.
- Prices: add `service_types` rows (category blood bank) for each `component_type`, plus a mapping that `issue_blood_units` uses to price `invoice_items` with the `BB-` prefix. Keep the IF EXISTS guard.
- Cross-match: use the right blood-group enum/text comparisons in the compatibility filter and patient blood-group lookup, and sort by `expiry_date`.
- Recalculate invoice totals so GL triggers post the revenue. Existing Rs 0 test invoice is removed with the test data.
- All new labels in EN/UR/AR.
