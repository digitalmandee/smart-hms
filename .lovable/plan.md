

## Fix RTL Icon Alignment in Sidebar

### Problem
In Arabic/Urdu (RTL languages), the sidebar menu icons appear on the **left** side of each row instead of the **right** (start) side. The `dir` attribute is set on the DashboardLayout wrapper, but the sidebar `<aside>` element may not be inheriting it properly.

### Fix
Add explicit `dir` attribute to the `<aside>` element in `DynamicSidebar.tsx` so RTL direction is enforced within the sidebar:

**File: `src/components/DynamicSidebar.tsx`**
- Add `dir={isRTL ? "rtl" : "ltr"}` to the `<aside>` element (line ~1117)
- The `isRTL` variable is already available in the component (line 943)

This single change ensures all flex containers inside the sidebar (menu items with icons + text) respect RTL direction, placing icons on the right and text flowing left-to-right from there.

