## Goals

Address 7 issues across the executive pitch deck:

1. Page counters are wrong (still show old `/16`, `/21`, etc.) — deck has 30 slides in this order.
2. The "20+ Integrated Modules" grid looks empty — each category card needs more substance.
3. "How We Make Money" slide title is weak for investors → rename + sharpen.
4. Em-dashes (`—`) everywhere give an AI-written feel → strip them out.
5. Mobile Apps slide is all text — needs a phone-style visual like the rest of the brand.
6. Remove the word "PWA" from the deck.
7. Slide 5 ("Replace 10 Systems With 1") has the "Available in 3 Languages" pill overlapping the bottom-row module icons (HR & Payroll, Pharmacy, Radiology) — per screenshot.
8. General humanization pass on tone.

---

## Correct page numbering (source of truth)

```
01 Title              11 Insurance              21 Market
02 About Us           12 KSA Compliance         22 Competition
03 Problem            13 KSA Industry Gap       23 Differentiators
04 Why Now            14 KSA Compliance Roadmap 24 Traction
05 All-in-One         15 Clinic on Wheels       25 Revenue (was How We Make Money)
06 20+ Modules        16 Mobile Apps            26 ROI
07 Clinical           17 Automation             27 Financials
08 Diagnostics        18 Workflow               28 Team
09 AI Everywhere      19 Finance & Ops          29 Ask
10 Tabeebi            20 Tech Stack             30 CTA
```

Every slide's `X / Y` pill must match this map and use `/ 30`.

---

## Changes per slide

### Slide 5 — All-in-One (fix overlap)
- Move the "Available in 3 Languages" pill out of the absolute-positioned overlap zone. Place it inside the centered content column, directly under the subtitle (above the hub-and-spoke diagram), not absolutely positioned at `bottom-12`.
- Reduce hub-spoke radius slightly if needed so the bottom row never touches the footer.
- Update counter to `5 / 30`.

### Slide 6 — 20+ Integrated Modules (fill empty boxes)
- Keep 7 category cards but make every card feel dense and credible. Add 2-4 modules to thin categories:
  - Diagnostics: add Blood Bank, Specimen Tracking, Lab Analyzer Integration.
  - Pharmacy: add Stock & Batch Tracking, e-Prescription (Wasfaty-ready), Drug Interaction Checks.
  - Finance: add Patient Deposits, Vendor Payments, Daily Closing.
  - Insurance & RCM: add Denial Management, NPHIES Integration.
  - Operations: add Asset Management, Biometric Attendance, Document Mgmt.
  - AI & Intelligence: add AI Lab-Result Flagging, AI Claim Scrubbing, Predictive Forecasting.
  - Clinical: add Dental, Dialysis, Mother & Child.
- Show a small count badge per category (e.g. "10 modules") and a total badge ("28 modules live") in the header so the deck stops contradicting itself ("20+" vs. actual count).
- Counter `6 / 30`.

### Slide 16 — Mobile Apps (visual upgrade, remove "PWA")
- Add a real visual: two phone-frame mockups (pure CSS / Tailwind, no new dependency) side by side, one showing a "Doctor" screen (today's rounds list + voice note button) and one showing a "Patient" screen (next appointment + lab results card). Use the same gradient + rounded language as the landing page hero cards.
- 4 role cards (Doctor / Nurse / Patient / Staff) move to a compact row below the phones.
- Remove the word "PWA" everywhere on this slide. Replace tech chip "Installable PWA — instant install, no store" with "Web app for desktop and tablet workflows".
- Footer chips: Capacitor (iOS + Android), Offline sync, Biometric login, Push notifications. No mention of PWA.
- Counter `16 / 30`.

### Slide 25 — Revenue (rename + sharpen)
- Rename header: kicker `Revenue` (not "💰 Business Model"), title `Four Revenue Streams, One Platform`, subtitle `Recurring SaaS at the core, expansion revenue from telemedicine and mobile clinics.`
- Remove the 💰 emoji.
- Tighten copy on each stream card so cards read like an investor would expect (model, unit economics, sales motion).
- Keep the KSA TAM math block and Year-3 mix.
- Add a small "Recurring revenue share: ~85% by Y3" callout at the bottom.
- Counter `25 / 30`.

### Em-dash purge (humanization)
- Replace every `—` across all 30 slide components. Default replacement is a period + new sentence, a comma, or a colon depending on context. Run a one-time edit pass; review each replacement to keep sentences natural.
- Light copy polish on Why Now, Problem, AI Everywhere, Differentiators, Tabeebi where sentences currently read like marketing AI ("woven into every department", "An Empty Top-Right Quadrant") — soften to conversational investor language.

### Counter fixes (every other slide)
- About `2/30`, Problem `3/30`, Why Now `4/30`, All-in-One `5/30`, Modules `6/30`, Clinical `7/30`, Diagnostics `8/30`, AI Everywhere `9/30`, Tabeebi `10/30`, Insurance `11/30`, KSA Compliance `12/30`, KSA Industry Gap `13/30`, KSA Roadmap `14/30`, Clinic on Wheels `15/30`, Mobile `16/30`, Automation `17/30`, Workflow `18/30`, Finance & Ops `19/30`, Tech `20/30`, Market `21/30`, Competition `22/30`, Differentiators `23/30`, Traction `24/30`, Revenue `25/30`, ROI `26/30`, Financials `27/30`, Team `28/30`, Ask `29/30`, CTA `30/30`.

---

## Out of scope

- No new images (phone mockups built with CSS only).
- No i18n / Arabic / Urdu changes inside the executive deck (English investor deck).
- No backend, no data, no auth changes.
- No edit to other pages (landing, docs, app routes).

---

## Files touched

- `src/components/executive/ExecAllInOneSlide.tsx` (fix overlap, counter)
- `src/components/executive/ExecModulesSlide.tsx` (denser cards, counter)
- `src/components/executive/ExecMobileAppsSlide.tsx` (phone mockups, remove PWA, counter)
- `src/components/executive/ExecRevenueStreamsSlide.tsx` (rename + sharpen, counter)
- All 30 `Exec*Slide.tsx` files for counter renumber + em-dash purge + light tone pass.
- No change to `src/pages/ExecutivePresentation.tsx` (order already correct, TOTAL_SLIDES already 30).
