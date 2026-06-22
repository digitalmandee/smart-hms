
# ROI PDF v4 — Realistic Ramp + Remove Equity %

## What changes

### 1. Push customer acquisition later (key fix)
Current v3 starts clinics at M6, which contradicts "12–18 months on compliance first, then marketing." New timing:

```text
M1–M18   Compliance + HIPAA + product hardening  (no commercial activity)
M15–M18  First 2 lighthouse pilots (paid, but not GTM)
M19      Marketing + sales engine starts
M19–M24  Initial commercial ramp (clinics first)
Y3       Polyclinic + hospital deals close, full ramp
```

Updated curve (base case):
- Clinics: 0 until M18, then 5/mo new logos → ~30 by M24
- Polyclinics: 0 until M22, then trickle → ~3 by M24
- Hospitals: pilots only in funded period; commercial hospital sales in Y3
- M24 MRR ≈ SAR 100–130K (vs v3's 892K)
- M24 ARR ≈ SAR 1.2–1.6M

### 2. Recalculate break-even + recovery honestly
With revenue arriving only in the last 6 months of the raise:
- **EBITDA break-even**: ~Month 28–30 (post-raise, into Year 3)
- **Capital recovery**: ~Month 36–42 (mid-to-late Year 3)
- Cumulative cash dips close to zero around M22–24 (raise nearly spent), then recovers from Year-3 revenue

I'll **extend the cash chart to 42 months** so investors can see the full path from raise → trough → break-even → recovery, with clear annotations.

### 3. Remove all "18% equity" references
- Drop the equity assumption from the Executive Summary, Investor Returns page, and Closing slide.
- Investor Returns page becomes a **valuation table only** — Year-3 ARR × multiple = implied company valuation. No proceeds column, no MOIC tied to a stake %.
- Closing slide says "SAR 2.25M raise" with no equity figure (terms to be discussed separately).

### 4. Honest framing in copy
- Executive Summary: "Compliance-first 24 months · commercial ramp begins Month 19 · break-even in Year 3"
- Roadmap: emphasise that Phase 4 (Commercial) is only M19–24, not M13–24
- Cash chart subtitle: "Raise funds full 24-month compliance + early commercial ramp; capital recovered from Year-3 revenue"

### 5. Other adjustments
- Year-1 revenue ≈ 0 (no customers in Y1)
- Year-2 revenue = only M19–24 commercial revenue (~SAR 500K)
- Year-3 revenue = full year of ramped commercial activity (~SAR 8–10M projected)
- 3-Year P&L table updated accordingly; Year-1 EBITDA strongly negative, Year-3 strongly positive

## Out of scope
No app/code changes. English investor PDF only. Same layout quality bar as v3 (single Platypus pipeline, KeepTogether for tables, visual QA loop).

## Deliverable
`HealthOS24_ROI_Projection_v4.pdf`. v3 kept for reference.

## Quick confirms before I build
1. **Commercial start month** — M19 (right after 18-month compliance phase ends) ✓ default. Say if you want M18 or M20.
2. **Investor Returns page** — keep it as a valuation-only table (Year-3 ARR × 4×/6×/8×/10× → implied valuation), or drop the page entirely? Default: keep as valuation-only.
3. **Cash chart horizon** — extend to **42 months** so capital-recovery point is visible. Default: yes.
