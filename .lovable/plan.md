

# Fix Empty White Slides in PDF

## Root Cause
Cloned elements lose their **computed CSS styles** from Tailwind classes. `cloneNode(true)` copies the DOM and class names, but since the clone is appended directly to `document.body` (outside the app's styled container), Tailwind utility classes still apply via the stylesheet. However, CSS custom properties like `hsl(var(--foreground))`, `hsl(var(--background))` etc. resolve to nothing because the clone is outside the element tree where those CSS variables are defined.

All slide text uses `text-foreground`, `bg-card`, `border-border` etc. which rely on CSS variables set on `:root` or a parent — these **do** work globally. But `html-to-image`'s `toPng` can fail on cloned elements that use complex CSS (gradients, shadows, pseudo-elements) or SVG icons (Lucide).

## Fix — Capture original elements in-place

Instead of cloning, temporarily style the **original** slide for capture but do it properly:
1. Save original styles
2. Apply fixed dimensions + `position: relative` to keep layout intact  
3. Scroll the slide into view first (ensures paint)
4. Use `toPng` on the original element
5. Restore original styles

```typescript
for (let i = 0; i < slides.length; i++) {
  if (i > 0) pdf.addPage();
  const el = slides[i] as HTMLElement;
  
  // Scroll into view to ensure rendering
  el.scrollIntoView();
  
  const originalStyle = el.style.cssText;
  el.style.width = "1200px";
  el.style.minHeight = "675px";
  el.style.height = "675px";
  el.style.maxWidth = "1200px";
  el.style.overflow = "hidden";
  el.style.margin = "0";
  el.style.borderRadius = "0";
  el.style.border = "none";
  el.style.boxShadow = "none";
  
  await new Promise(r => setTimeout(r, 300));
  
  const dataUrl = await toPng(el, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    width: 1200,
    height: 675,
  });
  
  el.style.cssText = originalStyle;
  pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
}
```

### File to edit
- `src/pages/ExecutivePresentation.tsx` — Replace clone-based capture loop (lines 38-62) with in-place capture that preserves CSS variable resolution and Lucide SVG icons.

