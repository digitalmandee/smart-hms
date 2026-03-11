

## Cash to Bank Deposit — Show Cash Balance + Monthly Cash Tracking Report

### Two Enhancements

**1. Show Current Cash Balance in the Deposit Dialog**

When opening the "Deposit Cash" dialog, display the current **Cash in Hand** balance at the top (fetched from the `accounts` table where `account_number = 'CASH-001'`). This gives the user immediate visibility into how much cash is available before entering a deposit amount. Also add validation so the deposit amount cannot exceed the available cash balance.

**Changes:**
- **`src/components/accounts/CashToBankDepositDialog.tsx`** — Add a query to fetch the CASH-001 account balance for the organization, display it as a highlighted info card above the amount field, and validate against it.

---

**2. New "Cash to Bank Deposits" Report Page**

A dedicated report page showing all cash-to-bank deposits with monthly grouping for easy tracking.

**Features:**
- Monthly summary cards showing total deposited per month
- Filterable by date range and bank account
- Table of all `bank_transactions` where `transaction_type = 'cash_deposit'`, showing date, bank name, amount, reference, and running totals
- Export to CSV
- Live cash balance display at the top (current CASH-001 balance)

**Changes:**
- **Create `src/pages/app/accounts/CashToBankReportPage.tsx`** — New report page with date range filter, monthly breakdown cards, and a transaction table using the existing `ReportTable` component
- **`src/App.tsx`** — Add route `/app/accounts/cash-to-bank-report`
- **Add navigation link** from the Bank Accounts list page and/or the Financial Reports page so users can access this report

