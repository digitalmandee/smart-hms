

## Fix RTL Layout in Both Sidebars

### Problem
The `dir="rtl"` on the `<aside>` is not reliably propagating through Radix UI components (Button, Collapsible). Icons remain on the left in Arabic/Urdu despite the `dir` attribute being set.

### Solution
Instead of relying solely on `dir` attribute inheritance, explicitly pass `isRTL` into menu item components and use `flex-row-reverse` to force correct item ordering. This is more reliable across component boundaries.

### Changes

**1. `src/components/DynamicSidebar.tsx`** — RecursiveMenuItem
- Add `isRTL` prop to `RecursiveMenuItemProps`
- Pass `isRTL` from parent `DynamicSidebar` down through recursive calls
- Add `flex-row-reverse` to both Button elements (parent with children + leaf) when `isRTL`
- Fix logo header row: add `flex-row-reverse` when RTL
- Fix user footer row: add `flex-row-reverse` when RTL

**2. `src/components/mobile/MobileSideMenu.tsx`** — MobileMenuItem
- Pass `isRTL` prop to `MobileMenuItem`
- Add `flex-row-reverse` to the flex containers in parent items and leaf Link items when RTL
- Fix profile header and footer sections for RTL

### Key Pattern
```tsx
// Before (unreliable dir inheritance):
<Button className="w-full justify-start gap-3">
  <Icon />
  <span>{text}</span>
  <ChevronDown />
</Button>

// After (explicit RTL handling):
<Button className={cn("w-full justify-start gap-3", isRTL && "flex-row-reverse")}>
  <Icon />
  <span className="flex-1 text-start">{text}</span>
  <ChevronDown />
</Button>
```

With `flex-row-reverse`, the visual order becomes: Icon (right) → Text (middle) → Chevron (left) — exactly matching the user's expected "Icon right, chevron left" layout.

