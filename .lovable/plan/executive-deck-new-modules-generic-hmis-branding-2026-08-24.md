# Executive Deck: New Modules + Generic HMIS Branding

Two changes to the executive presentation: expand module coverage (Gynecology/Obstetrics, Dental, Donations, Thalassemia profile, Warehouse/Kiosk) and strip all HealthOS 24 branding in favour of a neutral "HMIS" identity with no funding content.

## 1. De-brand to generic HMIS

- Replace every "HealthOS 24" / "HealthOS" / "24" mark across all 36 exec slides with a generic **HMIS** wordmark: neutral tile with a heartbeat/cross icon plus the letters "HMIS" (new small `ExecDeckMark` component used by the title slide and the centre circle of the "Replace 10 Systems With 1" slide).
- Footers change from `HealthOS 24 | AI-Powered Hospital Management` + `healthos24.com` to `HMIS | Hospital Management Information System` — no website address, no domain anywhere.
- Title slide: headline becomes product-generic ("The hospital operating system for Saudi Arabia" kept, brand line removed), tagline/company references dropped.
- Deck header, PDF filename and ZIP folder name in `ExecutivePresentation.tsx` become `HMIS-Product-Deck` / `HMIS-Deck-Slides`.
- Arabic locale entries in `i18n/ar.json` updated for the changed strings so EN/AR/UR stay in sync (Urdu keys added where the deck already carries them).

## 2. Remove funding information

- Delete the Ask slide (`ExecAskSlide`) — SAR 2M raise, valuation, burn/runway.
- Strip funding/raise/valuation lines from the CTA, Vision, Roadmap and Unit Economics slides; keep operational and product metrics only.
- Core slide count drops from 20 to 19 after removing the Ask slide (`TOTAL_SLIDES` updated, footer counters `X / 20` re-numbered).

## 3. Add the new modules

**Clinical slide (core):** add a 6th department card — **Gynecology & Obstetrics** (ANC visits, delivery/birth records, postnatal follow-up, high-risk flagging, mother & child linkage). Layout moves from 5 to 6 columns of cards.

**Module catalog slide (appendix A1):** add
- Clinical: Gynecology & Obstetrics, Birth & Death Records
- New "Donations & Fundraising" category: Donor Management, Donation Campaigns, Recurring Donations, Donations as P&L revenue, Cold-chain / blood donation drives
- Operations: Warehouse (zones, bins, pick & pack, cycle counts), Self-Service Kiosk, Queue Displays

**Two new appendix deep-dive slides:**
- `ExecSpecialtyCareSlide` — Dental (3D tooth chart, per-surface charting, treatment plans), Dialysis, and Gynecology/Obstetrics/ANC in one specialty-care slide.
- `ExecDonationsSlide` — donor lifecycle, campaigns with shareable public pages, recurring schedules, donation revenue posting to the GL, and the **Thalassemia Care Centre** facility profile (module presets: blood bank + lab + pharmacy + donations + mandatory procurement/warehouse, specialty modules switched off).

**Warehouse/Kiosk:** covered by an added row on the existing appendix operations slide rather than a new slide, to keep density within limits.

Appendix count goes 14 → 16.

## Technical notes

- Files touched: all `src/components/executive/Exec*Slide.tsx` (branding/footers), `src/pages/ExecutivePresentation.tsx` (slide registry, counts, export names), `src/components/executive/i18n/ar.json`, plus two new slide components and one `ExecDeckMark` component.
- No database, backend or business-logic changes — presentation layer only.
- Slide roots keep `className="slide ..."` so PDF/PNG export continues to work; new slides are checked in print mode for overflow.
- All new copy stays functional and descriptive (no buzzwords), and every new string is added to the Arabic locale file with RTL-safe layout (`flex-row-reverse` / `text-end`).
