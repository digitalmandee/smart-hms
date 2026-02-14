

# Fix: Force html2canvas to Capture at Full A4 Resolution

## Root Cause

The preview iframe viewport is narrower than 794px. Even though we set `pageEl.style.width = '794px'`, the browser constrains the element to the available viewport width (~488px). `html2canvas` then captures this squeezed layout, producing distorted output.

## Solution

Use `html2canvas`'s `windowWidth` and `windowHeight` options to simulate a full-width viewport during capture. This forces `html2canvas` to render the element as if it were in a 794px-wide window, regardless of the actual iframe size.

## Changes -- Single File: `src/pages/PharmacyDocumentation.tsx`

### Update the `html2canvas` call (around line 94)

Add `windowWidth: 1200` and `windowHeight: 1600` to the html2canvas options object:

```text
Before:
  const canvas = await html2canvas(pageEl, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: 794,
    height: 1123,
  });

After:
  const canvas = await html2canvas(pageEl, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: 794,
    height: 1123,
    windowWidth: 1200,
    windowHeight: 1600,
  });
```

### Also set `minWidth` on the page element (around line 86)

To ensure the element itself doesn't collapse below 794px:

```text
Before:
  pageEl.style.width = '794px';
  pageEl.style.height = '1123px';

After:
  pageEl.style.width = '794px';
  pageEl.style.minWidth = '794px';
  pageEl.style.height = '1123px';
```

And save/restore `minWidth` in `origStyles`.

### Why This Works

- `windowWidth: 1200` tells html2canvas to pretend the browser window is 1200px wide, giving the 794px element plenty of room
- `minWidth: '794px'` prevents CSS from collapsing the element below its target width
- Combined, these ensure the capture matches exactly what users see on a desktop browser, regardless of the preview iframe size

No other files need changes.

