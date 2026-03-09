

# Add KSA Compliance Slide to Executive Pitch Deck

## Summary
I'll create a dedicated **KSA Compliance & Regulatory Integrations** slide for the Executive Presentation (`/executive-presentation`) that showcases all 7 mandatory Saudi regulatory integrations in a visually impactful format.

## What Already Exists
- `ExecInsuranceSlide.tsx` mentions NPHIES briefly as part of the insurance workflow
- KSA documentation pages (`src/components/ksa-docs/`) have detailed content for each integration
- The current Executive Presentation has 16 slides

## Implementation

### 1. Create New Slide Component
**File:** `src/components/executive/ExecKsaComplianceSlide.tsx`

A premium slide layout featuring:
- **Header:** "🇸🇦 KSA Regulatory Compliance — Built for Saudi Healthcare"
- **7-Integration Grid:** Visual cards for each mandatory integration:
  - NPHIES — Insurance & Claims (CHI)
  - ZATCA — E-Invoicing Phase 2
  - Wasfaty — E-Prescriptions (MOH)
  - Tatmeen — Drug Track & Trace (SFDA)
  - HESN — Public Health Surveillance
  - Nafath — National Identity (ELM)
  - Sehhaty — Patient App Sync
- **Compliance Badges:** PDPL, Hijri Calendar, ACHI/SBS/SNOMED/LOINC coding
- **Sandbox vs Production indicator:** "Test safely before going live"

### 2. Update Executive Presentation
**File:** `src/pages/ExecutivePresentation.tsx`

- Import and add `ExecKsaComplianceSlide` after `ExecInsuranceSlide` (position 9/17)
- Update `TOTAL_SLIDES` from 16 → 17
- Update slide number in header

### 3. Visual Design
The slide will use:
- Saudi green accent color (`#006C35`)
- Compact 2-row grid (4 + 3 integrations)
- Icon badges for each regulatory body
- Gradient header bar matching other executive slides

---

**Technical Details**
- Component follows existing `ExecInsuranceSlide` pattern
- Uses Lucide icons + themed cards
- Trilingual support via existing i18n structure
- PDF export compatible (1200×675px canvas)

