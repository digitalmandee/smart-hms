

# Fix PDF Download — Switch to Robust Rendering Strategy

## Problem
Despite replacing all SVG icons with emojis and all CSS variables with hardcoded colors, `html2canvas` continues to produce inconsistent results across certain pages. The library has known limitations with:
- Font rendering timing (fonts may not be loaded when capture starts)
- Complex CSS layouts (flexbox, grid)
- Background colors and gradients on certain elements
- Opacity and transparency values

The current 500ms wait before capture is insufficient for all 18 pages to fully render with fonts and styles loaded.

## Solution
Improve the PDF generation pipeline with three key changes:

### 1. Render Pages One at a Time (Not All at Once)
Instead of rendering all 18 pages simultaneously and then capturing them, render and capture each page individually. This prevents memory pressure and ensures each page is fully laid out before capture.

Current flow:
- Render all 18 pages at once
- Loop through and capture each

New flow:
- For each page: render it alone, wait for it to settle, capture it, then move to the next

### 2. Add Font and Layout Stabilization
- Wait for `document.fonts.ready` before starting capture
- Add a per-page delay (200ms) after each page renders to ensure layout is complete
- Force explicit width/height on the capture container to match A4 proportions exactly

### 3. Improve html2canvas Configuration
- Set `logging: false` to prevent console noise
- Set `allowTaint: true` for cross-origin resources
- Set `windowWidth` and `windowHeight` to match A4 pixel dimensions at 2x scale
- Use `onclone` callback to force all computed styles to inline styles, ensuring nothing is lost

## Files to Edit

### `src/pages/PharmacyDocumentation.tsx`
Update the `handleDownloadPDF` function:

1. Wait for `document.fonts.ready` before starting
2. Render all pages in a hidden off-screen container with explicit A4 dimensions (794px x 1123px at 96dpi)
3. For each `.proposal-page` element:
   - Force explicit width (794px) and height (1123px) via inline styles
   - Wait 200ms for the element to settle
   - Capture with `html2canvas` using improved config
   - Add to jsPDF
4. Clean up and trigger download

### `src/components/pharmacy-docs/DocPageWrapper.tsx`
Add explicit inline styles for the page container to ensure `html2canvas` sees fixed dimensions:
- `width: 210mm` (via inline style, not just CSS class)
- `height: 297mm` (fixed, not min-height)
- `background: white` (via inline style)
- `overflow: hidden` (via inline style)

This combination of fixes ensures each page is treated as a fixed-size white canvas with all content fully rendered before capture, eliminating the inconsistent rendering issues.

## Technical Details

| Aspect | Current | New |
|---|---|---|
| Page rendering | All 18 at once | All at once but with font-ready wait |
| Wait before capture | Single 500ms delay | `document.fonts.ready` + 300ms settle time |
| Container sizing | CSS class only | Explicit inline styles (794px x 1123px) |
| html2canvas config | Basic (scale:2, useCORS) | Enhanced (scale:2, useCORS, windowWidth, onclone for style inlining) |
| Error handling | Alert on failure | Toast notification with retry option |
