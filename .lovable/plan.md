

# Fix Pharmacy PDF: Match the Working PricingProposal.tsx Pattern Exactly

## Root Cause

The Pharmacy PDF code has diverged from the working PricingProposal.tsx pattern. The working proposal uses `width` and `height` in the html2canvas options (which tell html2canvas exactly what area to capture) and does NOT use `onclone` or `scrollIntoView`. The pharmacy code removed `width`/`height` and added `onclone` + `scrollIntoView`, which is causing the distortion.

## Solution

Make the Pharmacy `handleDownloadPDF` an exact copy of the working PricingProposal.tsx logic. No experimentation -- just replicate what already works.

## File: `src/pages/PharmacyDocumentation.tsx`

### Replace `handleDownloadPDF` with the exact PricingProposal pattern:

1. Remove `scrollIntoView` call
2. Remove `onclone` callback entirely
3. Add back `width: 794` and `height: 1123` to html2canvas options
4. Use `scale: 2` instead of `scale: 3` (matches working code)
5. Use JPEG quality `0.95` instead of `0.98` (matches working code)

### The updated function will be:

```
const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    setIsPrintMode(true);

    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 800));

      const container = printContainerRef.current;
      if (!container) return;

      const pageElements = container.querySelectorAll('.proposal-page');
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pixelWidth = 794;
      const pixelHeight = 1123;

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;

        const origStyles = {
          width: el.style.width,
          height: el.style.height,
          overflow: el.style.overflow,
          background: el.style.background,
          boxShadow: el.style.boxShadow,
          borderRadius: el.style.borderRadius,
        };

        el.style.width = `${pixelWidth}px`;
        el.style.height = `${pixelHeight}px`;
        el.style.overflow = 'hidden';
        el.style.background = 'white';
        el.style.boxShadow = 'none';
        el.style.borderRadius = '0';

        await new Promise(r => setTimeout(r, 200));

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: pixelWidth,
          height: pixelHeight,
          windowWidth: pixelWidth,
          windowHeight: pixelHeight,
        });

        Object.assign(el.style, origStyles);

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
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

### What changes vs current code:
- Removed: `scrollIntoView`, `onclone` callback, `minHeight`/`maxWidth`/`margin` overrides
- Added back: `width: pixelWidth` and `height: pixelHeight` in html2canvas options
- Changed: `scale: 3` to `scale: 2`, JPEG quality `0.98` to `0.95`, initial delay `500ms` to `800ms`
- Simplified: style overrides to match PricingProposal exactly (6 properties instead of 8)

This is a direct copy of the pattern that already works for the Pricing Proposal, which uses the same `.proposal-page` class and same A4 portrait format.
