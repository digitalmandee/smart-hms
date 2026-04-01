

# Audit Report: Sannann Malik (SHIFA-MEDICAL-SMC-MAIN-260401-0005) — Complete Financial Trail

## Patient Timeline & Transactions

```text
TIME     EVENT                    AMOUNT    STATUS
──────── ──────────────────────── ───────── ──────
20:49    OPD Invoice INV-149      2,000     Paid (cash)
20:52    IPD Admission Deposit    5,000     Completed (cash)
20:54    Discharge Invoice INV-099 35,000   Paid (deposit 5K + cash 30K)
21:33    OPD Invoice INV-402      5,200     Paid (cash)
21:37    IPD Invoice IPD-079      1,500     Paid (cash)
```

Admission: ADM2601190023, status = "admitted", deposit_amount = 5,000

---

## Journal Entry Verification (All 8 Entries)

### 1. OPD Invoice INV-20260401-149 (Rs. 2,000) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-INV-260401-4303 | AR-001 Accounts Receivable | 2,000 | |
| | REV-001 Service Revenue - OPD | | 2,000 |

### 2. OPD Payment for INV-149 (Rs. 2,000) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-PAY-260401-9293 | CASH-001 Cash in Hand | 2,000 | |
| | AR-001 Accounts Receivable | | 2,000 |

### 3. IPD Admission Deposit (Rs. 5,000) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-DEP-260401-4611 | CASH-001 Cash in Hand | 5,000 | |
| | LIA-DEP-001 Patient Deposits | | 5,000 |

### 4. Discharge Invoice INV-20260401-099 (Rs. 35,000) ⚠️ ISSUE
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-INV-260401-5254 | AR-001 Accounts Receivable | 35,000 | |
| | **REV-001 Service Revenue - OPD** | | **35,000** |

**BUG**: This invoice is a discharge invoice (created during IPD discharge flow) but uses the `INV-` prefix instead of `IPD-`. The trigger routes `INV-` prefixed invoices to `REV-001` (OPD Revenue) instead of `4010` (IPD Revenue). The revenue is hitting the **wrong GL account**.

### 5. Deposit Application (Rs. 5,000 applied to INV-099) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-DEPAPP-260401-8885 | LIA-DEP-001 Patient Deposits | 5,000 | |
| | AR-001 Accounts Receivable | | 5,000 |

### 6. Cash Payment for INV-099 (Rs. 30,000) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-PAY-260401-3658 | CASH-001 Cash in Hand | 30,000 | |
| | AR-001 Accounts Receivable | | 30,000 |

### 7. OPD Invoice INV-20260401-402 (Rs. 5,200) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-INV-260401-9458 | AR-001 | 5,200 | |
| | REV-001 OPD Revenue | | 5,200 |

### 8. IPD Invoice IPD-20260401-079 (Rs. 1,500) ✅
| Entry | Account | DR | CR |
|-------|---------|----|----|
| JE-INV-260401-6450 | AR-001 | 1,500 | |
| | **4010 Service Revenue - IPD** | | 1,500 |

---

## AR Reconciliation for Sannann Malik ✅

```text
Total DR to AR-001:   2,000 + 35,000 + 5,200 + 1,500 = 43,700
Total CR to AR-001:   2,000 + 5,000 + 30,000 + 5,200 + 1,500 = 43,700
Net AR Balance:       0  ✅ (all invoices fully settled)
```

## Deposit Lifecycle ✅

```text
Deposit Received:     5,000 (DR CASH-001, CR LIA-DEP-001)
Deposit Applied:      5,000 (DR LIA-DEP-001, CR AR-001)
Net Liability:        0  ✅ (fully cleared)
```

## Cash Reconciliation ✅

```text
Cash DR:  2,000 + 5,000 + 30,000 + 5,200 + 1,500 = 43,700
Total cash collected matches all payment + deposit records.
```

---

## ISSUES FOUND

### ❌ CRITICAL: Discharge Invoice INV-20260401-099 (Rs. 35,000) Hitting Wrong Revenue Account

**Problem**: The discharge invoice for Sannann Malik was generated with the `INV-` prefix instead of `IPD-`. The GL trigger uses the prefix to route revenue:
- `IPD-` → account `4010` (IPD Revenue) ✅
- `INV-` → account `REV-001` (OPD Revenue) ❌

So Rs. 35,000 of IPD revenue is incorrectly sitting in OPD Revenue (REV-001) instead of IPD Revenue (4010).

**Root Cause**: The discharge flow that generated this invoice used the standard `INV-` prefix generator instead of the `IPD-` prefix. The later IPD-079 invoice correctly uses `IPD-` prefix, suggesting the discharge code path was fixed at some point but this earlier invoice was created before the fix.

**Fix Required**:
1. **Backfill migration**: Update the journal entry for INV-20260401-099 to move the CR from REV-001 to 4010, and recalculate balances for both accounts.
2. **Code verification**: Confirm the discharge flow in `useDischarge.ts` now generates `IPD-` prefixed invoices consistently.

### ⚠️ MINOR: Admission Still Shows "admitted" Status

The admission ADM2601190023 still has `status = 'admitted'` even though a discharge invoice exists and was paid. This could be a display issue or the discharge didn't update admission status.

### ⚠️ MINOR: No IPD Charges Recorded

The `ipd_charges` table has zero records for this admission. The IPD-079 invoice (Rs. 1,500) and INV-099 (Rs. 35,000) were likely created manually or through a different flow, not from accumulated ward charges.

---

## Summary

| Check | Status |
|-------|--------|
| Double-entry integrity (DR = CR) | ✅ Pass |
| Deposit lifecycle (received → applied → cleared) | ✅ Pass |
| AR fully settled (net zero) | ✅ Pass |
| Cash reconciliation | ✅ Pass |
| OPD invoices → REV-001 | ✅ Pass |
| IPD invoice IPD-079 → 4010 | ✅ Pass |
| **Discharge invoice INV-099 → wrong account** | **❌ Fail** |
| Admission status after discharge | ⚠️ Needs review |

## Proposed Fix

**Migration**: Swap the credit line on JE-INV-260401-5254 from REV-001 to 4010, then recalculate `current_balance` for both accounts. Also scan for any other `INV-` prefixed invoices that are actually IPD discharge invoices and fix them too.

**Code check**: Verify `useDischarge.ts` always generates `IPD-` prefix for discharge invoices.

