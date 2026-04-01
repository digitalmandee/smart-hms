

# Fix: Chart of Accounts & Journal Entry Posting Issues

## Issues Found

### 1. AccountPicker Shows Non-Posting (Header) Accounts
The `AccountPicker` component (used in the journal entry form) fetches **all** active accounts via `useAccounts({ isActive: true })` — including Level 1-3 header accounts. The database trigger `check_posting_account` blocks posting to these, causing a cryptic error when the user selects one.

The form page (`JournalEntryFormPage.tsx` line 72) filters `postingAccounts = allAccounts.filter(a => !a.is_header)` but **never passes this to the AccountPicker**. The AccountPicker fetches its own unfiltered data independently.

### 2. Limited Reference Type Options
The journal form dropdown (line 221-226) only offers 4 reference types: `manual`, `invoice`, `shipment`, `stock_adjustment`. But the DB constraint `journal_entries_reference_type_check` allows many more: `patient_deposit`, `credit_note`, `grn`, `donation`, `vendor_payment`, `expense`, `payroll`, `pos_sale`, etc. For manual entries, users should have access to all valid types.

## Fix Plan

### File: `src/components/accounts/AccountPicker.tsx`
- Add an optional `postingOnly` boolean prop (default `false`)
- When `postingOnly` is true, filter out accounts where `is_header === true` so only Level 4 posting accounts appear
- This keeps the component reusable elsewhere without breaking other uses

### File: `src/pages/app/accounts/JournalEntryFormPage.tsx`
- Pass `postingOnly` prop to each `<AccountPicker>` in the line items — removes the need for the separate `postingAccounts` filter
- Expand the reference type `<Select>` to include all valid DB constraint values: `manual`, `invoice`, `payment`, `expense`, `payroll`, `pos_sale`, `shipment`, `stock_adjustment`, `grn`, `vendor_payment`, `patient_deposit`, `credit_note`, `donation`
- Add trilingual labels for each reference type in the `labels` object

## Files Changed
- `src/components/accounts/AccountPicker.tsx` — add `postingOnly` prop filter
- `src/pages/app/accounts/JournalEntryFormPage.tsx` — use `postingOnly` on pickers, expand reference types with 3-language labels

