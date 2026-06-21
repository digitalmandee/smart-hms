## ROI Projection PDF — HealthOS24 Investor Document

Standalone PDF artifact (not slides in the app). Will be written to `/mnt/documents/HealthOS24_ROI_Projection.pdf` and delivered via `<presentation-artifact>`.

### Inputs (confirmed)
- **Raise:** 2.0M – 2.25M SAR (24-month runway)
- **Pricing (SAR/month):** Clinic 2,500 | Polyclinic 6,000 | Hospital 25,000
- **Customer ramp (base case, cumulative end-of-year):**
  - Y1: 40 clinics, 8 polyclinics, 5 hospitals
  - Y2: 150 clinics, 25 polyclinics, 15 hospitals
  - Y3: 400 clinics, 60 polyclinics, 40 hospitals
- **OPEX (monthly recurring):** Team 55k + Server/GPU 40k + Marketing 20k + G&A 10k ≈ 125k SAR/mo (~1.5M/yr)
- **One-time (from raise):** HIPAA/NPHIES compliance & audits 300k + Initial marketing push 250k + Product/integrations 200k + Working capital buffer ~500k

### PDF Structure (10–11 pages, A4 landscape)
1. **Cover** — HealthOS24, "ROI Projection & Path to Profitability", 2026–2028, dark navy hero
2. **Executive Summary** — raise ask, break-even month, 3-yr ARR, IRR snapshot (KPI tiles)
3. **Use of Funds (2.25M SAR)** — donut chart + table (Compliance, Infra reserve, Team runway, Marketing, Product, Buffer)
4. **Monthly OPEX Breakdown** — stacked bar / pie (Team, Server+GPU, Marketing, G&A)
5. **Pricing & Unit Economics** — per-segment ARPU, gross margin assumption (~75%), CAC payback table
6. **Customer Acquisition Ramp** — stacked area chart, monthly cumulative customers by segment over 36 months (linear interpolation between yearly targets)
7. **Revenue Projection (MRR/ARR)** — line chart MRR month-by-month + ARR table per year
8. **Cumulative Cash Flow & Break-even** — line chart of cumulative cash position; mark break-even month (~M14–M18) and cash-flow positive milestone
9. **3-Year P&L Summary** — table: Revenue, COGS, Gross Profit, OPEX, EBITDA per year
10. **ROI for Investor** — investment recovery timeline, multiple on invested capital at Y3, valuation scenarios (5x/8x ARR)
11. **Risks & Mitigation + Closing** — short bullets, contact

### Charts (matplotlib)
- Donut: Use of funds
- Pie: Monthly OPEX
- Stacked area: Customer ramp
- Line: MRR/ARR trajectory
- Line + shaded: Cumulative cash flow with break-even marker
- Bar: 3-year revenue vs. OPEX vs. EBITDA

### Tech approach
- Python: `reportlab` (Platypus) for layout + `matplotlib` for charts (saved as PNG, embedded)
- Brand palette: deep navy `#0F1F3D`, accent teal `#14B8A6`, neutral grays — matches HealthOS24 deck
- Fonts: Helvetica family (reportlab built-in, reliable)
- After generation: convert each page to JPG with `pdftoppm`, visually inspect every page for overflow/overlap, iterate until clean
- All numbers in SAR with thousands separators

### Out of scope
- No app code changes, no slides added to the executive presentation in-app
- English only (can add AR/UR versions in a follow-up if needed)
- Not editable in-browser — static PDF deliverable

### Deliverable
`<presentation-artifact path="HealthOS24_ROI_Projection.pdf" mime_type="application/pdf"></presentation-artifact>`
