

# Fix Pharmacy Documentation PDF Download - Distorted Bullets and Icons

## Problem
The downloaded PDF shows distorted numbered circles (step indicators) and bullet dots. This happens because `html2canvas` poorly renders small elements styled with CSS flexbox centering (`flex items-center justify-center` on 20px circles). The on-screen view looks perfect, but the canvas capture misaligns these elements.

## Root Cause
`html2canvas` has known issues with:
- Small flex containers (the numbered step circles and bullet dots)
- `rounded-full` on tiny elements
- Flex centering on elements under ~24px

## Solution
Replace flexbox-based centering on small circles with `line-height` + `text-align: center` + `display: inline-block` using **inline styles** (which `html2canvas` handles reliably). This affects 3 components in `DocPageWrapper.tsx`:

### Changes to `src/components/pharmacy-docs/DocPageWrapper.tsx`

**1. `StepList` -- Numbered circles (lines 61-72)**
Replace the flex-centered `<span>` with inline styles using `line-height` matching the height, `text-align: center`, and `display: inline-block` instead of flexbox.

**2. `FeatureList` -- Bullet dots (lines 43-52)**
Replace the tiny 6px flex dot with inline-styled `display: inline-block` + `border-radius: 50%` to avoid flex rendering issues.

**3. `SubSection` -- Vertical bar indicator (lines 74-82)**
Replace the small rounded bar with explicit inline-styled dimensions.

**4. `SectionTitle` -- Icon container (lines 31-41)**
Apply inline styles to the icon circle container for reliable rendering.

### What Will NOT Change
- No changes to the PDF generation logic in `PharmacyDocumentation.tsx`
- No changes to page layout, colors, or content
- The on-screen appearance will remain identical

### Technical Approach
For each small element, convert from:
```
className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center"
```
To:
```
style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: 11, lineHeight: '20px', textAlign: 'center', display: 'inline-block' }}
```

This uses hardcoded colors (already the project convention for pdf-rendered docs) and avoids flexbox on small elements entirely.

