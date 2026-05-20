## Add Mobile Apps slide to executive deck

The current 29-slide deck never pitches the native mobile apps (Capacitor iOS/Android + PWA), which are already built. Adding one dedicated slide.

### New slide: `ExecMobileAppsSlide.tsx`
Position: **after `ExecClinicOnWheelsSlide`** (slide 16), before `ExecAutomationSlide`. Fits the "field / on-the-go" narrative cluster.

Header
- Kicker: "Mobile-First, Already Shipped"
- Title: "Native Apps for Every Role"
- Sub: "iOS + Android + PWA — clinicians, patients, and staff carry the hospital in their pocket."

Four role cards (2×2 grid)
1. **Doctor App** — Stethoscope icon
   - Today's rounds & OPD queue
   - Voice SOAP notes (Tabeebi)
   - e-Prescribing + lab/imaging orders
   - Offline-capable rounding
2. **Nurse App** — HeartPulse icon
   - Vitals capture & med admin (BCMA-ready)
   - Task lists, shift handover
   - Barcode patient ID
3. **Patient App** — User icon
   - Appointments, lab/imaging results
   - Prescriptions, invoices, deposits
   - Push notifications, biometric login, Nafath-ready
4. **Staff / Reception App** — ClipboardList icon
   - Check-in, token queue, POS dispensing
   - Pull-to-refresh, native haptics & sounds

Tech strip (bottom row, 3 chips)
- "Capacitor — iOS + Android binaries"
- "Installable PWA — instant install, no store"
- "Offline sync · Push · Biometric · Deep links"

KSA compliance pill
- "PDPL-aware · Arabic RTL · Nafath / Sehhaty integration paths"

Footer chrome: page counter `17 / 30`.

### Files
- **Create** `src/components/executive/ExecMobileAppsSlide.tsx` (light theme, follows `ExecDifferentiatorsSlide` pattern — semantic tokens, `bg-gradient-to-br from-cyan-500/5 via-background to-blue-500/5`, header bar gradient cyan→blue, card icons with brand colors).
- **Edit** `src/pages/ExecutivePresentation.tsx`:
  - Import `ExecMobileAppsSlide`
  - Insert `<ExecMobileAppsSlide />` after `<ExecClinicOnWheelsSlide />`
  - Bump `TOTAL_SLIDES` from 29 → 30
- **Edit** subsequent slides' page-counter strings (`17 / 29`, `18 / 29`, … `29 / 29`) → renumber to `/ 30` and shift by +1 from slide 17 onward. Counters live as small chrome strings in each slide file; will grep `/ 29</` and update the relevant ones.

### Out of scope
- No new images, no i18n strings yet (Arabic/Urdu copy can follow in a translation pass — consistent with prior plan).
- No backend, no routing.
- No changes to Ask, Financials, or KSA-only positioning.

### Why this slide
Investors increasingly weight mobile readiness; today the deck only hints at mobile via "Cloud + Offline Mobile" in Differentiators. A dedicated slide turns a buried bullet into a clear, shipped capability across 4 personas — material for the KSA pitch.
