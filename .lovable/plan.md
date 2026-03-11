

## Finance Module — Pre-Demo Fix Plan + Documentation Guide

### Part 1: Fix Hardcoded Currency (15 files)

Replace all local `formatCurrency` functions and `Rs.` string literals with the dynamic `useCurrencyFormatter()` hook.

**Accounts pages (7 files):**
- `ProfitLossPage.tsx` — remove local `formatCurrency`, import hook
- `TrialBalancePage.tsx` — same
- `FinancialReportsPage.tsx` — same
- `JournalEntryDetailPage.tsx` — replace `Rs. ${...}` with `formatCurrency()`
- `VendorPaymentFormPage.tsx` — replace `Amount (Rs.)` label
- `AccountsDashboard.tsx` — if any `Rs.` in tooltips/labels
- `PayrollCostAllocationPage.tsx` — check and fix

**Billing pages (6 files):**
- `BillingDashboard.tsx` — replace `Rs. ${...}`
- `InvoicesListPage.tsx` — replace `Rs. ${...}` in column cells
- `PaymentCollectionPage.tsx` — replace all `Rs.` references
- `PaymentHistoryPage.tsx` — replace `Rs.` references
- `ClaimsListPage.tsx` — remove local `formatCurrency` with `en-PK`/`PKR`
- `ClaimDetailPage.tsx` — check for currency formatting

### Part 2: UX Fixes for Demo

**A. Patient Deposits — Patient Search Dropdown**
- Replace raw UUID text input with a searchable patient combobox
- Use existing patients query to populate dropdown (name + MRN)
- File: `PatientDepositsPage.tsx`

**B. Credit Notes — Invoice Selector**
- Add invoice search/select dropdown to the "New Note" dialog
- Query paid/partially_paid invoices for the org
- Auto-fill patient from selected invoice
- File: `CreditNotesPage.tsx`

**C. Close Open Billing Session**
- Seed SQL to close the remaining open session so Daily Closing wizard works during demo

### Part 3: Finance Q&A + Module Flow Documentation Page

Create a new **Finance Demo Guide** page at `/finance-demo-guide` with:

**File**: `src/pages/FinanceDemoGuide.tsx` (+ route in App.tsx + link in DocumentationHub)

**Content structure** — multi-page printable document (same pattern as existing doc pages using `DocPageWrapper`):

**Page 1: Cover**
- "Finance Module — Complete Demo Guide & FAQ"

**Page 2: Table of Contents**

**Page 3: Chart of Accounts Flow**
- 4-level hierarchy explanation
- Header vs posting accounts
- How accounts are created and structured

**Page 4: Journal Entry Flow**
- Manual entry lifecycle: Draft → Posted → Reversed
- 9 auto-triggers listed with Debit/Credit mappings
- Balance validation rules

**Page 5: Invoice & Payment Flow**
- Service delivery → Invoice generation → Payment collection
- Auto GL posting on payment
- Split payments, partial payments

**Page 6: Credit Note Flow**
- When to issue (refund, return, adjustment)
- ZATCA types 381 (credit) / 383 (debit)
- Draft → Approved lifecycle
- Auto journal posting on approval

**Page 7: Patient Deposits Flow**
- Deposit → Applied → Refund lifecycle
- Liability accounting (Debit Cash, Credit Patient Deposits 2400)
- IPD advance workflow

**Page 8: Daily Closing & Reconciliation Flow**
- 4-step wizard walkthrough
- Session aggregation → Expense recording → Cash denomination → Summary
- Net Cash = Collections - Payouts

**Page 9: Bank Reconciliation Flow**
- CSV import → Auto-match → Manual reconciliation
- Matched vs unmatched items

**Page 10: Fixed Assets & Depreciation**
- Asset register → Depreciation methods (Straight-line / Reducing balance)
- Monthly depreciation journal posting

**Page 11: Expense Management Flow**
- Category types, petty cash, auto GL posting
- Expense → Journal trigger

**Page 12: Vendor Payments & AP Flow**
- PO → GRN → Vendor Payment lifecycle
- Auto GL: Debit AP, Credit Cash

**Page 13: VAT/ZATCA Compliance**
- Output VAT (sales) vs Input VAT (purchases)
- QR code on invoices
- VAT Return report

**Page 14: Budget & Fiscal Period Management**
- Budget creation, variance analysis
- Period locking/unlocking

**Page 15: Demo FAQ (29 questions)**
- Organized by category: Revenue Cycle, GL & Reporting, Compliance, Operations, Technical
- Each Q&A with the page/route where it can be demonstrated

**Page 16: Quick Navigation Reference**
- Table of all finance routes with descriptions

### Components to Create

```text
src/components/finance-demo-docs/
  FinDemoGuideCover.tsx
  FinDemoGuideToc.tsx
  FinDemoGuideCoA.tsx
  FinDemoGuideJournals.tsx
  FinDemoGuideInvoices.tsx
  FinDemoGuideCreditNotes.tsx
  FinDemoGuideDeposits.tsx
  FinDemoGuideDailyClosing.tsx
  FinDemoGuideBankRecon.tsx
  FinDemoGuideFixedAssets.tsx
  FinDemoGuideExpenses.tsx
  FinDemoGuideVendorAP.tsx
  FinDemoGuideVAT.tsx
  FinDemoGuideBudgets.tsx
  FinDemoGuideFAQ.tsx
  FinDemoGuideNavRef.tsx
```

**Page**: `src/pages/FinanceDemoGuide.tsx` — assembles all pages with PDF export

### Files Modified
- ~15 finance/billing pages (currency fix)
- `PatientDepositsPage.tsx` (patient search)
- `CreditNotesPage.tsx` (invoice selector)
- `App.tsx` (new route)
- `DocumentationHub.tsx` (add Finance Demo Guide card)
- 1 SQL seed (close open session)

### Files Created
- 16 doc components in `src/components/finance-demo-docs/`
- `src/pages/FinanceDemoGuide.tsx`

