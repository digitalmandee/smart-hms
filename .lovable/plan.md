

## Fix: Remove CSS Rule That Kills Mobile Container Padding

### Root Cause (FOUND)

In `src/index.css` at **lines 879-882**, inside a `@media (max-width: 767px)` block, there is this rule:

```css
.container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

This uses `!important` to force-remove ALL horizontal padding from every `.container` element on mobile. No matter what Tailwind generates (32px default), this rule wins because of `!important`. This is why every change we made had zero effect.

### The Fix

**Delete lines 878-882** from `src/index.css` (the "Compact spacing on mobile" `.container` override). This single change will restore the 32px container padding on mobile across the entire landing page.

| File | Change |
|------|--------|
| `src/index.css` (lines 878-882) | Remove the `.container { padding-left: 0 !important; padding-right: 0 !important; }` rule |

No other files need to change. The `container mx-auto` class already on all 15 landing components will correctly apply 32px padding once this override is gone.

### Why This Existed

This was likely added for the internal app pages (dashboard, OPD, billing, etc.) where full-width layouts are desired on mobile. But it also affects the public landing page since both use the `.container` class.

### Risk Check

Internal app pages use `DashboardLayout` with their own padding structure (sidebar + content area), so removing this rule will not affect them -- they don't rely on the `.container` class for their layout.

