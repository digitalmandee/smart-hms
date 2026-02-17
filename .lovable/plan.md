

# Consultation Page UI Fixes

## Issues

1. **Vitals double-card nesting**: When expanded, `CompactVitals` (a Card) renders `VitalsForm` (another Card) inside it, creating ugly nested borders
2. **Previous Visits stuck in narrow sidebar**: Currently in the 260px left column with a tiny 300px scroll area -- hard to read and wasted space
3. **Previous Visits not clickable/viewable**: Visit cards need to be fully clickable to open the consultation

## Changes

### 1. Fix Vitals double-card nesting

**File: `src/components/consultation/CompactVitals.tsx`**

- When expanded, render the VitalsForm fields directly (without the outer Card wrapper from VitalsForm)
- Pass a new prop `embedded={true}` to VitalsForm so it skips its Card wrapper and renders only the grid of inputs

**File: `src/components/consultation/VitalsForm.tsx`**

- Add an `embedded` prop (default false)
- When `embedded={true}`, skip the Card/CardHeader/CardContent wrappers and render just the grid directly
- This eliminates the double-card nesting

### 2. Move Previous Visits below the 3-column grid

**File: `src/pages/app/opd/ConsultationPage.tsx`**

- Remove `PreviousVisits` from the left sidebar (lines 273-286)
- Add it as a full-width section below the 3-column grid, after the grid closing div
- This gives it the full page width for better readability

### 3. Make Previous Visits full-width and clickable

**File: `src/components/consultation/PreviousVisits.tsx`**

- Remove the fixed `h-[300px]` ScrollArea -- let it show all visits naturally
- Make each visit card fully clickable (wrap in Link to `/app/opd/consultations/{id}`)
- Use a horizontal layout for visits (grid of cards) instead of vertical stack, since it now has full width
- Change title size from `text-lg` to `text-sm` for consistency

## Technical Summary

| File | Change |
|------|--------|
| `src/components/consultation/VitalsForm.tsx` | Add `embedded` prop to skip Card wrapper |
| `src/components/consultation/CompactVitals.tsx` | Pass `embedded={true}` to VitalsForm when expanded |
| `src/pages/app/opd/ConsultationPage.tsx` | Move PreviousVisits below the 3-column grid |
| `src/components/consultation/PreviousVisits.tsx` | Remove fixed height, make visits clickable cards, use horizontal grid layout |

