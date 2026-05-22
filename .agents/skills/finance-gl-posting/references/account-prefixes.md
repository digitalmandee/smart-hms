# Account Prefix Routing Table

## Revenue (CR side on invoice / POS / completion)

| Service prefix | Revenue account | Origin module |
|---|---|---|
| `OPD-` | Revenue – OPD Consultation | OPD checkout |
| `IPD-` | Revenue – IPD Services | IPD discharge invoice |
| `LAB-` | Revenue – Laboratory | Lab order completion |
| `RAD-`, `IMG-` | Revenue – Radiology | Imaging order |
| `DLY-` | Revenue – Dialysis | Dialysis session |
| `OT-`, `SRG-` | Revenue – Surgery | Surgery completion |
| `RX-`, `PHM-` | Revenue – Pharmacy | POS / dispensing |
| `DEN-` | Revenue – Dental | Dental visit |
| `BB-` | Revenue – Blood Bank | Blood services |
| `EMR-` | Revenue – Emergency | Emergency visit |
| `AMB-` | Revenue – Ambulance | Ambulance dispatch |

Unknown / unprefixed service codes route to **Revenue – Other Services (4900)** with a warning log.

## Standard ledger account codes

| Code | Name | Type |
|---|---|---|
| `1010` | Bank Account | Asset |
| `1020` | Cash on Hand | Asset |
| `AR-001` | Accounts Receivable | Asset |
| `INV-001` | Inventory | Asset |
| `AP-001` | Accounts Payable | Liability |
| `LIA-DEP-001` | Patient Deposits | Liability |
| `EXP-COGS-001` | Cost of Goods Sold | Expense |
| `5500` | General Expenses | Expense |
| `STAFF-ADV-001` | Staff Advances | Asset |

## Payment method → ledger

| Method | Debits |
|---|---|
| `cash` | `1020` Cash on Hand |
| `card`, `pos`, `visa`, `mastercard` | `1010` Bank Account |
| `bank_transfer`, `online` | `1010` Bank Account |
| `cheque` | `1010` Bank Account (or `1011` Cheques in Hand if pending clearance) |
| `jazzcash`, `easypaisa`, `stc_pay`, `mada` | `1010` Bank Account |
| `deposit` | `LIA-DEP-001` (consumed) |
| `insurance` | `AR-INS-001` (Insurance Receivable) |
