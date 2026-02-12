

# POS Terminal UI Fixes

## Issues Found

1. **Today's Sales widget clipped at bottom** -- The `POSTodaySummary` component at the bottom of the left panel gets cut off because the ScrollArea above it doesn't leave enough room. The widget needs guaranteed visibility.

2. **Custom discount input truncated** -- The custom `%` input in the Quick Discount row is too narrow (`flex-1` competing with 4 buttons), causing the `C` and `%` to overlap/clip.

3. **Category pills cut off without indicator** -- "Vitamins &..." gets truncated at the right edge. Users can't tell there are more categories to scroll to. Need a fade/gradient hint on the right edge.

4. **Large empty space on left panel** -- The left panel has excessive whitespace between Patient Lookup and Today's Sales because the ScrollArea stretches but content doesn't fill it.

5. **Cart empty state oversized** -- The empty cart icon (`h-10 w-10`) with large padding (`py-12`) wastes space in the right panel.

---

## Fixes

### 1. Today's Sales Widget (POSTodaySummary / POSTerminalPage)
- Ensure `POSTodaySummary` is rendered outside the `ScrollArea` with `shrink-0` so it always stays visible at the bottom of the left panel, never scrolled away or clipped.

### 2. Custom Discount Input (POSCart.tsx)
- Give the custom `%` input a fixed minimum width (`w-16` or `w-20`) instead of `flex-1` so it doesn't get crushed by the 4 quick discount buttons.
- Reduce button flex to accommodate the input better.

### 3. Category Pills Scroll Hint (POSCategoryFilter.tsx)
- Add a right-edge fade gradient overlay to indicate more categories are available beyond the visible area.
- Remove the `.slice(0, 6)` limit so all categories are accessible via horizontal scroll.

### 4. Left Panel Spacing (POSTerminalPage.tsx)
- The left panel layout is already correct (`flex flex-col` with `ScrollArea flex-1`), but the inner content padding can be tightened. Reduce `space-y-4` to `space-y-3` and inner padding from `p-4` to `p-3` to make it more compact.

### 5. Cart Empty State (POSCart.tsx)
- Reduce empty state padding from `py-12` to `py-8` and icon from `h-10 w-10` to `h-8 w-8` for a more compact look.

---

## Files Modified

| File | Change |
|---|---|
| `src/components/pharmacy/POSCart.tsx` | Reduce empty cart padding; fix custom discount input width |
| `src/components/pharmacy/POSCategoryFilter.tsx` | Remove `.slice(0, 6)` cap; add right-edge fade gradient for scroll hint |
| `src/pages/app/pharmacy/POSTerminalPage.tsx` | Tighten left panel inner spacing (`p-3`, `space-y-3`) |

