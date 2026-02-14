

# Direct PDF Download (No Print Dialog)

## Problem
The "Download PDF" button currently opens a browser print dialog, requiring the user to manually select "Save as PDF." This is confusing and not a real download.

## Solution
Use the `html2canvas` + `jspdf` libraries to capture each documentation page as an image and compile them into a downloadable PDF file automatically — no print dialog involved.

## Changes

### 1. Install Dependencies
- `jspdf` — generates PDF documents client-side
- `html2canvas` — renders DOM elements to canvas images

### 2. Update `src/pages/PharmacyDocumentation.tsx`
Replace the `handleDownloadPDF` function with a new implementation that:

1. Temporarily switches to print mode (renders all 18 pages)
2. Loops through each `.proposal-page` element
3. Uses `html2canvas` to capture each page as an image
4. Creates a new `jsPDF` document (A4 portrait, 210x297mm)
5. Adds each captured image as a full-page PDF page
6. Calls `pdf.save("HealthOS24-Pharmacy-Documentation.pdf")` to trigger a real browser file download
7. Exits print mode

The user clicks "Download PDF" and a `.pdf` file appears in their downloads folder — no print dialog, no pop-up windows.

### 3. Print Button Unchanged
The "Print" button continues to use `window.print()` for users who want to print directly.

## Technical Notes

| Aspect | Detail |
|---|---|
| Library | `jspdf` (~280KB) + `html2canvas` (~40KB) |
| Output | A4 portrait, 210x297mm, one page per documentation slide |
| Quality | 2x pixel ratio for sharp text and mockups |
| File name | `HealthOS24-Pharmacy-Documentation.pdf` |
| Page count | Exactly 18 pages (one per component) |
| No server needed | Entirely client-side generation |

