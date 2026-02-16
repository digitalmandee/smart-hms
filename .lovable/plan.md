

## Redesign Social Media Posts - Consistent Teal Brand, Rich Filled Designs

### Problem
The current posts use different colors for every post (teal, sky, violet, red, emerald, etc.) and have plain white backgrounds with small UI mockups pushed to the bottom. They don't look like professional social media marketing content. The reference image shows all posts using ONE consistent brand color with rich gradient backgrounds and professional design.

### Design Direction (from reference image analysis)

The reference (SaleMag WhatsApp posts) shows:
- **ONE brand color** used consistently across ALL posts (green)
- **Rich gradient or tinted backgrounds** - not plain white
- **Large bold typography** with mixed white and colored text
- **Phone/device mockups and illustrations** as visual centerpieces
- **Decorative shapes** (circles, waves, dots) for visual depth
- **Strong brand watermark** and logo presence

### New Design for HealthOS

**Consistent teal color scheme** (HealthOS brand: `#0d9488` teal-600) across ALL 30 posts. No more rainbow colors.

**Two alternating card styles** for visual variety while keeping brand consistency:

**Style A - Dark Teal Gradient (odd posts)**
- Background: Dark teal gradient (`#0f4f4a` to `#0d9488`)
- White hook text (bold, large)
- Light teal subtext
- Module mockup in a white "phone/screen" frame
- Decorative teal circles and wave shapes
- White logo and URL in footer

**Style B - Light/White with Teal Accents (even posts)**
- Background: White to very light teal (`#f0fdfa`)
- Dark slate hook text
- Teal subtext
- Module mockup with teal border/shadow frame
- Teal decorative elements (dots, circles at 10-15% opacity)
- Teal footer strip

### Card Layout - Style A (Dark)

```text
+--------------------------------------------------+
|  [dark teal gradient background]                  |
|                                                   |
|  [24 logo white]  HealthOS     [Module pill]      |
|                                                   |
|  Large Bold Hook Text                             |
|  in WHITE Color                                   |
|                                                   |
|  Supporting subtext in light teal                 |
|                                                   |
|  +--[white rounded frame]--------------------+    |
|  |                                           |    |
|  |   [MODULE UI MOCKUP]                      |    |
|  |   inside white container                  |    |
|  |                                           |    |
|  +-------------------------------------------+    |
|                                                   |
|  [decorative circles, dots]                       |
|  [24 HealthOS]              [healthos24.com]      |
+--------------------------------------------------+
```

### Card Layout - Style B (Light)

```text
+--------------------------------------------------+
|  [white/light teal background]                    |
|  [teal top bar 10px]                              |
|                                                   |
|  [24 logo teal]  HealthOS      [Module pill]      |
|                                                   |
|  Large Bold Hook Text                             |
|  in DARK SLATE Color                              |
|                                                   |
|  Supporting subtext in teal-600                   |
|                                                   |
|  +--[teal bordered frame]-----------------+       |
|  |                                        |       |
|  |   [MODULE UI MOCKUP]                   |       |
|  |   with teal shadow glow               |       |
|  |                                        |       |
|  +----------------------------------------+       |
|                                                   |
|  [teal footer strip with white logo/URL]          |
+--------------------------------------------------+
```

### Technical Changes

**File: `src/components/social/socialPostsData.ts`**
- Remove `brandColor` field from all 30 posts (no longer needed - everything is teal)
- Keep all hooks, subtexts, icons, modules, features, screenTypes unchanged

**File: `src/components/social/SocialPostCard.tsx`**
- Remove the entire `colorMap` with 16+ color entries
- Replace with a single teal brand palette object
- Use `post.id % 2` to alternate between Style A (dark) and Style B (light)
- Style A: dark teal gradient background, white text, white-framed mockup, large decorative circles
- Style B: white/light teal background, dark text, teal-bordered mockup, teal accents
- Both styles: same footer with HealthOS branding, same mockup rendering
- Add more decorative elements: multiple circles at different sizes/opacities, subtle dot patterns, curved shapes

**File: `src/components/social/SocialPostMockups.tsx`**
- No changes needed - mockups stay the same, they render inside white containers

### Consistent Teal Palette

| Element | Dark Card (Style A) | Light Card (Style B) |
|---------|-------------------|---------------------|
| Background | Gradient #0a3d38 to #0d9488 | White to #f0fdfa |
| Hook text | #ffffff (white) | #0f172a (slate-900) |
| Subtext | #99f6e4 (teal-200) | #0d9488 (teal-600) |
| Logo bg | rgba(255,255,255,0.2) | #0d9488 |
| Module pill | rgba(255,255,255,0.2) white text | #ccfbf1 teal text |
| Mockup frame | White with shadow | White with teal border + glow |
| Footer | rgba(0,0,0,0.2) overlay | Solid #0d9488 |
| Decorative circles | White at 8% opacity | Teal at 8% opacity |

### Files to Change

| File | What Changes |
|------|-------------|
| `src/components/social/socialPostsData.ts` | Remove `brandColor` from interface and all 30 posts |
| `src/components/social/SocialPostCard.tsx` | Complete redesign with two alternating teal styles, remove colorMap, add rich decorative elements |
| `src/components/social/SocialPostMockups.tsx` | No changes |

