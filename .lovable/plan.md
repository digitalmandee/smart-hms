

# Fix PDF: Render All Pages in Main React Tree

## Why Current Approach Still Fails

The `createRoot(offscreen)` approach renders each page in a **separate React tree** — completely disconnected from the main app. While the `<style>` tag exists in the document, the rendering context (font inheritance, CSS variable resolution, layout constraints) can behave differently when the component tree is isolated. `html2canvas` then captures this subtly different layout.

## New Approach: In-Tree Hidden Rendering

Instead of creating a separate React root, render ALL 18 pages **inside the main component tree** in a hidden container (similar to how print mode works). This guarantees every page renders with the exact same CSS context as the visible preview. Then capture each page element sequentially.

## Changes — Single File: `src/pages/PharmacyDocumentation.tsx`

### 1. Add a "download mode" state (like `isPrintMode`)

Add `isCapturing` state. When true, render all 18 pages in a hidden container within the main JSX tree.

### 2. Hidden container in JSX

```text
{isCapturing && (
  <div
    ref={captureContainerRef}
    style={{
      position: 'absolute',
      left: '-9999px',
      top: 0,
      width: '794px',
    }}
  >
    {pages.map((page) => {
      const PageComp = page.component;
      return <PageComp key={page.id} />;
    })}
  </div>
)}
```

This is part of the main React tree — all styles, CSS classes, and context apply exactly as they do on screen.

### 3. Update `handleDownloadPDF`

1. Set `isCapturing = true`
2. Wait for React to render + fonts to settle (use `requestAnimationFrame` + timeout)
3. Query all `.proposal-page` elements inside the capture container
4. Loop through each, capture with `html2canvas` (scale: 3)
5. Compile into PDF with jsPDF
6. Set `isCapturing = false`

### 4. Remove `createRoot` import

No longer needed — everything renders in the main tree.

## Why This Will Work

- Pages render in the **exact same React tree** as the visible preview
- All Tailwind classes, CSS variables, and inherited styles apply identically
- The hidden container at 794px width matches the on-screen `.proposal-page` width (210mm = ~794px)
- No isolated rendering context — what you see on screen is exactly what gets captured
- `html2canvas` captures the same DOM that the browser renders for the visible pages

## Technical Details

- Remove `createRoot` import, add `useEffect` or `useRef` for capture container
- Add `isCapturing` boolean state
- The capture container uses `position: absolute; left: -9999px` so it's invisible but fully rendered by the browser
- Each `.proposal-page` element inside the container is captured individually
- The `proposal-page` CSS class already sets `width: 210mm` which gives the correct A4 width

