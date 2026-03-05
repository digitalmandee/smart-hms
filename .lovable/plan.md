

# Fix Squeezed PDF — Use True 16:9 Pages

## Root Cause
A4 landscape is 297x210mm (1.41:1 ratio), but slides are 1200x675px (1.78:1 ratio / 16:9). Mapping a 16:9 image onto A4 **stretches it vertically**, causing the squeezed appearance. No amount of capture tweaking fixes this — the page format itself is wrong.

## Fix — `src/pages/ExecutivePresentation.tsx`

Change jsPDF to use a **custom 16:9 page size** instead of A4:

```typescript
// Replace format: "a4" with custom 16:9 dimensions
const pdf = new jsPDF({
  orientation: "landscape",
  unit: "mm",
  format: [297, 167.0625],  // 297mm wide, 167mm tall = exact 16:9
});

// Then addImage fills the whole page:
pdf.addImage(dataUrl, "PNG", 0, 0, 297, 167.0625);
```

This is a 2-line change — the capture logic (1200x675, in-place styling) stays exactly as-is since that part works correctly.

### File to edit
- `src/pages/ExecutivePresentation.tsx` — lines 36 and 66: change page format and addImage dimensions to 16:9.

