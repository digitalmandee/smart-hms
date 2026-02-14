

# Fix Pharmacy PDF: Add `onclone` CSS Variable Copy and `scrollIntoView`

## Problem
The PDF pages are still rendering with distorted layouts because `html2canvas` clones the DOM into an iframe but loses CSS custom properties (Tailwind theme variables like `--background`, `--foreground`, etc.) and responsive class states. This causes colors, spacing, and visibility to break in the captured output.

## Solution
Apply the proven fix pattern: add an `onclone` callback to `html2canvas` that copies all CSS custom properties to the cloned document, fixes responsive visibility classes, and scroll each page into view before capture.

## File: `src/pages/PharmacyDocumentation.tsx`

### Changes to `handleDownloadPDF`:

1. **Scroll each page into view** before capturing — ensures the browser has fully painted it
2. **Add `onclone` callback** to the `html2canvas` call that:
   - Copies ALL CSS custom properties (`--*`) from the real `document.documentElement` to the cloned document root
   - Removes `hidden` class from any elements that have `sm:block` (since capture viewport is 794px which may trigger mobile breakpoint)
   - Sets explicit `width`/`height` on images to prevent layout shift
3. **Remove forced `width`/`height` from html2canvas options** — let the element's own CSS dimensions (already set to 794x1123 via inline overrides) control the size, avoiding double-constraint conflicts

### Updated capture loop (replaces lines 78-115):

```text
for (let i = 0; i < pageElements.length; i++) {
  const el = pageElements[i] as HTMLElement;

  // Save + force A4 dimensions
  const origStyles = { ... };  // same as current
  el.style.width = '794px';
  el.style.height = '1123px';
  // ... same dimension overrides as current

  // Scroll into view so browser paints it
  el.scrollIntoView({ behavior: 'instant' });
  await new Promise(r => setTimeout(r, 200));

  const canvas = await html2canvas(el, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: 794,
    windowHeight: 1123,
    onclone: (clonedDoc, clonedEl) => {
      // Copy CSS custom properties to cloned document
      const rootStyles = getComputedStyle(document.documentElement);
      for (let j = 0; j < rootStyles.length; j++) {
        const prop = rootStyles[j];
        if (prop.startsWith('--')) {
          clonedDoc.documentElement.style.setProperty(
            prop, rootStyles.getPropertyValue(prop)
          );
        }
      }

      // Fix responsive hidden elements
      clonedEl.querySelectorAll('[class*="sm:block"]').forEach((e) => {
        e.classList.remove('hidden');
      });

      // Ensure images have explicit dimensions
      clonedEl.querySelectorAll('img').forEach((img) => {
        if (!img.width && img.naturalWidth) {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
        }
      });
    }
  });

  Object.assign(el.style, origStyles);
  // ... add to PDF same as current
}
```

Key difference: removed `width: 794` and `height: 1123` from html2canvas options (let the element's inline styles control it), and added `onclone` + `scrollIntoView`.

No other files are modified.
