

## Cash to Bank Deposit Feature

**What it does**: Allows users to record when physical cash collected at counters is deposited into a bank account. This creates the proper accounting entries (debit Bank, credit Cash) and records a bank transaction for tracking.

### How it works

1. **"Deposit to Bank" button** on the Bank Account Detail page
2. Opens a dialog/form where the user:
   - Enters the deposit amount
   - Optionally enters cash denomination breakdown (reusing the existing `CashDenominationInput` component)
   - Selects a reference/slip number
   - Adds optional notes
3. On submit:
   - Inserts a `bank_transactions` record (credit to selected bank account)
   - Creates a journal entry: **DR Bank Account (GL) / CR Cash Account (GL)**
   - Updates the `bank_accounts.current_balance` accordingly
   - Shows success confirmation

### Technical Plan

**New file**: `src/components/accounts/CashToBankDepositDialog.tsx`
- Dialog with amount input, optional denomination counter, reference number, date, and notes
- Reuses `CashDenominationInput` for physical cash counting
- Submits to `bank_transactions` + creates a journal entry via existing journal posting patterns

**Modified file**: `src/pages/app/accounts/BankAccountDetailPage.tsx`
- Add a "Deposit Cash" button in the page header actions
- Import and render the new dialog

**New hook or inline mutation** in the dialog:
- Insert into `bank_transactions` (credit_amount = deposit amount, transaction_type = 'cash_deposit')
- Insert journal entry + journal lines (DR bank GL account via `bank_accounts.account_id`, CR cash GL account)
- Update `bank_accounts.current_balance` += deposit amount

### Accounting Entry
```text
DR  1110 - Bank Account (GL)     ₨ X,XXX
CR  1111 - Cash / Petty Cash     ₨ X,XXX
Narration: Cash deposit to [Bank Name] - Ref: [slip number]
```

