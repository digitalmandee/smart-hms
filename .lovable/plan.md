

# Fix PDF Rendering — Replace CSS Variables with Hardcoded Colors

## Problem
Two rendering issues are causing broken content in the downloaded PDF:

1. **CSS custom properties**: Tailwind classes like `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-background`, `border-border` all resolve to `hsl(var(--something))` at runtime. `html2canvas` cannot reliably resolve CSS custom properties, causing text to become invisible and backgrounds to render incorrectly across all 18 pages.

2. **Dynamic Tailwind classes**: The `InfoCard` component builds class names with template literals (e.g., ``border-${color}-200``). Tailwind's JIT compiler cannot detect these at build time, so the CSS rules are never generated. These elements get no styling at all.

## Solution
Replace all CSS-variable-based Tailwind classes in the pharmacy-docs components with hardcoded color values. Since these components are **only used for documentation PDF generation** (not the main app UI), using explicit colors is safe and ensures reliable rendering.

## Changes

### 1. `DocPageWrapper.tsx` — Fix all shared components

| CSS Variable Class | Hardcoded Replacement |
|---|---|
| `text-foreground` | `text-gray-900` |
| `text-muted-foreground` | `text-gray-500` |
| `bg-card` | `bg-white` |
| `bg-muted` | `bg-gray-100` |
| `border-border` | `border-gray-200` |
| `border-muted` | `border-gray-200` |

Fix `InfoCard` dynamic classes by replacing template literals with hardcoded emerald classes (since all InfoCards in the docs use emerald).

### 2. All 18 Doc Component Files

Replace every instance of CSS-variable Tailwind classes with hardcoded equivalents:
- `DocCoverPage.tsx` — `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-muted`, `bg-background`
- `DocTableOfContents.tsx` — `text-foreground`, `text-muted-foreground`, `border-muted`
- `DocDashboard.tsx` through `DocSettings.tsx` — same pattern in all files

### 3. Files to edit (19 total)
- `src/components/pharmacy-docs/DocPageWrapper.tsx`
- `src/components/pharmacy-docs/DocCoverPage.tsx`
- `src/components/pharmacy-docs/DocTableOfContents.tsx`
- `src/components/pharmacy-docs/DocDashboard.tsx`
- `src/components/pharmacy-docs/DocMedicineCatalog.tsx`
- `src/components/pharmacy-docs/DocInventory.tsx`
- `src/components/pharmacy-docs/DocStockEntry.tsx`
- `src/components/pharmacy-docs/DocPOSLayout.tsx`
- `src/components/pharmacy-docs/DocPOSCart.tsx`
- `src/components/pharmacy-docs/DocPOSPayment.tsx`
- `src/components/pharmacy-docs/DocSessions.tsx`
- `src/components/pharmacy-docs/DocDispensing.tsx`
- `src/components/pharmacy-docs/DocReturns.tsx`
- `src/components/pharmacy-docs/DocStockMovements.tsx`
- `src/components/pharmacy-docs/DocWarehouse.tsx`
- `src/components/pharmacy-docs/DocProcurement.tsx`
- `src/components/pharmacy-docs/DocReports.tsx`
- `src/components/pharmacy-docs/DocReportsPage2.tsx`
- `src/components/pharmacy-docs/DocSettings.tsx`

## Technical Notes
- Changes are isolated to the `src/components/pharmacy-docs/` directory only
- No changes to the main application components or themes
- The on-screen documentation appearance will look nearly identical (same gray tones)
- `html2canvas` handles standard CSS color values (like `#1f2937`, Tailwind's `gray-900`) perfectly
- This eliminates the CSS variable dependency entirely for PDF rendering

