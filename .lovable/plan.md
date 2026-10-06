# Blood Camp payments, full camp test, and dashboard totals

## 1. Choose how each camp expense is paid
- The "Add expense" form on a camp's Report tab gets a **Paid by** choice: Cash or Bank transfer. When Bank transfer is chosen, you also pick which bank account paid.
- The ledger then takes the money from that account instead of always from Cash in Hand. The expenses table shows how each expense was paid.
- If you change how an expense was paid, the old entry is cancelled and a new one is posted, the same way an amount change works today.
- Old expenses stay as Cash.

## 2. Run a full camp, start to finish
I'll sign in with the Blood Bank button and go through every step on screen:
1. Create a camp, start it, and register 3 donors (one is deferred, to check that path).
2. Print the stickers, close the camp, record transport, and scan the bags in at Receiving.
3. Enter passing screening results, split one bag into red cells and plasma, and check the part labels show the camp.
4. Create a blood request for a patient, cross-match a bag, issue it, and confirm the transfusion record and the blood bank bill are created.
5. Check that the camp Report shows the right numbers, and that a cash expense and a bank expense post correctly.

Anything that breaks along the way gets fixed. All test records are labelled "TEST" and can be removed afterwards.

## 3. Blood bag totals on the dashboard
A new "Blood bag flow" panel on the Blood Bank dashboard, with a switch for Today, This month or All time. For each stage it shows the number of bags and the total volume in ml:
- **Collected:** donations collected, in the hospital and at camps
- **Tested:** bags that passed tests, and bags that failed
- **In stock:** ready to use, waiting for tests, and held for a patient, broken down by blood group
- **Issued:** bags issued or transfused, plus discarded and expired

Camp bags are also shown as their own number. Everything is in English, Urdu and Arabic.

## Technical details
- Migration: add `payment_method` (`cash`/`bank`, default `cash`) and `bank_account_id` (nullable, foreign key to `bank_accounts`) to `blood_camp_expenses`. Update `post_blood_camp_expense_to_journal` to credit the bank's linked ledger account when the payment is by bank (CASH-001 otherwise), and to reverse and repost when the payment method or bank account changes. Idempotency guard stays.
- `CampMoney.tsx`: add the payment select, a bank account select (from `bank_accounts`), and a column in the expenses table. New keys in `camp-i18n.ts`.
- Dashboard: new `useBloodFlowTotals(period)` hook in `useBloodBank.ts` that groups `blood_donations` and `blood_inventory` by status, counting rows and summing `volume_ml`. New `BloodFlowPanel` component on `BloodBankDashboard.tsx`.
- The end-to-end run uses Playwright with the demo Blood Bank login, against live records.
