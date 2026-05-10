
# Pitch Deck + Landing Page Expansion — KSA Story

Add **investor narrative** to two surfaces: the executive pitch deck and the public landing page. English only.

## A. Pitch Deck — 4 new slides in `src/pages/ExecutivePresentation.tsx`

Insert order and final layout (deck grows 17 → 21):

1. Title
2. About Us
3. Problem
4. All-in-One
5. Modules
6. AI Everywhere
7. Tabeebi
8. Insurance
9. KSA Compliance
10. **NEW — KSA Industry Gap**
11. **NEW — KSA Compliance Roadmap**
12. **NEW — Clinic on Wheels**
13. Clinical
14. Diagnostics
15. Automation
16. Workflow
17. Finance & Ops
18. Tech
19. ROI
20. **NEW — Revenue Streams**
21. CTA

### Slide content

**1. `ExecKsaIndustryGapSlide.tsx` — "The KSA Healthcare Gap"**
- Headline: "A $66B market with a software problem"
- 4 stat tiles: KSA health spend ($66B by 2030), private hospital share growing, 70%+ HMS still legacy/on-prem, fragmented per-module vendors
- Pain column: disconnected ZATCA, manual NPHIES rejections, no Arabic-first UX, no mobile clinical apps, no Hijri in finance, vendor lock-in
- Opportunity column: Vision 2030 privatisation, MoH digital mandate, NPHIES becoming mandatory, SFDA Wasfaty enforcement, insurance penetration growth
- Closing: "The gap isn't features — it's an integrated, KSA-native platform"

**2. `ExecKsaComplianceRoadmapSlide.tsx` — "Becoming KSA-Compliant"**
- Headline: "Already integrated. Now getting certified."
- Status table per regulator (badge: Built / Sandbox / Certifying / Live):
  - ZATCA Phase 2 — Built — Fatoora onboarding Q2 2026
  - NPHIES (CCHI) — Built — Production approval Q2 2026
  - Wasfaty (MoH/SFDA) — Built — Pharmacy cert Q3 2026
  - Nafath — Built — Production credentials Q2 2026
  - Tatmeen (SFDA) — Built — Track-and-trace Q3 2026
  - Sehhaty / HESN — Built — Live Q4 2026
- Right panel: "What seed funding accelerates" — KSA legal entity, in-country data residency, certification fees, compliance officer
- Bottom strip: PDPL data-residency commitment, ISO 27001 path, HIPAA-equivalent posture

**3. `ExecClinicOnWheelsSlide.tsx` — "Clinic on Wheels"**
- Hero: stylized SVG van with floating capability pills (OPD, POC Lab, Mini Pharmacy, Telemedicine, ECG, Vaccination)
- Sub: "Healthcare that comes to the patient — Vision 2030 aligned"
- 4 KPI tiles: Target cities (5), Year-1 vans (20), Underserved reach (~2M), CAPEX vs brick-and-mortar (-70%)
- Use cases: Hajj/Umrah pilgrim care, Rural villages, Corporate camps (Aramco/SABIC), School screenings, Disaster response
- Tech callout: "Same HealthOS 24 platform — offline-first, syncs over LTE/Starlink"

**4. `ExecRevenueStreamsSlide.tsx` — "How We Make Money"**
- 4-column matrix:
  - **Single Clinic** — SaaS per-doctor/month — $99–199/doc/mo — 2-week close
  - **Multi-Branch Hospital** — Per-bed/month + module add-ons — $25–60/bed/mo — 8-week close
  - **Telemedicine Services** — Per-consult fee + revenue share — 10–15% per consult — partnership model
  - **Clinic on Wheels** — Van-as-a-Service (hardware + SaaS + support) — $4–8K/van/mo + per-visit — B2G/B2B
- Bottom: TAM math ("5,000 KSA clinics × $1,500/mo ≈ $90M ARR opportunity")
- Visual: target year-3 revenue mix donut

### Pitch deck wiring
- Edit `src/pages/ExecutivePresentation.tsx`
  - Import the 4 new slides
  - Insert at correct positions
  - `TOTAL_SLIDES`: 17 → **21**

## B. Landing Page — new section in `src/pages/Index.tsx`

Add **one consolidated section** `KsaExpansionSection.tsx`, placed right after `KsaComplianceSection`. It mirrors the pitch deck story but in marketing tone.

`src/components/landing/KsaExpansionSection.tsx`:
- Section header: "Built for KSA. Ready to Scale." + subhead about Vision 2030
- 3-tab/3-card horizontal layout:
  1. **The Gap** — short bullets on KSA legacy HMS pain points
  2. **Our Compliance Roadmap** — same regulator status badges (ZATCA, NPHIES, Wasfaty, Nafath, Tatmeen, Sehhaty/HESN)
  3. **Clinic on Wheels** — stylized SVG van + capability pills + "Coming to KSA 2026" badge
- Bottom CTA strip: "Operate a clinic, hospital, telehealth service, or mobile unit? — Book a KSA demo" (links to existing demo CTA)
- Reuse animation pattern (`AnimatedSection`)

### Landing wiring
- Edit `src/pages/Index.tsx` — import and place `<KsaExpansionSection />` after `<KsaComplianceSection />`

## Design conventions (both surfaces)
- Tailwind semantic tokens only (no raw hex)
- Lucide icons only
- Pitch deck: `slide` wrapper 1200×675, top gradient bar, footer "HealthOS 24 | healthos24.com"
- Landing section: matches existing `KsaComplianceSection` visual language

## Files to create
- `src/components/executive/ExecKsaIndustryGapSlide.tsx`
- `src/components/executive/ExecKsaComplianceRoadmapSlide.tsx`
- `src/components/executive/ExecClinicOnWheelsSlide.tsx`
- `src/components/executive/ExecRevenueStreamsSlide.tsx`
- `src/components/landing/KsaExpansionSection.tsx`

## Files to edit
- `src/pages/ExecutivePresentation.tsx` (imports, slide order, TOTAL_SLIDES)
- `src/pages/Index.tsx` (insert new landing section)

## Out of scope (deferred)
- Building actual Clinic-on-Wheels / Telemedicine product modules under `/app/...`
- Database tables, edge functions, routes, marketing-site backend changes
- Pricing-page UI (investor narrative only — no public pricing page)
- Arabic version of the deck or landing section (follow-up)

## Verification
- Open `/executive` → 21 slides in correct order; PDF export renders new slides at 1200×675
- Open `/` → new "Built for KSA. Ready to Scale." section visible after the existing KSA Compliance section
- Lint/typecheck pass via CI

Approve and I'll build all 5 files + 2 wiring edits in one pass.
