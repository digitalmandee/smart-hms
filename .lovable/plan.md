

# Consultation Page Revamp - 2-Column Layout

## Problem

The current 3-column layout (`260px | flex | 280px`) causes persistent overflow issues. The 280px right column is too narrow for the Vitals form inputs. Previous Visits at the bottom is invisible when there are no visits and wasted space.

## New Layout: 2-Column Design

Remove the right sidebar entirely. Move Vitals and Previous Visits into more natural positions:

```text
+------------------+--------------------------------------------+
| Patient Info     | [Vitals Bar - horizontal badges/expand]    |
| (260px sidebar)  |--------------------------------------------|
|                  | [Clinical] [Prescription] [Labs] [Tabeebi] |
| Allergies        |                                            |
| Chronic          |   Tab Content Area                         |
| Medications      |                                            |
|                  |                                            |
| Previous Visits  |--------------------------------------------|
| (collapsible)    | [Save Draft] [Recommend Surgery] [Complete]|
+------------------+--------------------------------------------+
```

### Changes

**1. ConsultationPage.tsx - Switch to 2-column layout**
- Change grid from `lg:grid-cols-[260px_1fr_280px]` to `lg:grid-cols-[260px_1fr]`
- Remove the right sidebar column entirely
- Move `CompactVitals` to the top of the center column (above tabs), giving it full width
- Move `PreviousVisits` into the left sidebar below patient info (instead of full-width bottom section)

**2. VitalsForm.tsx - Use 4-column grid for wider space**
- Since vitals now lives in the main content area (not 280px sidebar), change grid to `grid-cols-2 md:grid-cols-4` so all 8 vitals fit in 2 rows on desktop
- Each input group stays compact with small inputs

**3. CompactVitals.tsx - No structural changes**
- Already works well with badge view (collapsed) and form view (expanded)
- Will naturally fit better in the wider center column

**4. PreviousVisits.tsx - Compact sidebar version**
- Move into left sidebar as a collapsible section using Collapsible component
- Show last 3 visits as small clickable cards (date + diagnosis summary)
- Each card links to the consultation detail page
- When no visits exist, render nothing (already does this)

## Technical Details

| File | Change |
|------|--------|
| `ConsultationPage.tsx` L241 | Grid: `lg:grid-cols-[260px_1fr]`, remove right sidebar div (L396-402) |
| `ConsultationPage.tsx` L276 | Insert `CompactVitals` above `Tabs` in center column |
| `ConsultationPage.tsx` L243 | Move `PreviousVisits` into left sidebar after patient info |
| `ConsultationPage.tsx` L405-419 | Remove bottom `PreviousVisits` section |
| `VitalsForm.tsx` L60 | Change grid to `grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2` for wider layout |
| `PreviousVisits.tsx` | Add `compact` prop: when true, render as vertical list of small visit cards for sidebar use |

