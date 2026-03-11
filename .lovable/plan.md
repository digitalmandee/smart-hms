

## Seed More OPD/IPD Data & Billing Sessions for Daily Closing

### Current State
- **Invoices**: 91 (66 paid, 22 pending, 3 partially_paid) — all dated around Mar 9, 2026
- **Payments**: 59 total
- **Billing Sessions**: 4 (need more with today's date for daily closing)
- **Daily Closings**: 0 (empty)
- **Admissions**: 17 active
- **Appointments**: 56

### Problem
The Daily Closing page (`/app/billing/daily-closing`) aggregates billing sessions, payments, and invoices **by branch + date**. Currently there are no billing sessions or invoices for **today** (Mar 11), so the daily closing wizard shows empty data. The reception needs realistic same-day data to test the closing workflow.

### Plan

**Single SQL seed operation** (via insert tool, not migration) to add:

#### 1. Today's Billing Sessions (3 records)
- Morning shift session (closed, with cash/card totals)
- Afternoon shift session (closed)  
- Evening session (still open — tests the "open sessions" warning)
- All linked to org `b1111111-...`, branch `c1111111-...`, opened_by receptionist `00000000-...-000000000030`

#### 2. Today's OPD Invoices (10 records)
- Mix of consultation + lab + radiology service types
- 7 paid, 2 pending, 1 partially_paid
- Amounts: Rs. 1,000–5,000 range
- Each with 1–3 invoice_items linked to existing service_types (consultation, lab, radiology categories)
- `created_at` set to today with varying hours

#### 3. Today's IPD Invoices (5 records)  
- Linked to existing admitted patients
- Invoice numbers prefixed `IPD-` for finance module recognition
- Mix of room charges + procedure service types
- 3 paid, 2 pending
- Amounts: Rs. 15,000–50,000 range

#### 4. Payments for Paid Invoices (~12 records)
- Linked to the billing sessions above
- Mix of Cash (60%), Credit Card (25%), JazzCash/EasyPaisa (15%)
- Payment method IDs from existing `payment_methods` table
- This ensures the daily closing summary calculates correct cash/card/UPI breakdowns

#### 5. Historical Daily Closings (3 records)
- Mar 8, 9, 10 — approved closings with realistic department breakdowns
- Populates the closing history page

### How This Hits the Finance Module
- Invoice creation triggers auto-posting to GL (Revenue + AR journal entries)
- Payments trigger `update_session_on_payment` — updates billing session totals
- Daily closing aggregates all of this by date for the reception to reconcile
- The reception has a dedicated 4-step wizard at `/app/billing/daily-closing`:
  1. Review billing sessions
  2. Record expenses/payouts
  3. Cash denomination reconciliation
  4. Submit for approval

### Files
- No code changes needed — this is purely seed data via SQL insert operations

