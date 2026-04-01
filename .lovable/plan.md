

# Fix: Deposits Missing from Mobile Invoice List

## Root Cause
The user is on a mobile viewport (440px). The `InvoicesListPage` detects this and renders `MobileInvoiceList` (line 237-239), which **only queries the `invoices` table** — it never fetches `patient_deposits`. The desktop DataTable version already merges deposits correctly, but the mobile component was not updated.

## Changes

### File 1: `src/components/mobile/MobileInvoiceList.tsx`
- Add a `useDepositRows` query (same pattern as desktop `InvoicesListPage` lines 101-138) to fetch `patient_deposits` with `type = 'deposit'` and `status = 'completed'`
- Merge deposit rows into the filtered invoices list
- Add a "Deposit" badge (using `Landmark` icon) on deposit entries, matching desktop behavior
- Make deposit cards non-clickable (no detail page) or show deposit info inline
- Add trilingual labels using `useTranslation`

### File 2: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`
- Ensure `invoices.depositInvoice` key exists (already added in previous iteration — verify and keep)

## Result
Alii Raza's Rs. 100,000 deposit will appear in the mobile invoice list with a "Deposit" badge, matching the desktop experience.

