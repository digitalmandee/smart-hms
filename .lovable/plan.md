## Full audit: is this a complete investor pitch deck?

Checked all 31 slides against the standard investor-deck checklist (Sequoia / YC / a16z). Below is what's covered, what's missing, and what's in the wrong place.

---

## Current order (31 slides)

```
1  Title              16 Mobile Apps
2  Problem            17 Automation
3  Why Now            18 Workflow
4  All-in-One         19 Finance Ops
5  Modules            20 Tech
6  Tabeebi            21 Market
7  Customer Story     22 Competition
8  Clinical           23 Differentiators
9  Diagnostics        24 Traction
10 AI Everywhere      25 Revenue
11 Insurance          26 ROI
12 KSA Compliance     27 Financials
13 KSA Industry Gap   28 Team
14 KSA Roadmap        29 Ask
15 Clinic on Wheels   30 Vision
                     31 CTA
```

---

## Checklist: what investors expect vs what we have

| # | Standard slide | Have it? | Notes |
|---|---|---|---|
| 1 | Title + one-liner | ✅ | Slide 1 |
| 2 | Problem | ✅ | Slide 2 |
| 3 | Why Now | ✅ | Slide 3 |
| 4 | Solution | ✅ | Slide 4 (All-in-One) |
| 5 | Product / How it works | ✅✅✅ | Slides 5, 6, 8-11, 15-20 — **too many** (12 slides) |
| 6 | Customer Story | ⚠️ | Slide 7, only one anonymized clinic; no logos |
| 7 | Market size (TAM/SAM/SOM) | ✅ | Slide 21 |
| 8 | Competition | ✅ | Slide 22 |
| 9 | Moat / Differentiators | ✅ | Slide 23 |
| 10 | Traction | ✅ | Slide 24 |
| 11 | Business model / Revenue | ✅ | Slide 25 |
| 12 | Unit economics (CAC, LTV, payback, gross margin) | ❌ | **Missing** — ROI ≠ unit economics |
| 13 | **Go-to-market strategy** | ❌ | **Missing entirely** — how do we acquire customers? Sales motion? Pilot pipeline? |
| 14 | Financials / 5yr projections | ✅ | Slide 27 |
| 15 | Team | ✅ | Slide 28 |
| 16 | Advisors / Board | ❌ | Missing (could fold into Team) |
| 17 | **Roadmap / 12-18mo milestones** | ⚠️ | Only KSA-regulatory roadmap (slide 14). No product/business roadmap |
| 18 | Ask | ✅ | Slide 29 |
| 19 | **Use of funds breakdown** | ❌ | Missing — pie chart showing eng % / sales % / KSA entry % |
| 20 | **Risks & Mitigations** | ❌ | Missing — investors expect self-awareness |
| 21 | Vision | ✅ | Slide 30 (but wrongly placed after Ask) |
| 22 | CTA / Contact | ✅ | Slide 31 |

**Bonus / nice-to-have:**
| | Social proof strip (pilot logos, MoH, NPHIES, Vision 2030) | ❌ | Missing in first 10 slides |
| | Defensibility / IP (Arabic LLM training data, integrations moat) | ⚠️ | Partial via Tabeebi + Differentiators |
| | Exit thesis / comparables (Cerner, Epic, Phreesia M&As) | ❌ | Missing |

---

## Critical gaps (must fix for a "complete" pitch)

### 1. **Go-to-Market** — the single biggest hole
A SaaS investor's first question after seeing product+market is "how will you reach customers?" We answer zero questions about:
- Sales motion (direct? channel partners? MoH framework?)
- Top-of-funnel (which 50 KSA facilities are in pipeline? which closed?)
- Pricing entry point (free pilot? 90-day POC? full annual contract?)
- Geographic rollout sequence (Riyadh → Jeddah → Eastern Province → Pakistan → MENA)
- Partnership leverage (SCFHS, MoH, NPHIES, insurance TPAs)

### 2. **Unit Economics**
Currently we show ROI for the customer. Investors need OUR economics:
- Avg contract value (ACV) per facility size tier
- Customer Acquisition Cost (CAC) target
- Gross margin per facility (after hosting, support, integrations)
- LTV / CAC ratio target
- Payback period in months

### 3. **Use of Funds**
Ask slide says "SAR 750K lead check" but doesn't show where it goes. Standard breakdown:
- Engineering (e.g. 45%)
- KSA sales & GTM (30%)
- Compliance & certifications (15%)
- Ops & runway (10%)
- Months of runway it buys

### 4. **Risks & Mitigations**
Top 3 risks investors will ask:
- KSA regulatory delays (NPHIES/SCFHS certification timelines)
- Long enterprise sales cycles
- Incumbent competition (Cerner, ClinicAll, InterSystems) discounting against us
Each with a 1-line mitigation.

### 5. **Product / Business Roadmap**
A 12-18 month roadmap with concrete shipped milestones: NPHIES phase 2 cert by Q3, 10 facilities live by Q4, MENA expansion Q2 2027.

---

## Structural issues (flow & emphasis)

### 1. **15 consecutive product slides is too many**
Slides 4-20 are essentially "look at all the things we built". Investors lose patience around slide 12. Recommend collapsing into an "Appendix" section after the Ask, or cutting 5-6 slides:
- Candidates to merge/cut from main flow: Workflow (18), Automation (17), Finance Ops (19) → fold into Modules
- Diagnostics (9) + Insurance (11) → can move to appendix
- Clinic on Wheels (15) → niche, move to appendix unless it's a wedge

### 2. **Vision should come BEFORE the Ask, not after**
You set the dream, *then* ask for money. Current order: Ask → Vision → CTA is backwards. Should be: Vision → Ask → CTA.

### 3. **KSA story is over-split (3 slides)**
Slides 12, 13, 14 are all KSA. We already merged Compliance + Roadmap once. Still feels heavy. Recommend: KSA Industry Gap (13) moves *before* Market slide as a lead-in. Compliance (12) + Roadmap (14) stay merged as one "Saudi-Ready" credibility slide.

### 4. **No social proof in first 10 slides**
Pilot facility logos, MoH/NPHIES badges, Vision 2030 alignment, partner names — none appear early. Add a thin strip on slide 1 or after the Problem slide.

---

## Recommended new structure (still 31 slides, or trim to 24)

**Option A — Add the 5 missing slides, trim 5 product slides (stays at 31):**

```
1  Title (+ social proof strip)
2  Problem
3  Why Now
4  Solution (All-in-One)
5  Tabeebi (AI moat, brought up)
6  Customer Story
7  Modules (one denser overview)
8  Clinical depth
9  AI Everywhere
10 Mobile Apps
11 Tech
12 KSA Industry Gap
13 Saudi-Ready (Compliance + Roadmap merged)
14 Market (TAM/SAM/SOM)
15 Competition
16 Differentiators (Moat)
17 Traction
18 Customer ROI
19 Revenue Model
20 Unit Economics                  ← NEW
21 Financials (5yr projections)
22 Go-to-Market                    ← NEW
23 Product Roadmap (12-18mo)       ← NEW
24 Team + Advisors
25 Risks & Mitigations             ← NEW
26 Vision
27 Ask + Use of Funds              ← Use of Funds added here
28 CTA / Contact
+ Appendix: Diagnostics, Insurance, Workflow, Automation, Finance Ops, Clinic on Wheels (6 slides)
```

**Option B — Lean 18-slide investor deck + 13-slide appendix.** Same as the prior "story-fix" plan I proposed earlier but with the 4 new slides folded in. Cleanest for first meetings.

---

## Files that would be added (on approval)

- `src/components/executive/ExecGoToMarketSlide.tsx` — sales motion, pipeline, pricing entry, geo sequence
- `src/components/executive/ExecUnitEconomicsSlide.tsx` — ACV, CAC, gross margin, LTV/CAC, payback
- `src/components/executive/ExecUseOfFundsSlide.tsx` — pie chart + runway months (OR fold into Ask slide)
- `src/components/executive/ExecRisksSlide.tsx` — 3 risks × 3 mitigations
- `src/components/executive/ExecRoadmapSlide.tsx` — 12-18 month product/business milestones
- `src/pages/ExecutivePresentation.tsx` — re-order, update TOTAL_SLIDES, renumber counters across all files

## Out of scope

- No content changes to existing slides except renumbering
- No new images (will reuse cards/icons pattern from existing slides)
- No backend/data work

---

## Questions before I build

1. **Which option?**
   - **A:** Add 5 missing slides + light trim (stay near 31 slides, all content kept)
   - **B:** Lean 18-slide main deck + 13-slide appendix (sharpest for investors, biggest change)
   - **C:** Just add the 5 missing slides, no trim and no reordering (smallest change)

2. **Do you have real numbers for the new slides?**
   - **Unit economics:** target ACV per facility, CAC target, gross margin %, payback months?
   - **Use of funds:** how should SAR 750K split across eng / sales / compliance / ops?
   - **Go-to-market:** any named pipeline facilities? MoH/SCFHS/NPHIES contact status?
   - **Roadmap:** which 4-5 milestones do you want listed for the next 12-18 months?
   - **Risks:** any specific risks you want called out (or should I draft 3 typical ones)?

   If you don't have numbers, I'll insert sensible placeholders and tag them clearly with `// FILL` comments so you can edit before sending.

3. **Vision placement:** confirm move Vision to *before* the Ask (recommended), or keep current order?
