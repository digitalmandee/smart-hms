

# OT Module — System Linkage Audit & Enhancement Plan

## Current Linkage Status

### Working Integrations
1. **OT → IPD**: Surgery links to `admission_id`; IPD detail page shows `AdmissionOTChargesCard` with surgery list
2. **OT → Patients**: Full patient join on surgery records
3. **OT → Doctors**: Lead surgeon, team members with confirmation workflow and calendar integration
4. **OT → Consent Forms**: Digital consent with signature capture, revocation support
5. **OT → Pre-Op Labs**: `lab_orders.surgery_id` FK exists for pre-op investigations
6. **OT → OPD Consultation**: Surgery requests originate from consultation page (`RecommendSurgeryDialog`)
7. **OT → Medications**: OT medication panel with pharmacy approval queue (`OTMedicationChargesPage`)
8. **OT → PACU**: Post-op recovery with Aldrete scoring, discharge destinations
9. **OT → Scheduling**: Room-based calendar, doctor availability checks
10. **OT → Reports**: Surgeon performance, room utilization, anesthesia type breakdown, trends
11. **OT → Doctor Calendar**: Surgery notifications and team assignment confirmation on `MyCalendarPage`
12. **OT → Fee Templates**: Surgeon fee templates with auto-populated charges (surgeon, anesthesia, OT room, consumable fees)

### Gaps Found

| Gap | Impact |
|-----|--------|
| **No GL posting on surgery completion** | Surgery charges (surgeon fee, anesthesia, consumables) never hit the General Ledger unlike POS/GRN/Payroll which all auto-post |
| **Consumables not deducted from inventory** | `surgery_consumables` tracks usage but never reduces `store_stock` quantities — inventory stays inflated |
| **No surgery-specific invoice generation** | Day-surgery patients (no admission) have no billing path; IPD patients rely on manual discharge billing |
| **No OT-to-Inventory link for instruments** | Instrument count page is clinical-only; no reusable instrument tracking or CSSD sterilization workflow |
| **Post-Op orders don't reach nursing/pharmacy** | Post-op orders are stored as JSON but don't create actual medication or nursing orders in the IPD system |

---

## Enhancement Plan

### Enhancement 1 — Auto-Post Surgery GL Entry on Completion

When surgery status changes to `completed`, create a journal entry:
- **DR** Accounts Receivable (or IPD Patient Account) = total surgery charges
- **CR** Surgery Revenue account = total charges

This mirrors how POS and GRN already auto-post.

**Files**: New migration (DB trigger `auto_post_surgery_to_journal`), modeled after existing `auto_post_pos_transaction` trigger.

### Enhancement 2 — Auto-Deduct Consumables from Inventory

When surgery is completed, iterate `surgery_consumables` with `inventory_item_id` and deduct quantities from `store_stock` (FIFO, same pattern as POS stock deduction in `usePOS.ts`).

**Files**: Add to the `useCompleteSurgery` hook in `useOT.ts` — after status update, loop consumables and deduct stock. Create stock adjustment records for audit trail.

### Enhancement 3 — Day-Surgery Invoice Generation

For surgeries where `admission_id IS NULL` (day cases), auto-generate an invoice on completion using the surgery charges breakdown (surgeon fee + anesthesia + OT room + consumables).

**Files**: Add to `useCompleteSurgery` or create a "Generate Invoice" button on `SurgeryDetailPage.tsx` for non-admitted patients.

### Enhancement 4 — Post-Op Orders Integration with IPD

Convert post-op medication orders into actual `ipd_medications` records so they appear on nursing charts and pharmacy queues.

**Files**: Update `usePostOpOrders.ts` save function to also insert into `ipd_medications` when `admission_id` exists.

### Enhancement 5 — OT Dashboard Quick-Links & Status Improvements

- Add "Revenue Today" stat card on OT Dashboard showing total surgery charges for the day
- Add link to GL entries from surgery detail page (similar to GRN → "View Journal Entry")
- Add inventory alert if any scheduled surgery's consumable list has items below reorder level

**Files**: `OTDashboard.tsx`, `SurgeryDetailPage.tsx`

### Enhancement 6 — Trilingual Labels

Add all new labels (GL posting status, invoice generated, stock deducted, revenue card) to `en.ts`, `ur.ts`, `ar.ts`.

---

## Files to Change

1. **New migration** — `auto_post_surgery_to_journal` trigger function
2. **`src/hooks/useOT.ts`** — Add consumable stock deduction to `useCompleteSurgery`
3. **`src/pages/app/ot/SurgeryDetailPage.tsx`** — Add "View GL Entry" link, "Generate Invoice" for day-surgery
4. **`src/pages/app/ot/OTDashboard.tsx`** — Add revenue stat card
5. **`src/hooks/usePostOpOrders.ts`** — Bridge post-op orders to IPD medications
6. **`src/lib/i18n/translations/en.ts`**, **`ur.ts`**, **`ar.ts`** — New labels

## Priority Order

1. GL auto-posting (financial compliance)
2. Consumable stock deduction (inventory accuracy)
3. Day-surgery invoicing (revenue capture)
4. Post-op orders integration (clinical safety)
5. Dashboard enhancements (operational visibility)

