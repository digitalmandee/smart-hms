

# Fix Icons and Numbers Rendering in PDF Download

## Problem
The `html2canvas` library cannot properly render inline SVG elements. Every Lucide React icon (Clock, CheckCircle, AlertTriangle, BarChart3, etc.) and the HealthOS24 logo SVG appear broken, empty, or invisible in the downloaded PDF. This affects all 18 documentation pages.

## Root Cause
Lucide React icons render as inline `<svg>` elements in the DOM. The `html2canvas` library has well-documented limitations with SVG rendering -- it often fails to capture them, producing blank boxes or missing graphics.

## Solution
Replace all Lucide SVG icons in the documentation components with Unicode/emoji text equivalents that `html2canvas` can reliably capture. The visual appearance on-screen will remain clean and professional.

## Changes

### 1. Update `DocPageWrapper.tsx` -- SectionTitle and InfoCard
Replace the `icon` prop (currently receives Lucide SVG components) with a `string` type that accepts emoji/Unicode characters instead.

| Component | Before (SVG) | After (Unicode) |
|---|---|---|
| SectionTitle icon | `<LayoutDashboard>` | "📊" |
| InfoCard icon | `<Clock>`, `<CheckCircle>` | "⏱", "✓" |

### 2. Update all 17 Doc components to use emoji icons

| File | SVG Icon | Replacement |
|---|---|---|
| DocDashboard.tsx | LayoutDashboard, Clock, CheckCircle, AlertTriangle, Calendar | 📊, ⏱, ✅, ⚠, 📅 |
| DocMedicineCatalog.tsx | Pill | 💊 |
| DocInventory.tsx | Package | 📦 |
| DocStockEntry.tsx | PackagePlus | 📥 |
| DocPOSLayout.tsx | Monitor | 🖥 |
| DocPOSCart.tsx | ShoppingCart | 🛒 |
| DocPOSPayment.tsx | CreditCard | 💳 |
| DocSessions.tsx | Clock | ⏱ |
| DocDispensing.tsx | ClipboardList | 📋 |
| DocReturns.tsx | RotateCcw | 🔄 |
| DocStockMovements.tsx | ArrowRightLeft | ↔ |
| DocWarehouse.tsx | Warehouse | 🏭 |
| DocProcurement.tsx | FileText | 📄 |
| DocReports.tsx | BarChart3 | 📊 |
| DocReportsPage2.tsx | BarChart3 | 📊 |
| DocSettings.tsx | Settings | ⚙ |
| DocTableOfContents.tsx | BookOpen | 📖 |

### 3. Update `DocPageWrapper.tsx` component signatures
- Change `SectionTitle` icon prop from `React.ReactNode` to `string` and render it as text inside the styled div
- Change `InfoCard` icon prop from `React.ReactNode` to `string` and render as text
- This ensures no SVG elements exist anywhere in the print-rendered pages

### 4. Fix HealthOS24Logo in header/footer
The `HealthOS24Logo` component also uses an inline SVG. For the documentation pages, replace it with a simple text-based logo: "HealthOS 24" styled with the same emerald branding but using pure text (no SVG).

## Technical Details
- All changes are limited to `src/components/pharmacy-docs/` directory
- No changes to the actual application components
- The `html2canvas` capture settings remain the same
- Emojis render consistently across browsers and are fully supported by `html2canvas`
- The on-screen documentation will look slightly different (emoji vs SVG icons) but equally professional

