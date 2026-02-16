

## Redesign Social Media Posts - Light, Brand-Consistent Design

### Current Problem
The posts currently use dark gradient backgrounds (dark teal, dark blue, dark red) which look generic and don't match the HealthOS brand. The landing page uses a clean, modern, light design with teal primary, white backgrounds, subtle shadows, and professional typography.

### New Design Direction
Complete visual overhaul to match the HealthOS landing page aesthetic shown in the reference image:

- **White background** as the card base
- **8px colored accent bar** at the top of each card (using the post's brand color)
- **Dark text** for hook headlines (slate-900) instead of white-on-dark
- **Muted gray text** for subtext (slate-500)
- **Colored icon circle** (light tint background with darker icon, e.g., teal-100 bg + teal-600 icon)
- **Module badge** as a colored pill (e.g., teal-100 bg with teal-700 text)
- **Logo "24" badge** uses the brand color (teal-500 bg, white text)
- **"HealthOS" label** in dark text (slate-800)
- **Subtle decorative elements** -- very light colored circles at 5% opacity instead of heavy dark ones
- **"healthos.com" watermark** in gray-300

### Card Layout (1080x1080)

```text
+--------------------------------------------------+
| [========== colored top bar 12px ===========]     |
|                                                   |
|  [24 badge]  HealthOS          [Module pill]      |
|                                                   |
|                                                   |
|  Large Bold Hook Text                             |
|  in Dark Slate Color                              |
|                                                   |
|  Supporting subtext in                             |
|  muted gray color                                 |
|                                                   |
|                                                   |
|  [Icon in colored circle]       healthos.com      |
|                                                   |
|        [subtle decorative blob, bottom-right]     |
+--------------------------------------------------+
```

### Files to Change

**1. `src/components/social/socialPostsData.ts`**
- Replace `gradientFrom` and `gradientTo` fields with `lightBg` (e.g., `"bg-teal-50"`) and `brandColor` (e.g., `"teal"`)
- Each post gets a light tinted background and a brand color string used to derive all accent classes
- Keep all hooks, subtext, icons, modules, and categories unchanged

**2. `src/components/social/SocialPostCard.tsx`**
- Card background: white with subtle light tinted background
- Top: 12px colored accent bar spanning full width
- Logo "24" badge: colored background (e.g., bg-teal-500) with white text
- "HealthOS" text: slate-800
- Module badge: light colored pill (e.g., bg-teal-100 text-teal-700)
- Hook text: slate-900, extrabold (same size 72px)
- Subtext: slate-500 (same size 32px)
- Icon circle: light colored bg (e.g., bg-teal-100) with darker icon (e.g., text-teal-600)
- Watermark: text-gray-400
- Decorative circles: 5% opacity in the accent color
- All download logic remains unchanged

**3. `src/pages/SocialMediaPosts.tsx`**
- No changes needed -- page layout, filters, and download logic stay the same

### What Stays the Same
- All 30 post hooks and subtext content
- All icons and module labels
- Category filtering and tabs
- Download PNG functionality (html-to-image)
- Page layout and grid
- 1080x1080 internal rendering with ResizeObserver scaling

