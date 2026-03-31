

# Pharmacy POS Daily Opening/Closing with Downloadable Reports

## Current State
- The `pharmacy_pos_sessions` table exists in the database with fields for `opening_balance`, `closing_balance`, `expected_cash`, `cash_difference`, `total_sales`, `total_transactions`, `status` (open/closed), `opened_by`, `closed_by`, etc.
- **None of this is used.** The POS terminal creates transactions without sessions. The "POS Sessions" page just shows transactions.
- There is no open/close cash register workflow for pharmacy POS users.

## What We'll Build

### 1. POS Session Hooks (`src/hooks/usePOSSessions.ts`) — New File
- `useCurrentPOSSession()` — fetch the current open session for the logged-in user/branch
- `useOpenSession()` — mutation to open a new session with opening cash balance
- `useCloseSession()` — mutation to close session with closing balance, auto-calculate expected cash, difference
- `usePOSSessionHistory()` — list past sessions with date filters
- `usePOSSessionDetail(id)` — single session with linked transactions

### 2. Session Opening Dialog (`src/components/pharmacy/POSSessionOpenDialog.tsx`) — New File
- Modal that appears when user navigates to POS terminal and no session is open
- Input: Opening cash balance (counted physical cash)
- Shows date/time and cashier name
- On submit: creates a `pharmacy_pos_sessions` record with status "open"

### 3. Session Closing Dialog (`src/components/pharmacy/POSSessionCloseDialog.tsx`) — New File
- Shows session summary: total transactions, total sales (by payment method: cash, card, mobile)
- Input: Closing cash balance (physical count)
- Auto-calculates: Expected Cash = Opening Balance + Cash Sales − Cash Refunds
- Shows: Cash Difference (over/short)
- Optional: Notes field
- On submit: updates session with closing data, sets status "closed"

### 4. Update POS Terminal (`src/pages/app/pharmacy/POSTerminalPage.tsx`)
- On load, check for open session via `useCurrentPOSSession()`
- If no open session → show `POSSessionOpenDialog`
- Pass `session_id` to `useCreateTransaction()` so transactions link to the session
- Add "Close Register" button in the POS header
- Show session info badge (session number, opening balance, running total)

### 5. Rebuild POS Sessions Page (`src/pages/app/pharmacy/POSSessionsPage.tsx`)
- Show actual session records from `pharmacy_pos_sessions` (not transactions)
- Table columns: Session #, Cashier, Opened At, Closed At, Opening Balance, Total Sales, Expected Cash, Closing Balance, Difference, Status
- Color-code difference (green if zero, red if short, blue if over)
- Click to view session detail with linked transactions

### 6. Session Detail Page (`src/pages/app/pharmacy/POSSessionDetailPage.tsx`) — New File
- Session summary cards: Opening Balance, Total Sales, Cash/Card/Mobile breakdown, Expected Cash, Closing Balance, Difference
- List of all transactions in this session
- **PDF Download button** using `ReportExportButton` — generates a daily closing report with:
  - Session info (number, cashier, date, duration)
  - Payment method breakdown
  - Transaction list
  - Cash reconciliation summary

### 7. Update Transaction Creation
- In `usePOS.ts` `useCreateTransaction()`, accept optional `session_id` parameter
- Pass it through to the insert instead of hardcoding `null`

### 8. Route & Navigation
- Add route: `/app/pharmacy/pos/sessions/:id` → `POSSessionDetailPage`
- Update sidebar nav if needed

### 9. Translations (`en.ts`, `ar.ts`, `ur.ts`)
New keys for: Open Register, Close Register, Opening Balance, Closing Balance, Expected Cash, Cash Difference, Over, Short, Session Summary, Download Daily Report, Cash Sales, Card Sales, No Open Session, Count Your Cash

## Files Changed
- `src/hooks/usePOSSessions.ts` — new hooks for session CRUD
- `src/components/pharmacy/POSSessionOpenDialog.tsx` — new open register dialog
- `src/components/pharmacy/POSSessionCloseDialog.tsx` — new close register dialog
- `src/pages/app/pharmacy/POSTerminalPage.tsx` — integrate session check + close button
- `src/pages/app/pharmacy/POSSessionsPage.tsx` — rebuild to show actual sessions
- `src/pages/app/pharmacy/POSSessionDetailPage.tsx` — new detail page with PDF export
- `src/hooks/usePOS.ts` — accept session_id in transaction creation
- `src/App.tsx` — add session detail route
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

