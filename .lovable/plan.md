

# Documentation Hub Redesign + Process Flow Pages

## 1. Redesign Documentation Hub (`DocumentationHub.tsx`)

**Current**: Plain grid of cards with emoji icons — looks generic.

**New design**:
- Dark hero section with gradient mesh background, glowing emerald accents
- Animated search bar at top (cosmetic — filters cards by title)
- Category tabs: Clinical | Operations | Specialty | Compliance
- Each card gets: gradient icon container, hover glow effect, arrow indicator, page count badge
- Subtle grid pattern overlay for AI/tech aesthetic
- Stats bar: "12 Modules • 90+ Pages • Complete Hospital Coverage"

## 2. New Shared Component: `ProcessFlow`

Add to `DocPageWrapper.tsx` — a visual horizontal/vertical step flow diagram rendered as connected boxes with arrows, suitable for A4 PDF. Pure CSS, no external lib.

```
[Step 1] → [Step 2] → [Step 3] → [Step 4]
  desc       desc       desc       desc
```

## 3. Add Flow/Journey Page to Every Module

Each module gets one new page inserted after the TOC showing the complete process flow. The page numbers of subsequent pages shift by +1. Total pages per module increase by 1.

| Module | Flow Page | Content |
|--------|-----------|---------|
| OPD | `OpdDocFlow.tsx` | Patient arrival → Reception check-in → Token → Vitals → Doctor consultation → Orders → Prescription → Checkout → Follow-up |
| IPD | `IpdDocFlow.tsx` | OPD/ER referral → Admission form → Bed selection → Daily rounds → Nursing care → Charges → Discharge summary → Final billing |
| Surgery | `OtDocFlow.tsx` | Surgery request → Scheduling → Pre-op assessment → Anesthesia → Live surgery → PACU recovery → Post-op orders → Ward transfer |
| Lab | `LabDocFlow.tsx` | Doctor order → Sample collection → Barcode labeling → Machine processing → Result entry → Validation → Report to doctor |
| Radiology | `RadDocFlow.tsx` | Imaging order → Scheduling → Patient prep → Scan execution → Image upload → Radiologist report → Doctor review |
| Pharmacy | `PharmDocFlow.tsx` | Prescription received → Drug verification → Stock check → Dispensing → Patient counseling → Billing → Inventory update |
| Warehouse | `WhDocFlow.tsx` | Purchase order → GRN receiving → Quality check → Put-away → Pick request → Packing → Dispatch → Cycle count |
| Finance | `FinDocFlow.tsx` | Service charge → Invoice generation → Payment collection → Journal entry → Daily closing → Monthly P&L → Reconciliation |
| HR | `HrDocFlow.tsx` | Job posting → Application screening → Interview → Offer → Onboarding → Attendance tracking → Payroll → Performance review |
| Dialysis | `DialDocFlow.tsx` | Patient enrollment → Schedule assignment → Pre-session vitals → Machine setup → Intra-dialysis monitoring → Post-session → Billing |
| Dental | `DentDocFlow.tsx` | Patient registration → 3D charting → Condition recording → Treatment plan → Procedure execution → Imaging → Billing |

## 4. Files Summary

| Action | File |
|--------|------|
| REWRITE | `src/pages/DocumentationHub.tsx` |
| EDIT | `src/components/shared-docs/DocPageWrapper.tsx` — add `ProcessFlow` component |
| CREATE | 11 new flow page components (one per module) |
| EDIT | 11 documentation viewer pages — insert flow page after TOC, update page numbers |
| EDIT | 11 TOC components — add "Process Flow" entry, shift page numbers |
| EDIT | All existing content pages — increment `pageNumber` by 1 and `totalPages` by 1 |

~55 file edits total across 3 implementation rounds.

