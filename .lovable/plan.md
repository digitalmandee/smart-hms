

# Fix Pharmacy PDF: Capture Each Slide as Screen Image

## Problem
The current download renders all 18 pages simultaneously in a print-mode container, then captures them with `html2canvas`. This off-screen bulk rendering causes layout distortion. The result is a small (8.3MB), distorted PDF.

## Solution
Instead of toggling `isPrintMode`, cycle through each page one-by-one on screen, capture the visible `.proposal-page` element exactly as it appears, then compile all 18 high-quality images into the PDF.

## Changes -- Single File: `src/pages/PharmacyDocumentation.tsx`

### New `handleDownloadPDF` Logic

```text
1. Save current page index
2. For each page (0 to 17):
   a. Set currentPage = i (renders that page visibly on screen)
   b. Wait 500ms for DOM + fonts to settle
   c. Find the visible .proposal-page element
   d. Capture with html2canvas at scale: 3 (higher quality = larger file)
   e. Store canvas in array
3. Restore original page index
4. Compile all canvases into jsPDF (portrait A4, JPEG at 0.98 quality)
5. Save file
```

### Key Differences from Current Code
- NO `isPrintMode` toggle during download -- pages render one at a time in the normal view
- Scale increased from 2 to 3 for higher fidelity
- JPEG quality increased from 0.95 to 0.98
- Each page captured from the exact same visible container the user sees
- Expected file size: ~20-30MB (18 pages at high-res image quality)

### Remove Print-Mode from Download
- `isPrintMode` will only be used for the Print button (browser print dialog)
- `handleDownloadPDF` will not set `isPrintMode` at all
- `printContainerRef` is no longer needed for download (only for print)

### No Other Files Changed
All the inline style fixes already applied to `DocPageWrapper.tsx`, `DocCoverPage.tsx` etc. remain in place -- they help but the real fix is capturing the visible on-screen render.
