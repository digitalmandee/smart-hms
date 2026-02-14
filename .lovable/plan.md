

# Fix PDF: Use the Same Proven Pattern as Presentation.tsx

## Root Cause

The hidden container (`left: -9999px`) approach keeps failing because even though the elements are in the React tree, they are positioned offscreen and the browser/html2canvas still doesn't lay them out at full width inside the narrow iframe.

Meanwhile, **Presentation.tsx already has a working PDF download** that uses a completely different approach -- it renders all slides visibly in the page, then forces inline dimensions on each element and uses `windowWidth`/`windowHeight` in html2canvas. This works perfectly.

## Solution

Copy the exact working pattern from Presentation.tsx:

1. When downloading, switch to "print mode" which renders ALL 18 pages visibly (this already exists in the code)
2. Force fixed pixel dimensions on each `.proposal-page` element via inline styles
3. Capture each element with `html2canvas` using `windowWidth: 794` and `windowHeight: 1123`
4. Restore original styles and switch back to normal mode

## Changes -- Single File: `src/pages/PharmacyDocumentation.tsx`

### Remove the hidden capture container approach

Remove `isCapturing` state, `captureContainerRef`, and the hidden capture `div` at the bottom of the JSX.

### Rewrite `handleDownloadPDF` to match Presentation.tsx pattern

```text
const handleDownloadPDF = useCallback(async () => {
  setIsDownloading(true);
  setIsPrintMode(true);  // Show all pages visibly

  try {
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 500));

    const container = printContainerRef.current;
    if (!container) return;

    const pageElements = container.querySelectorAll('.proposal-page');
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i] as HTMLElement;

      // Save original styles
      const origStyles = {
        width: el.style.width,
        height: el.style.height,
        minHeight: el.style.minHeight,
        maxWidth: el.style.maxWidth,
        overflow: el.style.overflow,
        margin: el.style.margin,
        borderRadius: el.style.borderRadius,
        boxShadow: el.style.boxShadow,
      };

      // Force fixed A4 pixel dimensions (identical to Presentation.tsx approach)
      el.style.width = '794px';
      el.style.height = '1123px';
      el.style.minHeight = '1123px';
      el.style.maxWidth = '794px';
      el.style.overflow = 'hidden';
      el.style.margin = '0';
      el.style.borderRadius = '0';
      el.style.boxShadow = 'none';

      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      // Restore original styles
      Object.assign(el.style, origStyles);

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }

    pdf.save("HealthOS24-Pharmacy-Documentation.pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("PDF generation failed. Please try again.");
  } finally {
    setIsPrintMode(false);
    setIsDownloading(false);
  }
}, []);
```

### Key differences from previous attempts
- Uses `setIsPrintMode(true)` to render all pages **visibly** (not hidden offscreen)
- Forces inline pixel dimensions on each element before capture
- Uses `windowWidth: 794` and `windowHeight: 1123` to tell html2canvas the viewport size
- Restores styles after each capture
- This is the **exact same pattern** that works in Presentation.tsx

### What gets removed
- `isCapturing` state
- `captureContainerRef` ref
- The hidden capture container JSX block at the bottom

