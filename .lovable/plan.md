

# Fix PDF: Render Pages in Offscreen Container

## Why Previous Fixes Failed

All previous attempts tried to capture the `.proposal-page` element **inside the narrow preview iframe**. The element is constrained by its parent container width (~488px in the Lovable preview). Setting `windowWidth: 1200` on `html2canvas` only affects how it interprets media queries -- it does NOT resize the actual DOM element. The element remains squeezed, and `html2canvas` captures the squeezed layout.

## Solution: Offscreen Rendering Container

Create a temporary, absolutely-positioned offscreen `div` appended directly to `document.body`. Render each page component into this container at exact A4 pixel dimensions (794x1123px). Since the container is positioned off-screen with explicit dimensions and no parent constraints, `html2canvas` captures the full-width layout perfectly.

## How It Works

```text
1. Create a div: position absolute, left -9999px, width 794px, height 1123px
2. Append it to document.body (bypasses all parent width constraints)
3. For each page (0-17):
   a. Use ReactDOM.createRoot to render the page component into the offscreen div
   b. Wait for fonts + layout to settle
   c. Capture with html2canvas (the div has full 794px width -- no squeezing)
   d. Store canvas
   e. Unmount the React root
4. Remove the offscreen div
5. Compile all canvases into PDF with jsPDF
```

## Technical Details

### File: `src/pages/PharmacyDocumentation.tsx`

**New imports:**
- `import { createRoot } from "react-dom/client"` (to render components into the offscreen container)

**Replace `handleDownloadPDF` logic:**

1. Create offscreen container:
```text
const offscreen = document.createElement('div');
offscreen.style.position = 'absolute';
offscreen.style.left = '-9999px';
offscreen.style.top = '0';
offscreen.style.width = '794px';
offscreen.style.height = '1123px';
offscreen.style.overflow = 'hidden';
offscreen.style.background = 'white';
document.body.appendChild(offscreen);
```

2. Copy stylesheets to ensure Tailwind classes resolve correctly (the offscreen div is in the same document, so styles apply automatically).

3. For each page, render the component into the offscreen div:
```text
for (let i = 0; i < pages.length; i++) {
  const PageComponent = pages[i].component;
  const root = createRoot(offscreen);
  root.render(<PageComponent />);
  // Wait for render + fonts
  await new Promise(r => setTimeout(r, 800));
  // Capture
  const canvas = await html2canvas(offscreen, { scale: 3, ... });
  capturedCanvases.push(canvas);
  root.unmount();
}
```

4. Clean up and generate PDF as before.

**Remove:** The current approach of modifying the visible page's styles (width, minWidth, boxShadow overrides) and relying on `flushSync` page cycling. The visible page no longer participates in capture at all -- the user sees a loading state while pages render offscreen.

### No Other Files Changed
All 18 page components and `DocPageWrapper.tsx` remain exactly as they are. The offscreen container gives them full A4 width to render naturally.

## Why This Will Work
- The offscreen div is a direct child of `document.body` with `width: 794px` -- no parent constraints
- Same document means all CSS/Tailwind classes resolve identically
- `html2canvas` captures a properly laid-out 794px-wide element
- The visible UI stays untouched during capture (no flickering pages)

