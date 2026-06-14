# HealthOS 24 — System Audit

**Date:** 2026-06-14  
**Scope:** Accounting & GL, Billing & Revenue, Insurance & Claims, all clinical and ops modules  
**Lens:** UI/UX, missing features, data integrity & reconciliation, reporting depth  
**Status of this doc:** Findings + prioritized backlog. No code changed.

How to read this:
- **P0** = correctness, audit, or revenue-leak risk. Fix first.
- **P1** = high ROI UX / feature gaps. Visible pain.
- **P2** = polish, nice-to-have, longer horizon.
- **Effort:** S (≤1 day), M (2–5 days), L (>1 week).

---

## 1. Executive Summary — Top 10 Fixes by ROI

| # | Area | Item | Severity | Effort |
|---|---|---|---|---|
| 1 | Billing | One unified **Cashier Workspace** (queue → invoice → payment → receipt) replacing 5 disjointed pages | P0 | M |
| 2 | Accounting | **Trial Balance integrity panel** — real-time check that Σ debits = Σ credits per period + per source, surfaces unposted/orphan rows | P0 | M |
| 3 | Billing | **Deposit & refund ledger view per patient** with running balance, deposit-vs-cash split, refund workflow with reason codes | P0 | M |
| 4 | Accounting | **Auto bank reconciliation** — CSV/MT940 import + auto-match by amount/date/ref, exception queue | P1 | L |
| 5 | Billing | **Aged AR by payer** (patient vs insurer vs corporate), drillable to invoice, with collection actions | P1 | M |
| 6 | Insurance | **ERA / payment-advice ingestion** with line-level adjustment posting (currently manual mark-as-paid) | P0 | L |
| 7 | Daily Closing | **Pre-close dashboard** showing open sessions, unposted vouchers, unmatched payments, with one-click drill | P0 | S |
| 8 | IPD | **Live running bill** for inpatients (charges accumulating, deposit burn-down, projected discharge total) | P1 | M |
| 9 | Pharmacy | **Margin & expiry dashboard** — drug-level GP%, near-expiry FIFO heatmap, slow-mover alerts | P1 | M |
| 10 | Cross-cutting | **Global Command-K search** (patient, invoice, MRN, order, voucher, GL account) | P1 | S |

---

## 2. Cross-cutting Issues

### 2.1 Navigation & information architecture
- `/app/accounts` has **48 pages** in a flat folder. No grouped landing. Users hunt by URL. *Recommendation:* an Accounts Hub with 4 groupings: Ledger, Receivables, Payables, Reporting.
- `/app/billing` has **22 pages**, including insurance pages that also live under `/app/insurance`. Duplication confuses RBAC. *Recommendation:* move all NPHIES/claims into `/app/insurance/*` (per existing memory rule) and leave billing for invoicing/cash only.
- No **global search**. Cashiers cannot jump to a patient or invoice from anywhere — they navigate trees.
- **Breadcrumbs** are inconsistent across modules.

### 2.2 Patient balance display (existing rule, partly violated)
Memory rule: always show *Outstanding Balance* AND *Available Deposit* together. Several places only show one:
- `InvoiceStatusPanel.tsx` (IPD) shows balance/refund but not the patient's *remaining* deposit available on other invoices.
- Patient profile header shows neither prominently.
- *Fix:* a `<PatientFinancialBadge>` component used in profile, IPD, OPD checkout, and pharmacy POS.

### 2.3 Split-payment UX
- `InvoiceTotals.tsx` accepts a single `thisPayment` number. Split entry (cash + card + wallet) is done in a separate dialog and concatenated cognitively by the cashier. We *store* splits correctly per memory; we don't *visualize* them in the invoice screen.
- *Fix:* split rows table inline with running "remaining to settle".

### 2.4 Empty states, errors, loading
- Many list pages render a blank `<Table>` with no skeleton. Looks broken on slow networks.
- Errors are toasts only — no inline retry. *Fix:* shared `<DataState loading error empty>` wrapper.

### 2.5 Mobile responsiveness
- Billing, IPD, POS pages assume ≥1280px. Tablet (1024px) breaks the invoice form. Phones are unusable.
- Cashiers often work from tablets. *P1* — responsive overhaul of invoice & payment screens.

### 2.6 Notifications & in-app inbox
- Toasts disappear. No persistent inbox for things like "claim rejected", "session left open", "PR awaiting approval".
- *Fix:* `notification_logs` already exists — surface in a header bell.

### 2.7 Audit log surfacing
- `audit_logs` is captured but barely viewable. Only `FinancialAuditLogPage.tsx` exists. *Fix:* "Who changed this?" drawer on every detail page.

### 2.8 Tri-lingual coverage drift
Per project rule, EN/UR/AR must be complete. Newer pages (Insurance claim form, Bank reconciliation, Cost-Center P&L) ship in English only. *Fix:* i18n audit pass; CI lint that fails on hardcoded strings outside whitelisted dev pages.

### 2.9 Tone consistency
Memory rule violated in several places — "CFO-grade dashboard", "Premium audit-ready ledger". Replace with functional descriptive text.

---

## 3. Module Deep Dive

### 3.1 Accounting & General Ledger

**Today.** 4-level CoA, idempotent triggers post journals from 15+ source modules, Journal Entries / Trial Balance / Balance Sheet / P&L / Cash Flow / GL pages exist. Vouchers (CPV/CRV/BPV/BRV/JV) immutable when posted. Fiscal periods & year-end closing pages exist.

**UI/UX issues**
- `ChartOfAccountsPage` shows a flat list; needs a **collapsible 4-level tree** with running balance per node and search.
- `JournalEntriesPage` has no filter for `source_type` — auditors can't isolate "all invoice-sourced JEs for March".
- `TrialBalancePage` does not show **a balanced/unbalanced badge** at the top. Should be the first thing visible.
- No **Period Lock indicator** in headers — users edit transactions in locked months and only discover the failure on save.
- Voucher entry: account picker is a long combobox. No favorites, no recent, no keyboard-only flow. Cashiers slow.
- General Ledger page lacks **opening balance**, **closing balance**, and **export to Excel with formatting** that auditors expect.

**Integrity / reconciliation risks**
- No automated **Trial Balance health check** job. If a trigger silently fails (e.g. permission, new source), an unbalanced JE can land. *Add:* nightly `verify_trial_balance()` RPC + Slack/email + UI banner.
- No **JE source coverage report** — i.e. "for each module, does every source row have its JE?". *Add:* `reports/gl_coverage` showing invoices without JE, POS sales without JE, GRNs without JE, etc.
- `entry_number` empty-string requirement is enforced by convention; one stray manual insert breaks the sequence. *Add:* DB trigger to forbid non-empty `entry_number` on insert.
- Recurring entries page exists but no **dry-run preview** before posting.

**Missing features**
- **Multi-currency** (org has currency code; journals don't carry FX rate / functional vs reporting amount). Blocks expansion outside KSA/PK.
- **Inter-branch transactions** (due-to / due-from) — currently a single journal per branch only.
- **Departmental allocation rules** beyond cost centers (e.g. allocate utilities by sqft).
- **Project / Job costing** dimension on JE lines.
- **Budget vs Actual with variance commentary** workflow.
- **Year-end automated revaluation, accruals, prepayments amortization** (manual today).
- **Asset depreciation posting preview** before commit (V2 hook exists; UI is bare).
- **Indirect cash-flow method** support (we have direct only).
- **IFRS-compliant disclosures** export pack.

**Reporting gaps**
- No **AR aging by payer category** with drill-down.
- No **AP aging** with payment-planning view.
- No **vendor & customer 360** with KPIs.
- No **dimensional P&L** (branch × department × cost center matrix).
- No **funds-flow / working-capital report**.
- No **monthly comparative balance sheet** (3-period side-by-side).

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| ACC-01 | Trial Balance integrity job + banner | P0 | M |
| ACC-02 | GL coverage report (orphan source rows) | P0 | S |
| ACC-03 | Period-lock indicator + guard on every entry form | P0 | S |
| ACC-04 | CoA collapsible tree with balances | P1 | M |
| ACC-05 | JE filter by source_type, posted_by, period | P1 | S |
| ACC-06 | Account picker with recents + favorites + keyboard | P1 | S |
| ACC-07 | Aged AR / AP by payer | P1 | M |
| ACC-08 | Dimensional P&L (branch × dept × cost center) | P1 | M |
| ACC-09 | Multi-currency journals + FX revaluation | P2 | L |
| ACC-10 | Inter-branch due-to/due-from accounts | P2 | M |
| ACC-11 | Prepayments & accruals amortization scheduler | P2 | M |
| ACC-12 | Job costing dimension | P2 | L |

---

### 3.2 Billing & Revenue

**Today.** Invoice list/detail/form, Payment collection & history, Payment reconciliation, Daily closing, Billing sessions, Patient deposits, Credit notes, PDC register, Patient statement. Strong: pending-charges auto-load, split payments stored as rows, deposit lifecycle as liability → AR transfer, doctor earnings auto-trigger.

**UI/UX issues**
- **Cashier workflow is spread across 5 pages**: Sessions → Invoices list → Invoice form → Payment Collection → Daily Closing. No "Cashier home" that orchestrates the shift in one place.
- `InvoiceFormPage` is long and scroll-heavy; sticky totals panel exists in some places, not others.
- Invoice line entry has no **quick-add by service code** or barcode.
- Credit note workflow asks for free-text reason — should be picklist + free text.
- Deposit dialog does not let you **apply across multiple outstanding invoices** in one step.
- `PaymentReconciliationPage` (insurance) and `BankReconciliationPage` (bank) and `ARReconciliationPage` look similar but behave differently. Confusing.
- Print receipts are HTML-rendered; alignment breaks on 80mm thermal printers. *Add:* dedicated ESC/POS / 80mm CSS profile.

**Integrity / reconciliation risks**
- `invoice_date` must be UTC (memory rule) — needs a guard test in CI.
- Race condition risk on simultaneous invoice creation against same lab order — covered by "link invoice_id before payment", but no DB UNIQUE on `lab_orders.invoice_id` + `payment_id` combination.
- Daily closing relies on cashier discipline to close sessions. *Add:* auto-prompt at end-of-shift, escalate to manager if >2h overdue.
- Credit notes can be issued against `paid` invoices — refund path must be linked. Today UI lets you issue credit note without scheduling the refund.
- `patient_deposits` `type = 'applied'` rows must always balance against an invoice — *add* a reconciliation report flagging mismatches.

**Missing features**
- **Estimates / quotations** for self-pay procedures (no record, big leakage).
- **Package & bundle pricing** for surgeries / health checkups (exists in service types but no UI to author).
- **Promotional discount approval workflow** (cashier > supervisor > manager based on % threshold).
- **Corporate / contract billing** — monthly consolidated invoices per company, settlement workflow.
- **Installment plans / EMI** with auto-reminders.
- **Loyalty / membership** integration.
- **Tip / service charge** line type.
- **Multi-invoice payment receipt** (collect once, allocate across many).
- **Auto-collection rules** (apply deposit, then insurance, then patient cash) with override audit trail.

**Reporting gaps**
- No **collection efficiency** report (billed vs collected by period, cashier, branch).
- No **discount leakage** report (who approved, why, %, trend).
- No **payment-method mix** trend.
- No **invoice cycle time** (created → fully settled days).
- No **write-off analytics**.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| BIL-01 | Unified Cashier Workspace (one page, shift state machine) | P0 | M |
| BIL-02 | Deposit & refund ledger per patient with running balance | P0 | M |
| BIL-03 | Discount approval workflow with threshold matrix | P0 | M |
| BIL-04 | 80mm thermal receipt template + printer profile | P1 | S |
| BIL-05 | Estimates / quotations module | P1 | M |
| BIL-06 | Package & bundle pricing UI | P1 | M |
| BIL-07 | Corporate / contract billing with monthly consolidation | P1 | L |
| BIL-08 | Multi-invoice payment allocation dialog | P1 | S |
| BIL-09 | Collection efficiency, discount leakage, write-off reports | P1 | M |
| BIL-10 | Installment plans with reminders | P2 | M |

---

### 3.3 Insurance & Claims

**Today.** Standalone module at `/app/insurance`, NPHIES gateway edge function, eligibility logs, claim items, claim attachments, reconciliation page, claim scrubber lib, medical codes table.

**UI/UX issues**
- **Eligibility check** is buried — should be a one-click action on patient header when an active policy exists.
- **Claim form** is a single long page — should be a wizard (Patient & policy → Diagnoses → Services → Attachments → Scrub → Submit).
- Scrubbing errors are listed but not contextually attached to the offending field.
- **Pre-authorization** flow is shallow — no template by procedure, no SLA timer.
- **Denied-claim management** has no kanban / queue view by denial reason and assigned owner.
- Reconciliation page (`PaymentReconciliationPage`) uses client-side filtering on entire claim set — slow on large orgs. Server-side pagination needed.

**Integrity / reconciliation risks**
- `usePostToAccounts` uses `.single()` (memory rule violation). Should be `.maybeSingle()` and explicit empty handling.
- Payment reference auto-generated as `ERA-${Date.now()}` — should come from the ERA file, never invented locally.
- Coverage formula spread across components; should consolidate into `calculateCoverage()` helper (per skill).
- No **claim chaining check** — resubmissions can lose link to original.

**Missing features**
- **ERA / 835-equivalent ingestion** with line-level CARC/RARC posting and bulk reconciliation.
- **Pre-authorization template library** by procedure code.
- **Coverage validator** at order entry (lab/imaging/pharmacy) — warns before service if not covered.
- **Auto-resubmission** for fixable rejections (missing code, expired pre-auth) with audit trail.
- **Insurer scorecard** — approval rate, avg days to pay, dispute outcomes.
- **Patient-facing EOB** (Explanation of Benefits) PDF.
- **NPHIES preauth bundle attachments** beyond the basic file upload.
- **Batch claim submission** for the day.

**Reporting gaps**
- No **first-pass acceptance rate** by insurer / branch / coder.
- No **DSO by payer**.
- No **denial reason Pareto** chart.
- No **leakage report** (write-offs after partial approval).

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| INS-01 | ERA ingestion + line-level CARC/RARC posting | P0 | L |
| INS-02 | Fix `.single()` usage and synthetic payment ref | P0 | S |
| INS-03 | Claim form wizard with inline scrubbing errors | P1 | M |
| INS-04 | Denied-claim kanban with owner & SLA | P1 | M |
| INS-05 | Coverage validator at order entry | P1 | M |
| INS-06 | Insurer scorecard + first-pass acceptance report | P1 | M |
| INS-07 | Pre-auth template library | P2 | M |
| INS-08 | Patient EOB PDF | P2 | S |

---

### 3.4 OPD

**Today.** Walk-in 4-step wizard, token queue (auto-paginated), department-wise dashboards, vitals (nurse), consultation (doctor), checkout with fuzzy service matching.

**UI/UX issues**
- Token display refresh feels heavy — full table refetch. Use realtime patch instead.
- Doctor consultation page has no **previous-visit at-a-glance card** (vitals trend, last Rx, allergies).
- Vitals page does not visualize trends across visits.
- Repeat-visit workflow forces re-entry of complaints.

**Missing features**
- **Templates / smart phrases** for SOAP notes per specialty.
- **Voice-to-note** (Tabeebi exists for voice strategy — integrate into OPD consult).
- **Order sets** (one click → labs + Rx + follow-up).
- **Follow-up reminder workflow** (auto-WhatsApp at +N days).
- **Patient-shared visit summary** via portal/QR.

**Reporting gaps**
- No **no-show rate** by doctor / clinic.
- No **average consultation time** trend.
- No **repeat visit window** analysis (return-within-X-days).

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| OPD-01 | Previous-visit snapshot card on consultation | P1 | S |
| OPD-02 | SOAP templates per specialty | P1 | M |
| OPD-03 | Order sets | P1 | M |
| OPD-04 | Vitals trend visualization | P2 | S |
| OPD-05 | No-show + consult-time analytics | P2 | M |

---

### 3.5 IPD

**Today.** Admission with mandatory procedure + attending doctor, beds/wards/floors config, daily rounds, IPD vitals, medications, daily charges, deposits, discharge summaries & checklist, accrual accounting, ward-medication auto-charges.

**UI/UX issues**
- No single **patient bedside chart** view — nurses jump between vitals, meds, rounds, charges pages.
- **Live running bill** for the patient is missing (charges accrue off-ledger; the patient and bedside staff cannot see "current bill so far").
- Bed board lacks **drag-to-transfer** with required reason.
- Discharge process: checklist + summary + invoice generated separately — needs orchestrated wizard.

**Integrity risks**
- `ipd_charges.is_billed = true` only flips at discharge invoice — if discharge is reversed, no flip-back logic surfaced in UI.
- Bed transfer between branches not supported in `bed_transfers` UI.
- Room/board daily charge cron — needs visibility into last-run status.

**Missing features**
- **Estimate at admission** based on procedure package and expected LoS.
- **Discharge prediction** (LoS vs expected).
- **Multi-doctor team billing** (consultations during stay) with per-visit doctor charge auto-add.
- **Care plan templates** per diagnosis.
- **Nursing handover printout**.

**Reporting gaps**
- No **ALOS** (average length of stay) trend.
- No **bed occupancy heatmap**.
- No **IPD profitability** per case / DRG.
- No **readmission rate**.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| IPD-01 | Live running bill panel for inpatients | P0 | M |
| IPD-02 | Unified bedside chart (vitals/meds/rounds/charges) | P1 | M |
| IPD-03 | Discharge orchestration wizard | P1 | M |
| IPD-04 | Daily-charge cron status visibility | P1 | S |
| IPD-05 | Bed-board drag-and-drop with transfer reason | P2 | M |
| IPD-06 | ALOS / occupancy / IPD profitability dashboards | P1 | M |

---

### 3.6 Lab

**Today.** Specimen workflow with `{PREFIX}-{YYMMDD}-{SEQ}`, Save→Submit→Publish lifecycle, result templates with 3-tier priority match, analyzer mappings, realtime payment sync, critical-value alerts.

**UI/UX issues**
- Worklist lacks **batch actions** (e.g. release 20 reports at once).
- Result entry: ranges/units not always pre-filled from template.
- Critical values flagged but no **callback log** with timestamp + staff acknowledging.

**Missing features**
- **External lab / reference lab routing** with cost capture.
- **Quality control (QC) module** — Levey-Jennings, Westgard rules per analyzer.
- **Patient longitudinal cumulative report** (all results for last 6 months side-by-side).
- **Reflex testing rules** (if result X abnormal → auto-order Y).

**Reporting gaps**
- No **TAT (turnaround time)** report per test / per analyzer.
- No **reject rate** by reason.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| LAB-01 | Batch release with audit | P1 | S |
| LAB-02 | Critical-value callback log | P0 | S |
| LAB-03 | QC module (Levey-Jennings) | P2 | L |
| LAB-04 | TAT analytics | P1 | M |
| LAB-05 | Reflex testing rules engine | P2 | M |

---

### 3.7 Radiology

**Today.** PACS settings, modalities, orders, reports lifecycle Pending→Reported→Verified→Delivered, report templates.

**UI/UX issues**
- No **worklist** view that mirrors DICOM modality worklist for technicians.
- Image viewer is basic; no measurement tools / windowing presets.
- Report typing area lacks templates dropdown.

**Missing features**
- **Critical findings notification** to referrer.
- **Comparison with prior** in viewer.
- **Voice dictation** for reports.
- **Teleradiology** outsourcing workflow with SLA.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| RAD-01 | Technician worklist mirroring DICOM MWL | P1 | M |
| RAD-02 | Report template picker in editor | P1 | S |
| RAD-03 | Critical finding notification to referrer | P0 | S |
| RAD-04 | Voice dictation integration | P2 | M |

---

### 3.8 Pharmacy & POS

**Today.** Dedicated pharmacy POS sessions, batch/expiry tracked inventory, FIFO dispensing via bulk lookup, returns to same batch, COGS auto-post, held transactions, Wasfaty for KSA.

**UI/UX issues**
- POS payment dialog OK but **search by barcode/scan** flow is keyboard-fragile.
- Held transactions list lacks **time-since-held** and auto-cancel after N hours.
- Returns require re-finding the original sale — should have "return from sale" entry point.

**Integrity risks**
- Per skill rule, lookups must be bulk; spot-check needed across newer screens.
- Cycle counts page exists but no **blind-count** mode (counter sees expected qty — bias risk).

**Missing features**
- **Margin dashboard** per medicine, category, supplier.
- **Near-expiry FIFO heatmap** + auto-discount rule suggestions.
- **Slow-mover / dead-stock** alerts.
- **Drug interaction warnings** during dispensing (table exists, not wired into POS).
- **Substitute medicine** suggestions when out of stock.
- **Pack / unit conversion** at point of sale.
- **Refill reminders** for chronic medications.

**Reporting gaps**
- No **GP% by SKU / category** trend.
- No **stock-out frequency**.
- No **expiry-loss valuation**.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| PHM-01 | Margin & expiry dashboard | P1 | M |
| PHM-02 | Wire drug-interaction warnings into POS | P0 | S |
| PHM-03 | Blind-count mode for cycle counts | P1 | S |
| PHM-04 | Return-from-sale shortcut | P1 | S |
| PHM-05 | Slow-mover / dead-stock alerts | P1 | M |
| PHM-06 | Refill reminder workflow | P2 | M |

---

### 3.9 OT / Surgery

**Today.** Surgery requests/scheduling, OT rooms, pre-anesthesia, intra-op notes, post-op recovery, surgical safety checklist, consumables (FIFO deduction), team members, journal auto-post on completion.

**UI/UX issues**
- No **OT board** day-view with rooms × time slots, status colors.
- Scheduling conflicts (surgeon / room / equipment) not surfaced during booking.
- Consumables entry mid-procedure is slow; needs barcode + favorites per procedure.

**Missing features**
- **Surgical pack templates** (auto-pick consumables for procedure type).
- **Implant traceability register** (regulatory in many markets).
- **Anesthesia gas / drug consumption** tracking.
- **Surgical site infection (SSI) follow-up workflow**.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| OT-01 | OT board day-view with conflict detection | P1 | M |
| OT-02 | Surgical pack templates per procedure | P1 | M |
| OT-03 | Implant traceability register | P0 | M |
| OT-04 | SSI follow-up workflow | P2 | M |

---

### 3.10 Dialysis

**Today.** Decoupled nurse/doctor workflow, sessions with `DS-YYYYMMDD-XXX`, machines, schedules, vitals during session.

**Issues**
- No machine **maintenance & disinfection log** UI tied to session blocking.
- No **water-quality log** (required compliance in some markets).
- No **monthly nephrologist review** template.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| DLY-01 | Machine maintenance/disinfection log with session block | P0 | S |
| DLY-02 | Water-quality log | P1 | S |
| DLY-03 | Monthly nephrologist review template | P2 | S |

---

### 3.11 Blood Bank

**Today.** Donors, donations, inventory with 35-day default expiry, requests, cross-match, transfusions, transfusion reactions, cold-chain logs.

**Issues**
- No **donor recall** workflow on positive screening result.
- Cross-match → issue → return-to-stock flow exists but needs **chain-of-custody** print labels.
- No **transfusion lookback** report (recipients of donor X over 12 months).

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| BB-01 | Donor recall workflow with notification | P0 | S |
| BB-02 | Chain-of-custody print labels | P1 | S |
| BB-03 | Transfusion lookback report | P1 | M |

---

### 3.12 Dental

**Today.** 3D tooth chart per-surface, treatments, procedures, images.

**Issues**
- 3D chart performance on lower-end devices unverified.
- No **treatment-plan estimate** auto-billing tie-in.
- No **before/after photo carousel** standardized.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| DEN-01 | Treatment plan → estimate → invoice link | P1 | M |
| DEN-02 | Image carousel with date stamps | P2 | S |

---

### 3.13 HR & Payroll

**Today.** Two-pass payroll engine, multi-stage approval, salary revision history, ESB calc, exit clearance automation, leave & attendance, biometric sync.

**UI/UX issues**
- Payroll run page lacks **side-by-side prior-month comparison**.
- Pay slip preview & email-bulk is minimal.
- Leave calendar is per-employee; **team calendar** view missing.

**Missing features**
- **Performance management** module — KPI templates, review cycles.
- **Training & development** beyond enrollments — competency matrix.
- **Manpower budget vs actual**.
- **Employee self-service** mobile experience parity (My* pages exist; need polish).

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| HR-01 | Payroll prior-month comparison view | P1 | S |
| HR-02 | Team leave calendar | P1 | S |
| HR-03 | Performance management module | P2 | L |
| HR-04 | Manpower budget vs actual | P2 | M |

---

### 3.14 Inventory / Warehouse / Procurement

**Today.** PR → PO → GRN → put-away → bins/zones/racks, requisitions, transfers, cycle counts, RTV, shipments, dock appointments. GRN atomic upsert; auto-posts DR INV CR AP.

**UI/UX issues**
- Approval routing for PR not visible — approvers don't know what's pending without entering the page.
- Bin transfer UI assumes desktop; warehouse staff need mobile/PWA.
- GRN entry: long form, no scanner-first mode.

**Missing features**
- **ABC / VED classification** for items.
- **Min-max / reorder point auto-PR** generation.
- **Vendor performance scorecard** (on-time, fill-rate, defect-rate).
- **Three-way match** (PO ↔ GRN ↔ Invoice) surfaced explicitly.
- **Landed cost** allocation (freight, duty).

**Reporting gaps**
- **Stock valuation** by FIFO / weighted-average toggle.
- **Slow / non-moving** stock report.
- **Inventory turnover ratio**.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| INV-01 | Three-way match dashboard | P0 | M |
| INV-02 | Min-max reorder + auto-PR | P1 | M |
| INV-03 | Vendor scorecard | P1 | M |
| INV-04 | Mobile bin-transfer / scanner-first GRN | P1 | M |
| INV-05 | Landed cost allocation | P2 | M |
| INV-06 | Stock valuation + turnover reports | P1 | M |

---

### 3.15 Fixed Assets

**Today.** Assets register, depreciation posting V2, maintenance records.

**Issues**
- No **asset tagging / QR labels** print.
- No **disposal / write-off** workflow with GL posting linkage.
- No **CapEx vs OpEx** dashboards.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| FA-01 | Disposal workflow with GL linkage | P1 | M |
| FA-02 | QR asset tag printing + scan to view | P2 | S |

---

### 3.16 Patient Portal & Mobile

**Today.** Portal: dashboard, appointments, invoices, lab results, prescriptions, profile. Mobile splash + dashboards per role.

**Issues**
- Portal invoice page does not show **deposit balance** or allow **online top-up**.
- Lab results lack **trend graphs**.
- No **secure messaging** with care team.
- No **booking + reschedule** flow with insurance check.

**Backlog**

| ID | Item | P | Effort |
|---|---|---|---|
| POR-01 | Online deposit top-up + invoice pay | P0 | M |
| POR-02 | Lab result trend graphs | P1 | S |
| POR-03 | Secure care-team messaging | P2 | L |
| POR-04 | Self-booking with insurance eligibility | P1 | M |

---

## 4. Reporting & Analytics — Cross-cutting Gaps

| Gap | Impact |
|---|---|
| **Executive cockpit** — single page with daily revenue, collections, AR, occupancy, top denials, cash position | High |
| **AR aging by payer × age bucket** with drill-down | High |
| **Drug margin & inventory turn** | High |
| **Doctor productivity** (consults, revenue, collection rate, no-show, patient satisfaction) | High |
| **Department P&L** with revenue, direct cost, allocations | High |
| **Insurer scorecard** (acceptance, DSO, denial mix) | High |
| **Cash flow forecast** (next 30/60/90 from AR/AP schedules) | Medium |
| **Budget variance commentary workflow** | Medium |
| **Scheduled reports & email distribution** | Medium |
| **Embedded BI / saved views** with sharing | Medium |
| **Data export to warehouse / Power BI** | Medium |

---

## 5. Integrations — Gaps

- **Bank statement import** (CSV / MT940 / OFX) for auto-reconciliation. *P0 for finance ops*.
- **Payment gateways** for online patient payments (Mada / Tap / Stripe / EasyPaisa / JazzCash). Some scaffolding exists; user-flow polish needed.
- **WhatsApp template lifecycle** (Meta approval status surfaced in admin).
- **HL7 / FHIR inbound** (currently outbound only via NPHIES).
- **DICOM modality worklist** push (today: PACS pull).
- **E-signature** for consents (DocuSign/Adobe Sign or local provider).
- **Government health-info exchanges**: SCFHS / HESN feedback ingestion.

---

## 6. Compliance Posture

| Area | Status | Gap |
|---|---|---|
| **ZATCA Phase 1** | Done | — |
| **ZATCA Phase 2** | UBL + hash + chain in place | Need automated **chain-integrity verifier** + alerting; QR rendering test on thermal printers; archival format |
| **NPHIES** | Eligibility, claim, scrubber | ERA ingestion, pre-auth template library, denial automation |
| **HIPAA** | RLS, masking, timeouts, MFA | Public-facing HIPAA page ✅; need **breach drill exercise** UI, BAA template management surfaced |
| **KSA PDPL** | Privacy page, retention purge edge fn exists | Consent receipt log, DSAR (data subject access request) workflow |
| **GDPR** | Privacy page, cookie banner ✅ | DSAR workflow, data-portability export per patient |
| **SOC 2 readiness** | Audit logs captured | Centralized control matrix UI; quarterly access review workflow |
| **Tatmeen / Sehhaty / Nafath** | Gateways exist | UI surfacing of sync status & error retries |

---

## 7. Prioritized Backlog (flat)

| ID | Area | Item | Severity | Effort |
|---|---|---|---|---|
| ACC-01 | Accounting | Trial Balance integrity job + banner | P0 | M |
| ACC-02 | Accounting | GL coverage report (orphan source rows) | P0 | S |
| ACC-03 | Accounting | Period-lock indicator + guard | P0 | S |
| BIL-01 | Billing | Unified Cashier Workspace | P0 | M |
| BIL-02 | Billing | Deposit & refund ledger with running balance | P0 | M |
| BIL-03 | Billing | Discount approval workflow | P0 | M |
| INS-01 | Insurance | ERA ingestion + line-level posting | P0 | L |
| INS-02 | Insurance | Fix `.single()` + synthetic payment ref | P0 | S |
| IPD-01 | IPD | Live running bill panel | P0 | M |
| LAB-02 | Lab | Critical-value callback log | P0 | S |
| RAD-03 | Radiology | Critical finding notification | P0 | S |
| OT-03 | OT | Implant traceability register | P0 | M |
| DLY-01 | Dialysis | Machine maintenance log w/ session block | P0 | S |
| BB-01 | Blood Bank | Donor recall on positive screening | P0 | S |
| PHM-02 | Pharmacy | Drug-interaction warnings in POS | P0 | S |
| INV-01 | Inventory | Three-way match dashboard | P0 | M |
| POR-01 | Portal | Online deposit top-up + invoice pay | P0 | M |
| ACC-04..12 | Accounting | CoA tree, JE filters, picker, aged AR/AP, dimensional P&L, multi-currency, inter-branch, accruals, job costing | P1–P2 | varies |
| BIL-04..10 | Billing | Receipt template, estimates, packages, contract billing, multi-invoice payment, analytics, EMI | P1–P2 | varies |
| INS-03..08 | Insurance | Claim wizard, denial kanban, coverage validator, scorecard, EOB, batch submit | P1–P2 | varies |
| OPD-01..05 | OPD | Visit snapshot, SOAP templates, order sets, vitals trend, no-show analytics | P1–P2 | varies |
| IPD-02..06 | IPD | Bedside chart, discharge wizard, cron status, bed-board DnD, ALOS dashboards | P1–P2 | varies |
| LAB-01..05 | Lab | Batch release, QC, TAT, reflex rules | P1–P2 | varies |
| RAD-01..04 | Radiology | Tech worklist, templates, voice | P1–P2 | varies |
| OT-01..04 | OT | Board view, packs, SSI | P1–P2 | varies |
| PHM-01..06 | Pharmacy | Margin dashboard, blind count, returns, slow-mover, refill | P1–P2 | varies |
| HR-01..04 | HR | Payroll compare, team calendar, performance, manpower budget | P1–P2 | varies |
| INV-02..06 | Inventory | Reorder auto-PR, vendor scorecard, mobile, landed cost, valuation | P1–P2 | varies |
| FA-01..02 | Assets | Disposal workflow, QR tags | P1–P2 | varies |
| POR-02..04 | Portal | Trend graphs, messaging, self-booking | P1–P2 | varies |

---

## 8. Suggested Sprint Sequence (next 6 weeks)

**Sprint 1 — Stop the bleeding (correctness & visibility)**
- ACC-01 Trial Balance integrity + banner
- ACC-02 GL coverage report
- ACC-03 Period-lock guard
- INS-02 Insurance `.single()` + payment ref fix
- LAB-02 Critical-value callback log
- BB-01 Donor recall
- PHM-02 Drug interaction in POS

**Sprint 2 — Cashier & inpatient experience**
- BIL-01 Cashier Workspace
- BIL-02 Deposit & refund ledger
- IPD-01 Live running bill
- BIL-04 Thermal receipt template

**Sprint 3 — Receivables & insurance**
- ACC-07 Aged AR/AP by payer
- INS-03 Claim wizard
- INS-04 Denied-claim kanban
- INS-01 ERA ingestion (start)

**Sprint 4 — Margin & ops insight**
- PHM-01 Margin & expiry dashboard
- INV-01 Three-way match
- INV-02 Reorder auto-PR
- ACC-08 Dimensional P&L

After Sprint 1–2 we re-evaluate priorities with real user feedback.

---

## 9. What I'd want from you next

1. Sign off on Sprint 1 scope (or tell me what to swap in/out).
2. Drop one line about the specific accounting/billing pain you hit so I can bias the deep-dive in Sprint 2.
3. Confirm tri-lingual scope (EN/UR/AR) applies to new screens — assumed yes.

— end of audit —
