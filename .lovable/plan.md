

# Fix PDF Downloads Across All Documentation Pages

## Problems Identified

1. **Pharmacy Documentation** -- Bullets/logo STILL distorted because the header logo box (line 12) and ScreenMockup traffic-light dots (lines 87-89) and InfoCard icon (line 98) still use Tailwind flex centering, which html2canvas misrenders. The previous fix only covered SectionTitle, FeatureList, StepList, and SubSection.

2. **Presentation page** (`/presentation`) -- "Download PDF" calls `window.print()` (opens print dialog, not a real file download).

3. **Pricing Proposal** (`/pricing-proposal`) -- "Download PDF" calls `handlePrint()` which calls `window.print()`.

4. **Lab Report** (`/lab-reports`) -- Both "Download PDF" and "Print" buttons call the same `useReactToPrint` function.

---

## Changes

### File 1: `src/components/pharmacy-docs/DocPageWrapper.tsx`

Convert ALL remaining Tailwind flex-centered small elements to inline styles:

- **Header logo box** (line 12): `w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center` to inline `width: 32, height: 32, lineHeight: '32px', textAlign: 'center', display: 'inline-block'`
- **ScreenMockup dots** (lines 87-89): Three `w-2 h-2 rounded-full` traffic-light dots to inline-styled spans
- **InfoCard icon container** (line 98): `w-8 h-8 rounded-md flex items-center justify-center` to inline styles
- **DocCoverPage reference**: The cover page logo (line 8) also needs inline styles

### File 2: `src/components/pharmacy-docs/DocCoverPage.tsx`

- **Logo box** (line 8): `w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center` to inline styles
- **Version dots** (lines 32, 36): `w-2 h-2 rounded-full` to inline styles

### File 3: `src/pages/Presentation.tsx`

Replace `handleDownload` with real PDF generation using `jspdf` + `html2canvas`:
- Add imports for `jspdf`, `html2canvas`, `useRef`, `useCallback`
- Add `isDownloading` state and `printContainerRef`
- New `handleDownloadPDF` function that:
  - Sets a print/download mode to render all 32 slides
  - Iterates each `.slide` element
  - Captures at 1123x794px (landscape A4 pixels) with `html2canvas` at 2x scale
  - Adds each as a landscape A4 page (297x210mm) in jsPDF
  - Saves as `HealthOS24-Presentation.pdf`
- Keep existing Print button behavior (window.print) unchanged
- Show loading spinner on Download button during generation

### File 4: `src/pages/PricingProposal.tsx`

Replace `handleDownload` with real PDF generation:
- Add imports for `jspdf`, `html2canvas`, `useRef`, `useCallback`
- Add `isDownloading` state and `printContainerRef`
- New `handleDownloadPDF` function using same pattern as PharmacyDocumentation (portrait A4, 794x1123px capture)
- Keep Print button calling `window.print()` separately
- Show loading spinner during generation

### File 5: `src/pages/public/PublicLabReportPage.tsx`

Separate Download from Print:
- Add imports for `jspdf`, `html2canvas`
- Add `isDownloading` state
- New `handleDownloadPDF` function that captures `printRef` content as a single-page PDF
- "Print" button keeps using `useReactToPrint` (unchanged)
- "Download PDF" button calls new `handleDownloadPDF` instead
- Filename: `Lab-Report-{order_number}.pdf`

### File 6: `src/components/presentation/TitleSlide.tsx`

Convert small dot separators (line ~80 area: `w-1 h-1 rounded-full bg-muted-foreground`) to inline styles for reliable PDF rendering.

---

## Technical Notes

- All PDF generation follows the proven pattern from `PharmacyDocumentation.tsx`: render all pages, await fonts, iterate with html2canvas at 2x scale, jsPDF addImage
- Presentation uses **landscape** A4 (297mm x 210mm, 1123x794px); all others use **portrait** (210mm x 297mm, 794x1123px)
- `jspdf` and `html2canvas` are already installed dependencies
- No schema or backend changes needed

