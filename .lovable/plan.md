

# Fix: Force Synchronous Renders During PDF Capture

## Root Cause

`setCurrentPage(i)` inside the async `for` loop does NOT trigger a re-render between iterations. React batches state updates, so all 18 captures are of the SAME page. The `setTimeout(500)` doesn't guarantee the render has completed.

## Solution

Use `ReactDOM.flushSync()` to force each `setCurrentPage(i)` call to synchronously flush and render to the DOM before `html2canvas` captures it.

## Changes -- Single File: `src/pages/PharmacyDocumentation.tsx`

1. Add `import { flushSync } from "react-dom"` at the top
2. In the `handleDownloadPDF` loop, wrap `setCurrentPage(i)` in `flushSync()`:

```text
Before (broken):
  setCurrentPage(i);
  await new Promise(resolve => setTimeout(resolve, 500));

After (fixed):
  flushSync(() => setCurrentPage(i));
  await new Promise(resolve => setTimeout(resolve, 600));
```

This guarantees React commits the new page to the DOM before the timeout starts, and `html2canvas` captures the correct visible page each time.

No other changes needed -- the rest of the capture logic (scale: 3, style override/restore, jsPDF compilation) is correct.

