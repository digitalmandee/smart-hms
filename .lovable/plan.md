
# Real Screenshots and Currency Fix for Pharmacy Documentation

## Overview
Replace CSS mockups in the documentation with real screenshots captured from the live pharmacy module, and remove all Indian currency symbols (₹ and Rs.) from the documentation mockups.

## Screenshots Captured
I successfully logged in as the independent pharmacy user and captured screenshots of these pages:

| Page | Screenshot Source |
|---|---|
| Dashboard | `/app/pharmacy` -- KPI cards, alerts, quick actions, sales summary |
| POS Terminal | `/app/pharmacy/pos` -- Cart, customer fields, discount buttons, checkout |
| Inventory | `/app/pharmacy/inventory` -- Medicine list with batch, qty, expiry, prices |
| Medicine Catalog | `/app/pharmacy/medicines` -- Name, category, strength, manufacturer |
| Reports Hub | `/app/pharmacy/reports` -- Date range, KPI cards, 29 report cards |
| Returns | `/app/pharmacy/returns` -- KPI cards, find transaction, recent returns |
| Stock Movements | `/app/pharmacy/stock-movements` -- Filters, movement log with types |
| Settings | `/app/pharmacy/settings` -- Thresholds, receipt config, POS behavior |

## Changes

### 1. Save Screenshots as Static Assets
Create screenshot images in `public/docs/pharmacy/` folder by navigating to each pharmacy page and saving the browser screenshots as PNG files.

### 2. Currency Symbol Removal (Documentation Mockups)
Remove all `₹` symbols from the documentation mockup components. Replace with generic values or remove currency prefix entirely:

**Files with ₹ to fix:**
- `DocPOSLayout.tsx` -- Product prices (₹2.50, ₹5.00, etc.) changed to plain numbers (2.50, 5.00)
- `DocPOSPayment.tsx` -- Total Due (₹1,250.00), Cash Received (₹1,500.00), Change Due (₹250.00)
- `DocSessions.tsx` -- Total Sales (₹24,580), Cash Diff (₹0.00)
- `DocReturns.tsx` -- Item prices (₹5.00, ₹3.75)

### 3. Update Documentation Components with Real Screenshots
For each documentation page that currently has CSS mockups, replace the `ScreenMockup` component with an `<img>` tag pointing to the saved screenshot. The image will be styled to fit within the A4 page with a border and rounded corners.

**Components to update:**
- `DocDashboard.tsx` -- Replace InfoCard mockups with dashboard screenshot
- `DocPOSLayout.tsx` -- Replace CSS POS layout with POS terminal screenshot
- `DocPOSPayment.tsx` -- Keep or supplement with POS payment screenshot
- `DocInventory.tsx` -- Replace MockupTable with inventory page screenshot
- `DocReturns.tsx` -- Replace CSS return flow with returns page screenshot
- `DocReports.tsx` -- Replace report card mockups with reports hub screenshot
- `DocSessions.tsx` -- Replace session summary with stock movements screenshot
- `DocSettings.tsx` -- Add settings page screenshot

### 4. Screenshot Styling for Print
Each screenshot image will use these styles for consistent A4 rendering:
- `max-width: 100%` and `max-height: 200px` to fit within the page alongside text
- `border: 1px solid` with emerald accent
- `border-radius: 8px` and subtle shadow
- `object-fit: contain` for proper scaling
- Print-safe: no background gradients

## Technical Notes
- Screenshots are saved as static PNGs in the `public/` directory -- no database storage needed
- Images are referenced via relative paths (`/docs/pharmacy/dashboard.png`)
- Print mode renders images inline -- no external loading required
- The currency removal is documentation-only; the actual app currency format is separate
