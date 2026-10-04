# NGO Hospital: Donation Funds, Patient Welfare and a Focused Module Set

All screens work in English, Urdu and Arabic (right-to-left where needed).

## 1. Donation categories (funds)
- Fixed categories: Zakat, Sadaqah, Fitrana, Atiyat/General, Sponsorship, plus "Restricted (project)" and any custom ones the admin adds.
- Every donation has to have a category. Donors, campaigns and receipts all show it.
- New screen **Fund Balances**: one card per category showing what was received, what was spent on patients, and what is left. Click a card to see each transaction.
- Receipts print the category and include the Zakat wording when the donation is Zakat.

## 2. Patient welfare (charity care)
- When registering or onboarding a patient, reception can tick "Needs welfare" and choose which fund pays: Zakat, Sadaqah, a sponsor, or **Any eligible fund**. They also set coverage (100% or a percentage).
- At billing for OPD, IPD, procedures, lab, pharmacy or blood bank, the bill splits in two: the share the fund pays and the share the patient pays.
- The fund share comes out of that fund's balance. Billing is stopped if the fund doesn't have enough money, and the cashier sees a clear message.
- **Welfare report**: patients helped per fund and per department (OPD, IPD and so on), and total spent.

## 3. Accounting
- Each fund gets its own account. A donation adds money to that fund (cash in, fund up).
- Welfare spending takes money out of the fund and covers the patient's bill.
- These entries are recorded automatically. The dashboard and reports show each fund's totals.

## 4. Cleaning up the modules
The only modules kept on are: Patients, Reception, OPD, IPD, Lab, Pharmacy, Blood Bank, Billing, Donations, Accounts, Procurement/Warehouse/Inventory, HR and Reports/Settings.
- Hidden: Surgery/OT, Radiology, Emergency, Dialysis, Dental, Gynecology, Clinic on Wheels, Kiosk, Insurance/NPHIES and the Saudi-only features. Nothing is deleted, so any of these can be switched back on.
- Remove the Dialysis, OT and Radiology shortcuts from the reception page.
- Remove the matching quick-login buttons.

## 5. One-screen reception and billing
- **Front Desk**, a single screen: search or add a patient (with the welfare option) → choose OPD visit, IPD admission or lab → take payment with the split between fund and patient → print the token or receipt. No jumping between pages.
- **Cashier**, a single screen: the patient's pending charges load automatically, with the fund share, patient share, deposit and what is still owed.

## 6. Checking for errors
- I'll walk through the full flow: add a donor and a Zakat donation, register a welfare patient, bill an OPD visit, admit and discharge an IPD patient, then check the fund balance and accounting.
- I'll fix any errors found along the way.
- Limitation: I can't sign in to your app from here, so you'll need to do the final signed-in check yourself.

## Technical details
- Adds a `donation_funds` table holding each fund's code, names in all three languages, linked account and restricted flag, with GRANTs and organization-level access rules.
- Adds `fund_id` to `financial_donations` (required, back-filled from `purpose`), plus `welfare_fund_id` and `welfare_coverage_pct` on patients.
- Adds `fund_utilizations` (invoice, fund, amount), filled by a trigger on invoice payment. Each new table gets GRANTs and RLS.
- GL posting goes through idempotent DB triggers (`post_donation_to_journal` extended per fund; a new `post_fund_utilization_to_journal`). App code writes no manual journals.
- Module cleanup goes through `GLOBALLY_HIDDEN_PREFIXES`, the organization module preset and the reception quick actions.
- New pages: `FundBalancesPage`, `FrontDeskPage`, an upgrade to the cashier workspace, and `WelfareReportPage`.
