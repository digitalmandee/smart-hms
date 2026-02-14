

# Fix Pharmacy PDF: Replace html2canvas with html-to-image

## Problem
`html2canvas` **re-renders** the DOM from scratch -- it parses every element and draws it onto a canvas. This process loses subtle CSS positioning (bullets shift, text moves outside containers). No amount of options tuning fixes this because the root cause is html2canvas's rendering engine, not our configuration.

## Solution
Replace `html2canvas` with the **`html-to-image`** library. This library works completely differently:
- It uses the browser's native **SVG foreignObject** to take a true screenshot of the element
- The browser itself renders the content (not a JavaScript re-implementation)
- CSS layout, bullets, text positioning are preserved exactly as you see them on screen

This is the "direct PNG to PDF" approach -- each slide gets captured as a PNG exactly as the browser displays it, then assembled into a PDF.

## Changes

### 1. Install `html-to-image` package
Add the `html-to-image` npm dependency (replaces html2canvas usage in this file).

### 2. File: `src/pages/PharmacyDocumentation.tsx`

- Replace `import html2canvas` with `import { toPng } from 'html-to-image'`
- Rewrite `handleDownloadPDF` to use `toPng()` instead of `html2canvas()`:

```text
for each page element:
  1. Force inline styles (794x1123px, no shadows/radius)
  2. Wait 200ms for repaint
  3. const dataUrl = await toPng(el, {
       width: 794,
       height: 1123,
       pixelRatio: 2,
       backgroundColor: '#ffffff',
     });
  4. Restore original styles
  5. Add image to PDF page
```

- The key difference: `toPng` asks the **browser itself** to render the element into an image via SVG foreignObject, so every bullet, border, and text position is identical to what you see on screen.

### Technical Details

- `html-to-image` is lightweight (~5KB) and has no dependencies
- `pixelRatio: 2` gives sharp output (equivalent to scale: 2)
- Output is PNG (lossless) so quality is perfect
- No `onclone`, no `windowWidth`, no DOM re-rendering -- just a direct browser screenshot

