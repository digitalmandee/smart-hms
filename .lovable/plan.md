

# Fix Consultation UI: Tabeebi Branding + Vitals Overflow

## Issues

1. **"AI Assistant" tab** should read **"Tabeebi"** with the DoctorAvatar icon instead of the Bot icon
2. **Vitals panel overflows** the 280px right column when expanded -- the VitalsForm uses `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` which is far too wide for a sidebar

## Changes

### 1. Rename AI Assistant tab to Tabeebi

**File: `src/pages/app/opd/ConsultationPage.tsx`**

- Change tab label from "AI Assistant" to "Tabeebi"
- Replace `Bot` icon import with `DoctorAvatar` component (or use the Stethoscope icon already imported for consistency)
- Update the comment from "AI Assistant Tab" to "Tabeebi Tab"

### 2. Fix Vitals overflow in the right sidebar

**File: `src/components/consultation/VitalsForm.tsx`**

- Change the grid from `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` to `grid-cols-2` so it always stays 2-column and fits inside the 280px sidebar
- Reduce the Card header title from `text-lg` to `text-sm` to match the compact sidebar style
- Make inputs slightly narrower to prevent overflow

**File: `src/components/consultation/CompactVitals.tsx`**

- Default to collapsed (badges view) instead of expanded when there are no nurse vitals, since the expanded form overflows the sidebar

## Technical Details

| File | Change |
|------|--------|
| `src/pages/app/opd/ConsultationPage.tsx` | Line 305-306: Replace `Bot` icon + "AI Assistant" text with Stethoscope + "Tabeebi" |
| `src/components/consultation/VitalsForm.tsx` | Line 74: Change grid to `grid-cols-2 gap-3` to fit 280px column |
| `src/components/consultation/CompactVitals.tsx` | Line 29: Default `expanded` to `false` always so vitals start collapsed as badges |

