# ROI Projection PDF v5 — Investor-Grade Redesign

## Problems with v4
- Charts render stretched / oversized vs. surrounding type — page rhythm feels off
- Chart titles show raw HTML (`P&amp;L` instead of `P&L`)
- Tables span full page width with thin rows; columns float far from labels
- Light on clinical depth (modules, workflows) and missing real Saudi market research to justify the ramp
- Page-to-page visual hierarchy is flat (everything looks like the same slide)

## Goals for v5
1. **Tighter, designed layout** — magazine-style pages, not stretched dashboards
2. **More substance** — clinical modules, hospital workflows, Saudi growth data with citations
3. **No regressions** — keep v4 numbers (commercial start M19, break-even M28, recovery M41, no equity %)

## Page plan (≈ 22 pages)

1. **Cover** — HealthOS24, ROI Projection v5, SAR 2.25M raise, confidential
2. **Executive Summary** — 4 KPI cards (raise, runway, break-even, Y3 ARR) + 3-sentence thesis
3. **The Problem** — KSA HIS fragmentation, Vision 2030 privatization, ZATCA/NPHIES/Wasfaty mandates creating forced replacement cycle
4. **Market Opportunity (KSA)** — researched figures with sources:
   - KSA healthcare spend, # hospitals (MOH + private), # polyclinics, # pharmacies
   - Vision 2030 privatization target (290 hospitals → private operators by 2030)
   - Digital health CAGR, HIS/EMR addressable spend
   - Sources cited inline (MOH Statistical Yearbook, Vision 2030, Mordor/Statista where applicable)
5. **Regulatory Tailwind** — ZATCA Phase 2, NPHIES, Wasfaty, PDPL, Nafath, Tatmeen — each as a card with what it forces hospitals to buy
6. **Product Overview** — single page, module matrix (24 modules grouped: Clinical / Pharmacy / Finance / HR / Compliance / Patient)
7. **Clinical Depth — OPD & IPD** — workflows, token queue, IPD admission, ward management, discharge billing
8. **Clinical Depth — Lab, Radiology, Surgery** — order lifecycle, specimen workflow, OT scheduling, consumable deduction
9. **Clinical Depth — Pharmacy, Blood Bank, Dialysis, Dental** — module-specific capabilities
10. **Finance & ERP** — 4-level COA, auto-posting triggers, daily closing, ZATCA-compliant invoices, multi-branch consolidation
11. **HR & Payroll** — Saudi labor law gratuity, two-pass payroll engine, exit/clearance automation
12. **Compliance Scorecard** — table: requirement → status (done / in progress / planned with month)
13. **Competitive Landscape** — HealthOS24 vs. Cerner/Epic/local players on: KSA compliance out-of-box, price, deploy time, Arabic-first
14. **24-Month Roadmap (Gantt)** — redrawn with cleaner spacing
15. **Use of Funds** — donut chart + table (team / infra / compliance / sales-mktg / buffer)
16. **Revenue Model** — pricing tiers (clinic / polyclinic / hospital), setup + monthly SaaS + per-bed/per-user
17. **Customer Ramp** — M19–M36 by segment, redrawn legend
18. **3-Year P&L** — fixed chart title (`P&L`), tighter chart, narrower table aligned under chart
19. **Cash Flow 42M** — trough, break-even M28, recovery M41 — annotated
20. **Valuation Reference** — Y3 ARR × multiples (4×/6×/8×/10×), no equity %, comparables note
21. **Risks & Mitigations** — table
22. **Closing / Contact**

## Design system
- **Type scale**: cover 48pt, page title 22pt, section 14pt, body 10.5pt, caption 8.5pt (DejaVu Sans + DejaVu Sans Bold)
- **Palette**: navy `#0B2545`, teal `#1F8E8D`, sand `#E8DDCB`, ink `#1A1A1A`, muted `#6B7280`, success `#1F8E5A`, alert `#C0392B`
- **Page frame**: 18mm side margins, persistent header (HealthOS24 · ROI Projection v5) + footer (page n/N · Confidential)
- **Charts**: rendered at fixed 150 DPI, capped to 150mm × 75mm, sans-serif, no HTML entities in titles
- **Tables**: zebra rows, navy header, `Paragraph`-wrapped cells, column widths sized to content not page
- **Cards/KPIs**: rounded rects via reportlab `Drawing`, 2-up or 4-up grids on summary pages

## Technical implementation
- New script `/tmp/roi5/make_pdf.py` using `reportlab` Platypus + `matplotlib`
- Fix `P&amp;L` by using plain string titles in matplotlib (no XML escaping pre-applied)
- Force matplotlib `figsize` aspect ratios that match final placement (no scaling stretch)
- All chart text rendered at the same DPI as final embed to prevent blurring
- `KeepTogether` flowables for chart + caption + table groups
- Web research step: pull current MOH hospital counts, Vision 2030 privatization numbers, KSA digital-health market size from public sources; cite inline

## Out of scope
- No app/code changes
- English only (existing artifact convention)
- Output: `/mnt/documents/HealthOS24_ROI_Projection_v5.pdf`

## QA checklist before delivery
- Render every page to JPEG at 150 DPI, view each one
- Verify: no stretched charts, no `&amp;`, no overflowing tables, no orphaned headings, consistent margins, page numbers correct, all citations present on the market page
