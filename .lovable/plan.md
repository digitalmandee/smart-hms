## ROI PDF v2 — Add 12-Month Roadmap + Fix Layout

Regenerate `HealthOS24_ROI_Projection.pdf` as `HealthOS24_ROI_Projection_v2.pdf` with a new roadmap section and a complete layout overhaul to fix the merging text, broken tables, and cramped pages reported in v1.

### 1. New content: "Use of Funds — 12-Month Execution Roadmap"

Add a dedicated section (2 pages) describing what the SAR 2.0–2.25M funding delivers in the next 12 months. Priorities in order:

**Priority 1 — Saudi (NPHIES) Compliance — Months 1–5**
- Complete and harden the invoicing module (ZATCA Phase 2 UBL 2.1 XML, SHA-256 hash chaining, TLV QR, cryptographic stamp).
- Test and finalize all existing Saudi compliance features already shipped (Nafath, Wasfaty, Tatmeen/RSD, Saudi ID validation, Hijri calendar, NPHIES eligibility → preauth → claim → payment).
- Third-party ZATCA + NPHIES conformance testing and certification.

**Priority 2 — HIPAA Compliance — Months 3–8**
- External HIPAA security assessment (gap analysis by accredited assessor).
- Remediation: audit logging, encryption at rest review, access controls, BAA workflows, breach-notification procedures.
- Re-audit and certification letter.

**Priority 3 — Product hardening — Months 4–9**
- PDF/report engine rebuild (clean templates, consistent typography, proper tables).
- Performance, load testing, observability.

**Priority 4 — Go-to-market — Months 6–12**
- KSA sales team (2 AEs + 1 SE), 3 lighthouse hospital deployments, marketing in Riyadh/Jeddah, partner channel with PHC groups.

Include a Gantt-style timeline chart (horizontal bars per workstream over 12 months) and a budget allocation table tying each workstream to a SAR figure that sums to the raise.

### 2. PDF layout overhaul (fixes v1 issues)

Root cause of v1 problems: mixed Canvas + Platypus, ad-hoc spacing, tables sized in points without column widths, charts rendered at wrong DPI/aspect for the frame.

Rebuild on a single Platypus pipeline with a strict grid:

- **Page**: A4 landscape, margins 18mm all sides, header band 14mm, footer band 10mm.
- **Master template**: `BaseDocTemplate` with one `PageTemplate` per layout (cover, section-divider, content, chart+table, full-bleed-chart). Page numbers + section name in footer, brand bar in header.
- **Type scale** (locked): Display 32 / H1 24 / H2 18 / H3 14 / Body 10.5 / Caption 8.5. Line-height 1.35. Single font family (DejaVu Sans, bundled — supports full Latin so no missing-glyph boxes).
- **Color tokens**: navy `#0F1F3D`, teal `#14B8A6`, ink `#1F2937`, muted `#6B7280`, surface `#F8FAFC`, divider `#E5E7EB`. Centralized as constants; no hex literals in slide code.
- **Tables**: every table declares explicit `colWidths` summing to frame width, `TableStyle` with zebra rows, 6pt cell padding, header row in navy/white, right-aligned numerics, thousands separators, `RepeatRows=1` so headers reprint on overflow. Wrap long text cells in `Paragraph` (not raw strings) so they wrap instead of overflowing.
- **Charts**: render matplotlib at exact frame width in inches × 200 DPI, `bbox_inches='tight'`, transparent background, embedded fonts. Each chart gets a numbered caption underneath. No chart shares a row with a table — one primary visual per page.
- **Spacing**: `Spacer` only in 6/12/18/24pt steps; no arbitrary values. `KeepTogether` around heading+first-paragraph and around table+caption to stop orphan splits.
- **Cover page**: full-bleed navy with teal accent bar, large product mark, single-line tagline, prepared-for / date footer.
- **Section dividers**: minimal pages between major sections (Funds → Financials → Roadmap → Risks → Returns) to reset visual rhythm.

### 3. Final structure (v2)

1. Cover
2. Executive Summary (numbers callouts only, no dense prose)
3. Use of Funds — allocation table + donut
4. **12-Month Roadmap — Gantt + workstream descriptions** (NEW, 2 pages)
5. Monthly OPEX breakdown
6. Pricing & Unit Economics
7. Customer Ramp (stacked area)
8. MRR / ARR trajectory
9. Cumulative cash flow & break-even
10. 3-Year P&L summary
11. Investor returns (MOIC scenarios)
12. Risks & mitigations
13. Closing / contact

### 4. QA loop (mandatory)

After generation: `pdftoppm -jpeg -r 150` → view every page → fix → re-render. Specifically check for: overlapping text, clipped table cells, chart axis labels cut off, orphan headings, missing-glyph boxes, page-number drift. Iterate until a clean pass.

### Deliverable

`/mnt/documents/HealthOS24_ROI_Projection_v2.pdf` — original v1 file preserved.

### Out of scope

- No app/code changes in `src/`.
- English only (deck content language matches v1; the trilingual product UI rule applies to in-app strings, not this static investor PDF).
- No changes to in-app investor presentation slides (`ExecutivePresentation.tsx`).
