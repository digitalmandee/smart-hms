

# KSA Compliance Documentation — Downloadable PDF

## What We're Building

A multi-page documentation site at `/ksa-documentation` (same pattern as `/pharmacy-documentation`) that covers all 7 KSA integrations and compliance features. Includes page-by-page navigation, print support, and **Download PDF** using jsPDF + html-to-image.

## Pages (12 total)

| # | Page | Content |
|---|------|---------|
| 1 | Cover | "KSA Compliance & Integrations Guide" branding page |
| 2 | Table of Contents | Links to all sections |
| 3 | Overview | Summary of all 7 integrations, compliance landscape |
| 4 | NPHIES | Eligibility, claims, pre-auth, denial management, batch submission |
| 5 | ZATCA Phase 2 | UBL 2.1, QR codes, clearance/reporting flow |
| 6 | Wasfaty | E-prescription gateway, pharmacy workflow |
| 7 | Tatmeen / RSD | GS1 barcode scanning, drug track & trace, SFDA reporting |
| 8 | HESN | Communicable disease reporting, immunization, FHIR resources |
| 9 | Nafath | National SSO identity verification, MFA flow |
| 10 | Sehhaty | Patient app sync — appointments, lab results, e-Jaza |
| 11 | PDPL & Consent | Data protection, consent management, patient rights |
| 12 | Configuration | API keys, sandbox vs production, testing procedures |

## New Files

| File | Purpose |
|------|---------|
| `src/pages/KsaDocumentation.tsx` | Main page with navigation, print, PDF download (cloned from PharmacyDocumentation pattern) |
| `src/components/ksa-docs/KsaDocPageWrapper.tsx` | Page wrapper with KSA-themed header/footer (green + Saudi flag accent) |
| `src/components/ksa-docs/KsaDocCover.tsx` | Cover page |
| `src/components/ksa-docs/KsaDocToc.tsx` | Table of contents |
| `src/components/ksa-docs/KsaDocOverview.tsx` | Integration landscape overview |
| `src/components/ksa-docs/KsaDocNphies.tsx` | NPHIES deep-dive |
| `src/components/ksa-docs/KsaDocZatca.tsx` | ZATCA Phase 2 |
| `src/components/ksa-docs/KsaDocWasfaty.tsx` | Wasfaty e-Prescription |
| `src/components/ksa-docs/KsaDocTatmeen.tsx` | Tatmeen / RSD |
| `src/components/ksa-docs/KsaDocHesn.tsx` | HESN Public Health |
| `src/components/ksa-docs/KsaDocNafath.tsx` | Nafath Identity |
| `src/components/ksa-docs/KsaDocSehhaty.tsx` | Sehhaty Patient App |
| `src/components/ksa-docs/KsaDocPdpl.tsx` | PDPL & Consent Management |
| `src/components/ksa-docs/KsaDocConfig.tsx` | Configuration & Testing Guide |

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add route `/ksa-documentation` → `KsaDocumentation` |

## Design

- Reuses the `DocPageWrapper` shared components (`SectionTitle`, `FeatureList`, `StepList`, `TipBox`, `ScreenMockup`, `MockupTable`, `InfoCard`, `SubSection`) but with a KSA-themed wrapper (green + gold accents, Saudi flag indicator)
- Each page is A4-sized (210mm × 297mm) for clean PDF output
- PDF generation uses exact same jsPDF + toPng pattern from PharmacyDocumentation
- Total: 12 pages, downloadable as "HealthOS24-KSA-Compliance-Guide.pdf"

