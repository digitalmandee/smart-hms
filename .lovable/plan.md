
# System Audit — HealthOS 24

## Goal

Deliver a single, structured markdown audit at `docs/SYSTEM_AUDIT_2026-06.md` that:
- Maps the current state of every major module.
- Calls out concrete UI/UX friction (with screen references).
- Lists missing features vs. comparable HMS/ERP products (Oracle Cerner, Epic, BizPharma, Odoo Healthcare, Bahmni, ZOHO Books-style finance).
- Flags data-integrity & reconciliation risks (trigger gaps, race conditions, audit-trail holes).
- Identifies reporting/analytics gaps.
- Prioritizes everything P0 / P1 / P2 with effort estimate (S/M/L) and ROI signal.

No code, no UI changes in this pass. Output is a doc you can review and then approve specific items for implementation.

## Method

For each module the audit will follow the same template so it's scannable:

```
### <Module>
- Scope today: <one paragraph from code inspection>
- UI/UX issues: <bulleted, with file/route ref>
- Integrity / reconciliation risks: <bulleted, with trigger or hook ref>
- Missing features (vs. market): <bulleted>
- Reporting gaps: <bulleted>
- Recommendations: P0 / P1 / P2 table
```

I will inspect:
- All `src/pages/app/**` routes and their hooks.
- Finance: `useDailyClosings`, `useJournalEntries`, voucher pages, ZATCA function, `journal_entries` triggers.
- Billing: `InvoiceTotals`, `usePatientStatement`, `usePendingCharges`, payment dialogs, billing sessions, credit notes.
- Insurance: `usePaymentReconciliation`, NPHIES gateway, `insurance_claims`, eligibility hooks.
- Clinical: OPD walk-in flow, IPD admit/discharge, Lab lifecycle, Radiology, Pharmacy POS, OT/Surgery, Dialysis, Blood Bank.
- Ops: HR/Payroll, Inventory/Warehouse, Procurement, Assets.

I'll also run the Supabase linter and review the live `journal_entries` / `invoices` / `payments` / `billing_sessions` tables for trigger coverage gaps.

## Sections of the audit doc

1. Executive summary — top 10 fixes ranked by ROI.
2. Cross-cutting issues (apply to many modules):
   - Patient balance vs deposit display consistency
   - Split-payment UX
   - Mobile responsiveness of billing/IPD/POS
   - Empty-state and error toasts
   - Search / global command palette
   - Notifications & in-app inbox
   - Audit log surfacing in admin UI
3. Module-by-module deep dive (template above):
   - Accounting & GL (CoA, journals, vouchers, daily closing, fiscal year)
   - Billing & Revenue (invoices, payments, deposits, sessions, credit notes, refunds)
   - Insurance & Claims (NPHIES, eligibility, scrubbing, ERA reconciliation)
   - OPD
   - IPD
   - Lab
   - Radiology
   - Pharmacy & POS
   - OT / Surgery
   - Dialysis
   - Blood Bank
   - Dental
   - HR & Payroll
   - Inventory / Warehouse / Procurement
   - Fixed Assets
   - Patient Portal & Mobile
4. Reporting & Analytics — gaps (budget variance, departmental P&L, doctor productivity, AR aging by payer, IPD profitability, drug margin, etc.).
5. Integrations — what's missing (bank statement import, e-payment gateways, WhatsApp templates approval, HL7/FHIR inbound, BI export).
6. Compliance posture — ZATCA Phase 2, NPHIES, HIPAA, PDPL, GDPR — status & gaps.
7. Prioritized backlog — flat table with `id | area | item | severity | effort | ROI`.

## Deliverable

- `docs/SYSTEM_AUDIT_2026-06.md` (single file, ~3–5k lines worst case, organized so you can jump by heading).
- After you read it, you tell me which P0/P1 items to start on and I implement those in follow-up turns (UI/UX polish or feature builds — front-end only unless a fix requires a DB trigger or new table).

## Out of scope (this pass)

- No code changes, no migrations.
- No new tables, no new edge functions.
- No design directions / prototype renders — those come per-feature when we start implementing.
- Tri-lingual UI is the existing standard and will continue to apply to any future implementation tasks, but is not re-audited per-string in this pass.

## Open question I'll handle by assumption

You didn't fill in the "what specifically went wrong" box, so I'll treat the accounting/billing setback as **general** and audit broadly. If you want me to weight the report toward a specific pain (e.g. trial balance not tying, deposit double-counting, session not closing, cashier UX), drop one line of context and I'll bias the analysis.
