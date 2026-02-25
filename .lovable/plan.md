

# Fix Trial Balance Debit/Credit Column Assignment

## Bug Found

The Trial Balance page renders correctly with only Level 4 posting accounts, and the P&L report works properly. However, the Trial Balance has a **debit/credit column assignment bug** that causes all balances to appear in the Debit column regardless of account type.

**Current code** (lines 126-127 of `src/hooks/useFinancialReports.ts`):
```typescript
debit: balance >= 0 ? balance : 0,
credit: balance < 0 ? Math.abs(balance) : 0,
```

This assigns any positive balance to Debit. But for credit-normal accounts (Revenue, Liabilities, Equity), a positive balance means "more credits than debits" and should appear in the **Credit** column.

**Result**: Revenue accounts like "Service Revenue - OPD" (Rs 2,106,021) appear in the Debit column. The report shows Rs 4,214,695 total debits and Rs 0 credits, flagged as "NOT Balanced" even though the underlying journal entries are perfectly balanced.

## Fix

**File**: `src/hooks/useFinancialReports.ts`, lines 120-128

Replace the column assignment logic to consider the account's normal balance side:

```typescript
return {
  account_id: account.id,
  account_number: account.account_number,
  account_name: account.name,
  account_type: account.account_type?.name || "Unknown",
  category: account.account_type?.category || "Unknown",
  debit: isDebitNormal ? (balance >= 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
  credit: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance >= 0 ? balance : 0),
};
```

Logic:
- **Debit-normal accounts** (Assets, Expenses): positive balance → Debit column; negative (unusual) → Credit column
- **Credit-normal accounts** (Revenue, Liabilities, Equity): positive balance → Credit column; negative (unusual) → Debit column

This is a single-line change in the return object. No other files need modification.

## Expected Result After Fix

The Trial Balance should show:
- Assets (AR-001, CASH-001) in the Debit column
- Revenue (REV-001, REV-PHARM-001) in the Credit column  
- Total Debits ≈ Total Credits → "Trial Balance is Balanced" with green checkmark

