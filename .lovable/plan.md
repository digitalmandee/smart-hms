

# Fix PDF Download Issues

## Problem
The PDF download has issues:
1. **Slides render at screen width** — when captured, content may overflow or be cut off because the slides use responsive CSS (`width: 100%`) but get forced to `1200px` inline, which may not match the actual rendered layout
2. **`window.open(url, "_blank")` on line 69** opens the PDF in a new tab after download — this is likely blocked by popup blockers and causes confusion
3. **Slides with `position: absolute` elements** (like `ExecAllInOneSlide`'s hub-spoke diagram and bottom badges) may not render correctly when `html-to-image` captures them, because forced width/height changes shift absolute positioning

## Fix

### `src/pages/ExecutivePresentation.tsx`
1. **Remove the `window.open()` call** (line 69) — just download, don't open in a new tab
2. **Add `await` delay between slides** to let DOM reflow after style changes before capturing
3. **Set `overflow: hidden`** on slides during capture to prevent content spill
4. **Use `height: 675px`** (not just `minHeight`) to ensure consistent aspect ratio for capture
5. **Wrap capture in `requestAnimationFrame`** or add a small delay so the DOM fully repaints after style changes before `toPng` runs

### Updated capture logic
```typescript
for (let i = 0; i < slides.length; i++) {
  if (i > 0) pdf.addPage();
  const el = slides[i] as HTMLElement;
  const originalCss = el.style.cssText;

  try {
    el.style.width = "1200px";
    el.style.height = "675px";
    el.style.maxWidth = "1200px";
    el.style.overflow = "hidden";
    
    // Wait for DOM repaint
    await new Promise(r => setTimeout(r, 100));

    const dataUrl = await toPng(el, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: 1200,
      height: 675,
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
  } finally {
    el.style.cssText = originalCss;
  }
}
```

Remove the `window.open` line and just keep the clean download flow.

