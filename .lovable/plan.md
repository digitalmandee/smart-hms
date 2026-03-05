

# Fix Squeezed PDF Download

## Root Cause
The slides use `min-height: 675px` with responsive `width: 100%` on screen. During PDF capture, forcing `width: 1200px` and `height: 675px` directly on the live DOM element compresses content (especially slides with absolute-positioned elements, grids, and hub-spoke diagrams).

## Fix — Clone-based capture in `ExecutivePresentation.tsx`

Instead of mutating the live slide element, **clone each slide** into a hidden off-screen container with fixed dimensions, capture the clone, then remove it.

```typescript
// For each slide:
const clone = el.cloneNode(true) as HTMLElement;
clone.style.cssText = `
  position: fixed; left: -9999px; top: 0;
  width: 1200px; height: 675px; max-width: 1200px;
  overflow: hidden; box-sizing: border-box;
  padding: 2rem; background: white;
`;
document.body.appendChild(clone);
await new Promise(r => setTimeout(r, 200));

const dataUrl = await toPng(clone, {
  quality: 0.95, pixelRatio: 2,
  backgroundColor: "#ffffff",
  width: 1200, height: 675,
});

document.body.removeChild(clone);
pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
```

This prevents any visual glitch on the live page and ensures the clone renders at exact 16:9 dimensions without squeezing the original.

### File to edit
- `src/pages/ExecutivePresentation.tsx` — Replace the capture loop (lines 38-63) with clone-based approach

