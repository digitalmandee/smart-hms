# Funding Requirement v5 — HIPAA split + expanded team

Revise the fixed report (`HealthOS24_Funding_Requirement_v5.pdf`) and the `/year1-budget` page to (a) split HIPAA into audit vs certification/licensing, and (b) model the larger 14-person team, while keeping the Year-1 tranche at SAR 1.55M and total at SAR 3.0M.

## 1. HIPAA becomes two separate lines

Replace the single "HIPAA audit + certification" block with:

| Line | Scope |
|---|---|
| HIPAA Audit | Gap assessment, remediation support, penetration test, third-party audit fieldwork |
| HIPAA Certification & Licensing | Certification body fees, license issuance, BAA framework, policy attestation, annual renewal setup |

Both appear as their own rows in the cost-block table, the donut chart, and every month of the M1–M12 monthly spend table (audit front-loaded M2–M7, certification M7–M12 after the audit closes).

## 2. Team composition (14 heads)

| Role | Count | Monthly rate used |
|---|---|---|
| Senior Developer | 2 | 30,000 |
| Developer | 6 | 22,000 |
| AI / ML Engineer | 2 | 32,000 |
| DevOps | 1 | 25,000 |
| QA | 2 | 15,000 |
| UI/UX Designer | 1 | 18,000 |
| **Total at full strength** | **14** | **329,000 / month** |

## 3. Hard-staggered hiring (to stay inside SAR 1.55M)

Full strength is only reached at Month 12; Year-1 payroll is a ramp, not 12 × 329K.

```text
M1-2   3 heads   2 dev + 1 AI/ML            ~74K/mo
M3-4   5 heads   +1 sr dev, +1 devops       ~129K/mo
M5-6   7 heads   +1 dev, +1 QA              ~166K/mo
M7-8   9 heads   +1 dev, +1 UI/UX           ~206K/mo
M9-10  11 heads  +1 sr dev, +1 AI/ML        ~268K/mo
M11-12 14 heads  +2 dev, +1 QA              ~329K/mo
```

Year-1 payroll under this ramp is roughly SAR 1.05M — about 68% of the 1.55M tranche. The remaining ~SAR 500K covers HIPAA audit, HIPAA certification/licensing, KSA integrations (NPHIES, ZATCA Phase 2, Wasfaty, Tatmeen, Nafath), GPU/AI infrastructure, infra, and legal/contingency. Non-payroll blocks are scaled down proportionally from the v4 figures, and the report states plainly which items were trimmed to fit.

## 4. Flag to call out in the report

At full strength the team costs SAR 3.95M/year. The current 24-month envelope (1.55M + 1.45M = 3.0M) cannot sustain 14 heads beyond Month 12 — Year 2 alone would need roughly SAR 3.95M payroll. The report will include an explicit "Year-2 funding gap" note with three options (raise the Year-2 tranche, cap the team at ~7–8 heads steady-state, or offset with pilot revenue) rather than silently presenting an unaffordable plan.

## 5. Deliverables

- `HealthOS24_Funding_Requirement_v5.pdf` — same 7-page structure as v4 (light cover kept), with: two HIPAA rows everywhere, new headcount ramp table + headcount-vs-burn chart, revised M1–M12 monthly table, revised donut/stacked-burn/cumulative charts, and the Year-2 gap note.
- `/year1-budget` page updated to match: split HIPAA cards, 14-role team table with start months, revised monthly chart data, in EN / UR / AR with RTL.

## Technical notes

- Regenerate with the existing Python + reportlab/matplotlib script; a single assumptions dict (roles, rates, start months, cost blocks) drives all tables and charts so totals reconcile exactly to 1.55M.
- Salary rates above are estimates — they will be labelled as assumptions in the report so you can replace them with actuals.
- All 7 pages rendered to images and visually inspected (clipping, overflow, alignment) before delivery.
