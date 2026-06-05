
# Thalassemia Patient Journey — ADF Client Presentation

Build a new in-app slide deck at **`/presentations/thalassemia`** (English only) that walks the ADF (Aleem Dar Foundation) client through every stage of a Thalassemia patient's journey in HealthOS 24 — from registration with Zakat/Sadaqa intake, through screening, blood bank, transfusion, ongoing care, and family screening — using **realistic form UI mockups** so they can see exactly what staff will fill in.

## Where it lives

- **Route**: `/presentations/thalassemia` (public, no auth, like existing executive deck)
- **Pattern**: mirrors `src/pages/ExecutivePresentation.tsx` — fixed `.slide` containers, keyboard nav, print/PDF export via `Cmd+P`
- **Components**: new folder `src/components/thalassemia-presentation/` with one `*Slide.tsx` per slide
- **Branding**: ADF / Aleem Dar Foundation header on every slide (logo placeholder + "ADF Thalassemia Care Program — Powered by HealthOS 24")
- **Tone**: functional and descriptive, no buzzwords (per branding memory)

## Slide outline (22 slides)

**Opening (2)**
1. **Title** — "Thalassemia Patient Journey on HealthOS 24" — ADF logo, subtitle "End-to-end NGO workflow: Registration → Screening → Blood Bank → Transfusion → Lifelong Care", stats placeholder
2. **Journey Overview** — horizontal flow diagram of all 8 stages with icons (Register → Zakat Eligibility → Screening → Diagnosis → Blood Bank Match → Transfusion → Chelation & Follow-up → Family Screening)

**Stage 1 — Registration + Zakat/Sadaqa (4)**
3. **Stage intro: Registration** — what happens, who fills it, time taken
4. **Form mockup: Patient Registration** — realistic form with fields: MRN (auto), Full Name, Father/Guardian Name, DOB, Gender, CNIC/B-Form, Blood Group, Contact, Address, City, Referred By, Thalassemia Type (Major / Intermedia / Minor / Carrier — Select), Date of Diagnosis, Diagnosing Hospital
5. **Form mockup: Guardian & Socioeconomic Intake** — Guardian relationship, occupation, monthly household income, dependents, owns house (Y/N), zakat/sadaqa eligible (auto-suggested from income), documents uploaded (ID copy, income proof), social worker assessment notes
6. **Form mockup: Zakat / Sadaqa / Donor Sponsorship** — Funding source dropdown (Zakat / Sadaqa / General Donation / Self-pay / Mixed), sponsor name (optional), sponsorship plan (Per-transfusion / Monthly / Annual), receipt/acknowledgement preview, auto-linked donor in finance module

**Stage 2 — Screening & Diagnosis (3)**
7. **Stage intro: Screening** — CBC → HPLC → Genetic confirmation pathway
8. **Form mockup: Lab Order — CBC + HPLC** — Order form: tests checklist (CBC, Hb Electrophoresis / HPLC, Serum Ferritin, LFTs, RFTs, HIV, HBsAg, HCV), priority, fasting (Y/N), specimen ID auto-generated `THL-YYMMDD-####`, sample collection assignment
9. **Form mockup: HPLC Result Entry** — Hb A, Hb A2, Hb F percentages, HPLC pattern interpretation dropdown (Beta Thal Major / Intermedia / Trait / HbE / Normal), pathologist verification, auto-classification badge

**Stage 3 — Blood Bank (5)**
10. **Stage intro: Blood Bank** — donor → screening → inventory → crossmatch → issue (35-day expiry policy)
11. **Form mockup: Donor Registration** — Donor name, CNIC, DOB, blood group, contact, last donation date, eligibility checklist (weight ≥50kg, Hb ≥12.5, no recent illness), consent signature
12. **Form mockup: Donor Screening Panel** — Mandatory tests grid: HIV, HBsAg, HCV, Syphilis, Malaria, ABO/Rh typing — each with result (Reactive/Non-reactive), tested by, verified by; release-to-inventory gated on all non-reactive
13. **Form mockup: Crossmatch & Issue** — Patient lookup, required units, available units list (group, expiry, age), crossmatch result (Compatible / Incompatible), issued to ward, transport temp, time of issue
14. **Form mockup: Transfusion Record** — Pre-transfusion vitals, unit ID scanned, start time, end time, post-transfusion vitals, reaction (None / Mild / Severe — with description), nurse, doctor verify

**Stage 4 — Ongoing Care (5)**
15. **Stage intro: Lifelong Care** — typical patient gets 2 units every 3–4 weeks for life; chelation is critical
16. **Form mockup: Transfusion Schedule** — calendar view, next due date auto-calc, recurring schedule (every N weeks), SMS reminder toggle, missed-visit alerts
17. **Form mockup: Iron Chelation Tracking** — Serum Ferritin trend (with chart placeholder), prescribed chelator (Deferasirox / Deferiprone / Desferal), dose mg/kg, compliance log, side-effect notes
18. **Form mockup: OPD / IPD Visit** — vitals, growth chart for child, splenomegaly assessment, complications log (cardiac, endocrine), next review date — same OPD/IPD shell already in HealthOS
19. **Form mockup: Family / Sibling Screening** — Family tree input, siblings list with screening status (Pending / Carrier / Major / Normal), parent carrier status, genetic counselling done (Y/N), referral to premarital screening

**Closing (3)**
20. **Reporting Dashboard mockup** — KPIs the foundation will see: Active patients, units transfused this month, donors registered, Zakat funds utilized, average pre-transfusion Hb, missed appointments
21. **Donor / Sponsor Receipt mockup** — auto-generated PDF preview: ADF letterhead, donor name, amount, Zakat/Sadaqa designation, patients sponsored, tax-exempt note
22. **What we will build / deliver** — phased rollout list (Phase 1: Registration + Zakat intake; Phase 2: Blood Bank; Phase 3: Chelation & Family screening; Phase 4: Dashboard & Receipts), then thank-you / Q&A slide

## Form-mockup style

Each form-mockup slide renders a realistic-looking form card (not a screenshot) using existing shadcn `Input`, `Select`, `Label`, `Card`, `Badge` components, disabled/read-only, with sample data pre-filled so the client sees the end state. Two-column field layout, section dividers, "Save & Continue" / "Submit" buttons in disabled state. This communicates the actual UI staff will use without requiring the full backend to be wired up.

## Navigation & export

- Arrow keys + on-screen prev/next + slide counter (X / 22)
- Print CSS so `Cmd+P` exports a clean PDF for the client to take away
- Link added to the existing presentations index (if one exists) or accessible directly by URL

## Technical notes

- Pure frontend / presentation code — no DB schema changes, no new backend logic
- All copy hardcoded in English (per your answer); strings live inside each slide component
- Reuse `HealthOS24Logo` and add a small "ADF — Aleem Dar Foundation" co-brand mark next to it
- Follow existing slide patterns from `src/components/executive/` (gradient backgrounds, footer with confidentiality note, page counter)
- No business logic changes to any existing module

## Out of scope (call out if you want it added)

- Building the actual Thalassemia module backend (tables, RLS, triggers)
- Arabic / Urdu translations of this deck
- Real ADF logo asset (will use a text placeholder until you provide the file)
- Donor receipt PDF generation (mocked as a static visual in the slide)
