# Draft remaining 6 skills

Create the rest of the project skill library based on memory areas not yet covered. Each skill follows the established pattern: `.agents/skills/<name>/SKILL.md` with YAML frontmatter (name + description for retrieval), concise rules, code snippets where they prevent mistakes, and cross-links to existing skills.

## Skills to author

1. **hr-payroll-ksa** — Saudi labor law gratuity (ESB) auto-calc, two-pass payroll engine (basic→gross→gross-based), multi-stage payroll approval (no `updated_at` on `payroll_runs`), salary revision pattern (new row + `is_current=false`), exit/resignation auto-clearance via `employee_clearance`, HR `tax_slabs` vs invoice `billing_tax_slabs` distinction.

2. **pharmacy-operations** — Dedicated `pharmacy_pos_sessions` open/close workflow, atomic GRN upsert via unique branch/medicine/store index, dispensing & returns bulk lookup pattern for missing selling_price/inventory_id, `fetchAllRows` recursive helper for reporting >1000 rows, Wasfaty cross-link.

3. **procurement-inventory** — PR → PO → GRN linkage via `requisition_id`, GRN verification auto-transitions requisition status to `issued`, auto-delete PO if all items fail verification, atomic verification RPC with unique-index idempotency, GL auto-post (DR INV-001 / CR AP-001), warehouse module isolation (standalone WMS, hierarchical menu, blocks clinical paths).

4. **security-hipaa** — Edge function allowlist pattern, patients RLS via security-definer, DOMPurify for any HTML rendering, storage bucket RLS, PHI masking in lists, session timeouts, kiosk/QR anon-callable SECURITY DEFINER grants are intentional (don't flag), never store secrets in DB.

5. **insurance-claims** — Coverage vs copay calc, post-invoice claim prompt flow, mandatory IPD insurance verification before bed allocation, Insurance as standalone top-level `/app/insurance/*` (not nested under billing), NPHIES FHIR workflow + `medical_codes` lookup + claim scrubbing, Saudi ID validation. Cross-link `ksa-compliance`.

6. **billing-revenue-ops** — Invoice auto-loads pending unbilled lab/imaging/appointments, invoice totals breakdown formula (Total Settled = Deposit Applied + Previous Cash + Current Payment), split payment as individual DB rows, deposit lifecycle (LIA-DEP-001 → AR-001), daily closing blocked by open billing_sessions, doctor earnings auto via `trg_unified_doctor_earnings`, dynamic revenue routing by service prefix (cross-link `finance-gl-posting`), session audit rule (IPD deposits must link `billing_session_id`).

## Activation

After writing each draft directory, call `skills--apply_draft` on each path so they go live and are retrieval-matched.

## Out of scope

- No code changes outside `.agents/skills/`
- No DB migrations
- No UI changes
- Existing 6 live skills untouched
