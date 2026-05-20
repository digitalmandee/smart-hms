## Update Ask + remove UAE focus (KSA-only)

### Ask Slide rewrite (`ExecAskSlide.tsx`)
- **Round size:** SAR 2,000,000 (Seed) — display as "SAR 2M" with "≈ USD 533K" subtext.
- **Monthly burn:** SAR 45K (~18 months runway = SAR 810K on team + rest on infra/AI/setup).
- **Pre-money:** drop to SAR 12M (≈ USD 3.2M) so ratios stay sensible for KSA seed.
- **Runway card:** "18 mo" → "To Series A (KSA scale-up)".
- **Use of Funds (4 buckets, replaces old 3):**
  1. AI Research & R&D — 30% (Tabeebi voice, clinical LLM fine-tuning, Arabic ASR)
  2. Self-Hosted AI Infrastructure — 25% (GPU servers in KSA region, on-prem inference for PDPL, vector DB)
  3. Tech Stack & Engineering — 20% (platform hardening, mobile, integrations)
  4. KSA Compliance & Company Setup — 15% (NPHIES/ZATCA/Nafath/Wasfaty cert, MOH licensing, CR, Saudization)
  5. GTM (KSA only) — 10% (Riyadh/Jeddah sales, pilot conversion)
- **Monthly burn strip** (new small row): "SAR 45K/mo team burn · 18-mo runway · KSA-only focus"
- **Milestones (KSA-only, 18 mo):**
  - 15 paid KSA facilities live
  - SAR 4M ARR run-rate
  - NPHIES Phase 2 + ZATCA Phase 2 fully certified
  - Self-hosted AI cluster live in KSA region (PDPL-compliant)
  - Saudi company (CR + MOH) operational, Saudization tier achieved

### Remove UAE everywhere in deck
- `ExecAskSlide.tsx` — all UAE strings removed (above).
- `ExecTractionSlide.tsx`:
  - "KSA, UAE pilots, Pakistan live" → "KSA + Pakistan live"
  - "across KSA, UAE, and Pakistan" → "across KSA and Pakistan"
- `ExecMarketSlide.tsx`:
  - SAM sub: "KSA + Pakistan HMS by 2030"
  - SAM value recalibrated: $2.4B (was $3.2B with UAE) — detail text updated.
  - Bottom 4-stat row stays (KSA + Pakistan stats already there).
- `ExecKsaIndustryGapSlide.tsx`: drop "GCC expansion corridor: UAE, Kuwait, Bahrain" line (replace with "KSA-first; deep specialization over GCC sprawl").
- `ExecAboutUsSlide.tsx`: "Pakistan with expansion into Saudi Arabia, UAE, and East Africa" → "Pakistan with KSA as primary expansion market".

### Currency note
Primary numbers in SAR (matches KSA-only positioning). USD shown as small secondary line where helpful for investor familiarity.

### Out of scope
- No new slides, no reorder, no i18n changes, no backend.
- Arabic/Urdu translations for these copy changes can be added in a follow-up i18n pass.

### Files touched
- `src/components/executive/ExecAskSlide.tsx` (major rewrite)
- `src/components/executive/ExecTractionSlide.tsx` (2 string edits)
- `src/components/executive/ExecMarketSlide.tsx` (SAM copy + value)
- `src/components/executive/ExecKsaIndustryGapSlide.tsx` (1 line)
- `src/components/executive/ExecAboutUsSlide.tsx` (1 line)
