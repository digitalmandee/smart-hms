## Goal
Regenerate the ROI PDF as **v10** so it clearly shows the year the business turns profitable, with a more conservative cost ramp from Year 3 onward.

## Changes vs v9

### 1. P&L table: extend to 5 years
Replace the 3-column P&L with a 5-column table (Y1–Y5). Same line items (Recurring, Implementation, Total revenue, COGS, Gross profit, Engineering, Compliance & security, Sales & marketing, G&A, Infra/cloud, Total OPEX, **EBITDA**, plus a new **EBITDA margin %** row).

Highlight in teal the first year EBITDA turns positive so the "profitability year" is visually obvious.

### 2. Realistic, slow cost ramp (post-Y2)
Replace the current step-up schedule with a gentler one. New monthly OPEX bands (SAR):

| Phase | Months | Engineering | Sales & marketing | Compliance | G&A | Infra |
|---|---|---|---|---|---|---|
| Pre-launch build | M1–M12 | 70K | 5K | 18K | 10K | 6K |
| Pilot | M13–M18 | 80K | 10K | 18K | 10K | 6.5K |
| Launch | M19–M24 | 90K | 18K | 12K | 12K | 7K |
| Y3 scale | M25–M36 | 100K | 28K | 8K | 14K | 10K |
| Y4 scale | M37–M48 | 110K | 38K | 7K | 16K | 13K |
| Y5 scale | M49–M60 | 120K | 50K | 7K | 18K | 16K |
| Steady | M61–M72 | 125K | 60K | 7K | 20K | 18K |

Rationale: engineering grows ~10K/year/FTE-equivalent (one senior hire/year, not a doubling). S&M scales with active accounts, not ahead of them — staying well below revenue growth so EBITDA crosses zero around Y4–Y5.

### 3. Customer ramp (unchanged anchors)
Y3=21, Y4=41, Y5=62 total active. Same monthly series feeds revenue and cash.

### 4. Cash trajectory
Chart and milestones table already span 72 months — they auto-update from the new OPEX schedule. Expect peak cash need to shrink (lighter S&M) and cash-positive month to land in the M55–M62 range.

### 5. Cover page KPI strip (small addition)
Add a single inline sentence under "Operating thesis" (no cards):
*"EBITDA turns positive in Year X; cumulative cash positive by Month Y."*
Values pulled from the model so they stay in sync.

## Out of scope
- No new pages, no investor/valuation content, no cards on the cover.
- Charts and other tables keep the v9 styling.

## Deliverable
`HealthOS24_ROI_Projection_v10.pdf` in `/mnt/documents/`, QA'd page-by-page.
