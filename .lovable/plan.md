
# ROI Projection PDF v3 — 24-Month Plan Correction

## Why
You're right — the raise (SAR 2.25M) was scoped for **24 months** of runway, but v2 only showed a **12-month** roadmap. That under-sells the plan and makes the OPEX math look inconsistent with the timeline. v3 fixes this end-to-end.

## Scope of changes (PDF only — no app/code changes)

### 1. Replace 12-month roadmap with 24-month roadmap (2 pages → 3 pages)
Restructured into **4 phases across 24 months**, each with workstream, owner, deliverable, and budget line.

```text
Phase 1 — Compliance Foundation        Months  1–6
  • ZATCA Phase 2 invoicing finalization + conformance testing
  • NPHIES claim cycle hardening + payer certification
  • Saudi PDPL data-residency review
  • HIPAA gap analysis (external auditor)

Phase 2 — HIPAA + Security Remediation Months  4–10
  • Audit logging, encryption at rest/in transit, key management
  • BAA workflow, breach-notification runbook
  • Penetration test + re-audit, SOC2 readiness prep

Phase 3 — Product Hardening + Pilots   Months  7–15
  • PDF/report engine rebuild, performance + load testing
  • 3 lighthouse hospital pilots (Riyadh / Jeddah / Dammam)
  • Arabic/RTL QA pass across all modules
  • Mobile companion app (clinician + patient)

Phase 4 — Commercial Scale-Up          Months 13–24
  • KSA sales team (4 AEs + 2 SEs), partner channel
  • Marketing: events, content, paid, MoH relations
  • Customer success org for 100+ accounts
  • Expansion: UAE + Pakistan readiness assessment
```

### 2. New visuals
- **24-month Gantt timeline chart** (4 phase bars across 24 columns) replacing the 12-month version.
- **Budget allocation table** updated to span 24 months and re-sum to SAR 2.25M (Team ~SAR 1.32M, Server/GPU ~SAR 480K, Compliance one-time ~SAR 220K, Marketing/Sales ~SAR 180K, Buffer ~SAR 50K — exact numbers tuned to total).
- **Milestone strip**: month-by-month key deliverables (Cert achieved, 1st pilot live, BAA signed, 50 customers, etc.).

### 3. Financial model alignment
- Customer ramp, MRR, ARR, P&L charts re-baselined so **Month 24 = end of funded period**, with break-even and capital-recovery markers re-verified against the 24-month OPEX curve.
- Cumulative cash chart extended/relabeled so the runway line clearly hits zero only *after* break-even — proving the raise is sufficient.
- Investor returns table re-run on the 24-month exit ARR (not 12-month), MOIC range updated.

### 4. Copy + page numbering
- Cover, exec summary, and closing slides updated to say "24-month plan" everywhere (v2 had a mix of "12 months" and "2 years" — unifying on **24 months / 2 years**).
- TOC and page numbers regenerated.

### 5. Same v2 layout quality bar
- Single Platypus pipeline, A4 landscape, 18mm margins, DejaVu Sans, centralized tokens.
- Visual QA loop: `pdftoppm -jpeg -r 150` → view every page → fix overlap/clipping/orphans → re-render until clean.

## Deliverable
`HealthOS24_ROI_Projection_v3.pdf` (~16–17 pages). v2 file kept for reference.

## Out of scope
- No changes to `src/`, no in-app slide edits, no Arabic/Urdu PDF variants (English investor PDF only — say the word if you want AR/UR versions too).

## One quick confirm before I build
Budget split for the 24 months — keep the v2 weights (team-heavy, modest marketing) or shift more to **Marketing/Sales in months 13–24** now that we have a real commercial phase? Default if you don't reply: keep v2 weights but add a dedicated SAR 180K sales+marketing line for Phase 4.
