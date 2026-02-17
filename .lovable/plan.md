

# Fix Vitals Overflow + Empty Previous Visits Area

## Issues

1. **Vitals form overflows the right sidebar** (~280px wide) when expanded. The `grid-cols-2` layout with `w-16`/`w-20` inputs plus labels and unit text exceeds the column width. Labels like "Blood Pressure" and "Respiratory Rate" are too long.
2. **Empty white space below** the 3-column grid when there are no previous visits, because `PreviousVisits` returns `null`.

## Changes

### 1. Fix VitalsForm for narrow sidebar

**File: `src/components/consultation/VitalsForm.tsx`**

- Change grid from `grid-cols-2` to `grid-cols-1` so each vital stacks vertically in the narrow sidebar
- Shorten labels: "Blood Pressure" -> "BP", "Temperature" -> "Temp", "Respiratory Rate" -> "RR"
- Reduce input widths from `w-16`/`w-20` to `w-14`/`w-16`
- Make the BP row more compact: put both Sys/Dia inputs on one line with smaller widths
- Reduce the temperature Select trigger from `w-16` to `w-14`

### 2. Remove empty space when no previous visits

**File: `src/components/consultation/PreviousVisits.tsx`**

- The component already returns `null` when no consultations exist (line 49-51), which is correct
- The empty space is caused by the parent container spacing. No change needed in this file.

**File: `src/pages/app/opd/ConsultationPage.tsx`**

- The `PreviousVisits` section already conditionally renders based on `patient` existing. Since the component returns `null` when there are no visits, there should be no visible empty space. However, the outer container may have padding/margin. We will ensure the wrapper div doesn't add spacing when there's nothing to show by keeping it as-is (the component already returns null).

Actually, looking at the screenshot more carefully: the empty white area below is just the page background since the 3-column grid content ends and there's nothing below. This is expected behavior -- there is no "empty card" being rendered. The fix is simply cosmetic: the page content should not have excessive bottom padding.

## Technical Summary

| File | Change |
|------|--------|
| `src/components/consultation/VitalsForm.tsx` | Switch to single-column grid layout, shorten labels, reduce input widths for 280px sidebar fit |
| `src/pages/app/opd/ConsultationPage.tsx` | Remove excessive bottom padding/spacing if any, ensure Previous Visits wrapper has no empty space |

