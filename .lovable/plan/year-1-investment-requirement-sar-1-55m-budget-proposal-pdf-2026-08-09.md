# Year-1 Investment Requirement — SAR 1.55M Budget Proposal (PDF)

A standalone investor/management PDF covering the immediate Year-1 funding requirement: compliance certification, KSA regulatory integrations, AI/Tabeebi infrastructure, and the engineering team. Delivered as `HealthOS24_Year1_Budget_v1.pdf` in the documents area, styled to match the existing ROI Projection deck (teal accent titles, fixed-aspect charts, no stretched layouts).

## Headline numbers

- **Total Year-1 requirement: SAR 1.55M** (range presented as 1.4M lean – 1.7M full, base case 1.55M)
- **Engineering: ~50% (SAR 775K)** — 6-person team, staggered hiring
- Remaining ~50% split across compliance, KSA integrations, AI/GPU, and operations

## Cost blocks

| Block | Approx. | What it covers |
|---|---|---|
| Engineering team (50%) | 775K | 6 engineers, staggered start |
| HIPAA audit + certification | 130K | Gap assessment, remediation, third-party audit, BAA framework, penetration test |
| KSA compliance & integrations | 260K | NPHIES (FHIR eligibility → preauth → claim → payment), ZATCA Phase 2 (cryptographic stamp, chaining, clearance), Wasfaty, Tatmeen/RSD, Nafath, Sehhaty/HESN — certification fees + integration build + sandbox/UAT cycles |
| AI / Tabeebi + GPU | 230K | GPU server (purchase or reserved cloud), model quality work, ASR/TTS for Arabic + Urdu, evaluation harness, guardrails/safety review |
| Infrastructure & self-host | 85K | Servers, backup/DR, monitoring, staging environments, security tooling |
| Legal, licensing & contingency | 70K | Entity/licensing, contracts, SFDA/MOH paperwork, 5% contingency |

### Engineering mix (50% of budget)
Backend/integrations (2), Frontend (1), AI/ML (1), QA/Compliance (1), DevOps/Infra (0.5 → 1) — staggered so payroll ramps rather than starting at full burn.

## Monthly view

- **Month-by-month table (M1–M12)** for every cost block, with monthly total and cumulative spend column.
- **Ramp logic:** M1–M3 hiring + HIPAA gap assessment + GPU procurement; M4–M9 peak (integration build + audits running in parallel); M10–M12 certification close-out, UAT, pilot readiness.
- **Stacked monthly spend chart** showing the burn shape and where cumulative crosses 1.55M.
- **Quarterly milestone strip:** Q1 team + infra in place; Q2 HIPAA audit ready, NPHIES/ZATCA sandbox live; Q3 certifications submitted, Tabeebi v2 quality gates; Q4 all compliance green, pilot-deployable.

## Page plan (6 pages)

1. Cover + immediate requirement summary (SAR 1.55M, 12 months, what it buys)
2. Why now — compliance-first sequencing (revenue can't start before certifications)
3. Cost blocks breakdown + allocation donut/bar
4. Monthly spend table M1–M12 with cumulative
5. Monthly stacked spend chart + quarterly milestones
6. Scenario comparison (1.4M / 1.55M / 1.7M) + what each level buys, risks of underfunding

## Technical notes

- Python + matplotlib/reportlab, same generation approach as the earlier ROI PDFs; fixed figure aspect ratios so nothing stretches.
- Single assumptions dict drives tables and charts so totals reconcile exactly to 1.55M.
- All page images rendered and visually inspected before delivery (clipping, overflow, table alignment).
- No revenue or ROI claims in this document — it is a spend/requirement proposal only. Numbers are estimate placeholders based on the assumptions above; any that must be exact (real vendor quotes, GPU pricing, audit fees) will be flagged for you to replace.
