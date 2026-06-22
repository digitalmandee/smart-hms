# ROI Projection PDF v5 — Compact Investor Deck (5–6 pages)

## Changes from v4
- Drop product/clinical detail pages (no module deep dives)
- Tighten to 5–6 high-impact pages
- Fix layout issues: no stretched charts, no `&amp;` in titles, no overflowing tables
- Add KSA market research with citations to justify the ramp
- Keep v4 numbers: commercial start M19, break-even M28, recovery M41, no equity %

## Page plan (6 pages)

1. **Cover + Executive Summary** — HealthOS24, SAR 2.25M raise, 4 KPI cards (raise, runway, break-even M28, Y3 ARR), 3-sentence thesis
2. **KSA Market & Regulatory Tailwind** — researched figures with sources (MOH hospital counts, Vision 2030 privatization target, digital-health CAGR) + ZATCA Phase 2 / NPHIES / Wasfaty / PDPL as forced-buy drivers
3. **24-Month Roadmap + Use of Funds** — clean Gantt (compliance M1–18, pilots M15–18, commercial M19+) + donut/table allocation of SAR 2.25M
4. **Revenue Model + Customer Ramp** — pricing tiers (clinic / polyclinic / hospital), M19–M36 ramp chart with clean legend
5. **3-Year P&L + Cash Flow (42M)** — fixed P&L chart, annotated cash curve showing trough → break-even M28 → recovery M41
6. **Valuation Reference + Closing** — Y3 ARR × multiples table (4×/6×/8×/10×, no equity %), risks/mitigations row, contact

## Design system
- Type: DejaVu Sans / Bold, cover 42pt, page title 22pt, body 10.5pt
- Palette: navy `#0B2545`, teal `#1F8E8D`, sand `#E8DDCB`, success `#1F8E5A`, alert `#C0392B`
- Header (HealthOS24 · ROI Projection v5) + footer (page n/6 · Confidential)
- Charts capped 150mm × 75mm at 150 DPI, sans-serif, plain string titles
- Tables: zebra rows, navy header, Paragraph-wrapped cells, content-sized columns
- KPI cards as rounded rects in a 4-up grid

## Technical implementation
- New script `/tmp/roi5/make_pdf.py` using `reportlab` Platypus + `matplotlib`
- Web research step for KSA figures with inline citations
- `KeepTogether` for chart + table groups; matplotlib figsize matches embed size to prevent stretching
- Output: `/mnt/documents/HealthOS24_ROI_Projection_v5.pdf`

## QA before delivery
- Render every page to JPEG at 150 DPI, inspect each
- Verify: no stretched charts, no `&amp;`, no table overflow, consistent margins, page numbers correct, citations present
