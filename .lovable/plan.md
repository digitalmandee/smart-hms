

# Make PDF Download Height Dynamic

## Problem
The capture height is hardcoded to `675px`, which clips slides whose content is taller than that. Some slides (e.g., modules, ROI) have more content and need more vertical space.

## Fix — `src/pages/ExecutivePresentation.tsx`

Instead of forcing `height: 675px`, read each slide's actual `scrollHeight` after setting the width to `1200px`, then use that as the capture height. Scale proportionally into the A4 page.

### Updated capture loop (lines 44-66):
```typescript
el.scrollIntoView();

const originalStyle = el.style.cssText;
el.style.width = "1200px";
el.style.maxWidth = "1200px";
el.style.overflow = "visible";
el.style.height = "auto";
el.style.minHeight = "675px";
el.style.margin = "0";
el.style.borderRadius = "0";
el.style.border = "none";
el.style.boxShadow = "none";

await new Promise(r => setTimeout(r, 300));

// Use actual content height, minimum 675px
const captureHeight = Math.max(el.scrollHeight, 675);

const dataUrl = await toPng(el, {
  quality: 0.95,
  pixelRatio: 2,
  backgroundColor: "#ffffff",
  width: 1200,
  height: captureHeight,
});

el.style.cssText = originalStyle;

// Scale to fit A4 landscape (297mm x 210mm), preserving aspect ratio
const pageWidth = 297;
const pageHeight = (captureHeight / 1200) * pageWidth;

if (pageHeight > 210) {
  // If taller than A4, scale to fit height and center horizontally
  const scaledWidth = (210 / pageHeight) * pageWidth;
  const xOffset = (297 - scaledWidth) / 2;
  pdf.addImage(dataUrl, "PNG", xOffset, 0, scaledWidth, 210);
} else {
  // Center vertically on the page
  const yOffset = (210 - pageHeight) / 2;
  pdf.addImage(dataUrl, "PNG", 0, yOffset, pageWidth, pageHeight);
}
```

This captures each slide at its natural content height while ensuring it fits within A4 landscape pages.

