
# Fix: RTL Layout Not Flipping — Two Root Causes

## What the Evidence Shows

The RPC call works perfectly:
- `POST /rpc/set_org_language` returns **204** (success)
- The DB response confirms `"default_language":"ar"`, `"supported_languages":["en","ur","ar"]`
- The language switcher button correctly updates to show "عربي"

But the layout never flips to RTL. Two bugs cause this:

---

## Bug 1 — `RTLDirectionSetter` is Defined But Never Rendered

In `src/App.tsx`, the `RTLDirectionSetter` component is defined (lines 485–495) with the correct logic:
```ts
const dir = ['ar', 'ur'].includes(default_language) ? 'rtl' : 'ltr';
document.documentElement.dir = dir;
```

But searching the entire codebase for `<RTLDirectionSetter` returns **zero results** — it is never placed in the JSX tree. Because it requires `CountryConfigProvider` context (which only wraps `/app/*` routes at line 568), it must be rendered **inside** that provider.

**Fix**: Add `<RTLDirectionSetter />` inside the `CountryConfigProvider` in App.tsx, just before `<DashboardLayout />`:
```tsx
<CountryConfigProvider>
  <RTLDirectionSetter />
  <DashboardLayout />
</CountryConfigProvider>
```

---

## Bug 2 — `DashboardLayout` Sidebar is Hardcoded LTR

Even after `dir="rtl"` is set on `<html>`, the sidebar stays on the left because:

- Line 51: `<div className="flex h-screen overflow-hidden bg-background">` — flex row always puts sidebar first (left)
- Line 72: `<SheetContent side="left" ...>` — mobile sidebar always slides from left
- Line 67: `className="lg:hidden fixed top-4 left-4 z-40"` — hamburger menu hardcoded to left

**Fix in `src/layouts/DashboardLayout.tsx`**:

1. Make the flex container direction-aware: when RTL, sidebar should be on the right. Use `useIsRTL()` hook from `src/lib/i18n/index.ts` which already works correctly.

2. Change the `SheetContent` side to be dynamic: `side={isRTL ? "right" : "left"}`

3. Change the hamburger button position: `className={isRTL ? "lg:hidden fixed top-4 right-4 z-40" : "lg:hidden fixed top-4 left-4 z-40"}`

4. Change the `flex-row` to `flex-row-reverse` when RTL so the sidebar appears on the right side naturally.

---

## Files to Change

| File | Change |
|------|--------|
| `src/App.tsx` | Add `<RTLDirectionSetter />` inside `CountryConfigProvider` (1 line) |
| `src/layouts/DashboardLayout.tsx` | Use `useIsRTL()` to flip sidebar side, hamburger position, and flex direction |

---

## Result After Fix

- Clicking Arabic in the language dropdown:
  - Saves to DB (already working)
  - `RTLDirectionSetter` fires, sets `document.documentElement.dir = 'rtl'`
  - `DashboardLayout` detects RTL via `useIsRTL()`, moves sidebar to the right, hamburger to top-right
  - Page content flows right-to-left
- Clicking English → layout returns to LTR with sidebar on left
- Urdu behaves identically to Arabic (RTL)
