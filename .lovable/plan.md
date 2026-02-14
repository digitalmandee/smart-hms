

# Enhanced Pharmacy Documentation -- UI Mockups and Print Fix

## Problems Identified

### 1. Empty Pages During Download (36 pages instead of 18)
The CSS uses `min-height: 297mm` for both screen and print modes. During printing, the browser renders each page at minimum A4 height, but `page-break-after: always` forces a new page after each element. If any page's content slightly overflows, the browser creates a second blank page for the overflow. This doubles the page count from 18 to ~36.

**Fix:** In print mode, switch from `min-height: 297mm` to `height: 297mm` with `overflow: hidden`, so each component is exactly one A4 page with no overflow triggering extra blank pages.

### 2. Text-Heavy UI -- No Visual Representation
Currently every page is bullet lists and text. For a professional documentation guide, key screens should include inline UI mockups that visually show what the user will see.

**Fix:** Add a `ScreenMockup` component and inline visual diagrams for 8 key pages. These are styled div-based illustrations (not images) that render reliably in both screen and print/PDF.

---

## Changes

### File: `src/components/pharmacy-docs/DocPageWrapper.tsx`
- Add new `ScreenMockup` component -- a bordered container styled like an app window with a title bar, used to show visual representations of screens
- Add `InfoCard` component -- a compact card with icon, label, and value for showing KPI-style visuals
- Add `MockupTable` component -- a mini data table for showing inventory/transaction list mockups

### File: `src/pages/PharmacyDocumentation.tsx`
- Fix print CSS: change `.proposal-page` in `@media print` from `min-height: 297mm` to `height: 297mm; overflow: hidden`
- This ensures exactly 18 pages in the PDF output

### File: `src/components/pharmacy-docs/DocDashboard.tsx`
- Add a row of 4 KPI mockup cards (Pending Rx: 12, Dispensed: 45, Low Stock: 8, Expiring: 3) using `InfoCard`
- Visual representation of what the dashboard looks like

### File: `src/components/pharmacy-docs/DocPOSLayout.tsx`
- Add a `ScreenMockup` showing the POS terminal layout: left panel (product grid with search bar) and right panel (cart with totals)
- Compact visual diagram of the split-screen POS interface

### File: `src/components/pharmacy-docs/DocPOSPayment.tsx`
- Add a visual mockup of the payment modal showing: total amount, payment method buttons (Cash/Card/Wallet), cash input with Exact button, and change display

### File: `src/components/pharmacy-docs/DocInventory.tsx`
- Add a `MockupTable` showing a sample inventory view: 3-4 rows with Medicine, Batch, Qty, Expiry, Status columns

### File: `src/components/pharmacy-docs/DocReturns.tsx`
- Add a visual mockup of the return flow: receipt lookup field, selected items with checkboxes, refund method selector

### File: `src/components/pharmacy-docs/DocReports.tsx`
- Add a visual mockup of the Reports Hub card grid showing 4 sample report cards with icons

### File: `src/components/pharmacy-docs/DocWarehouse.tsx`
- Add a visual diagram of the transfer workflow: 4 connected steps (Request, Approve, Dispatch, Receive) with status indicators

### File: `src/components/pharmacy-docs/DocSessions.tsx`
- Add a mockup of a session summary card showing sales total, transaction count, and cash reconciliation

---

## Visual Mockup Style

All mockups will use:
- Rounded border with subtle shadow (`border border-emerald-200 rounded-lg`)
- Mini title bar with dots (like a browser window chrome)
- Compact layout that fits within the A4 page alongside existing text content
- Emerald/teal accent colors consistent with the pharmacy brand
- Print-safe (no background gradients, uses borders and text)

---

## Files Modified Summary

| File | Changes |
|---|---|
| `src/pages/PharmacyDocumentation.tsx` | Fix print CSS to prevent empty pages |
| `src/components/pharmacy-docs/DocPageWrapper.tsx` | Add ScreenMockup, InfoCard, MockupTable components |
| `src/components/pharmacy-docs/DocDashboard.tsx` | Add KPI card mockups |
| `src/components/pharmacy-docs/DocPOSLayout.tsx` | Add POS terminal layout mockup |
| `src/components/pharmacy-docs/DocPOSPayment.tsx` | Add payment modal mockup |
| `src/components/pharmacy-docs/DocInventory.tsx` | Add inventory table mockup |
| `src/components/pharmacy-docs/DocReturns.tsx` | Add return flow mockup |
| `src/components/pharmacy-docs/DocReports.tsx` | Add report cards mockup |
| `src/components/pharmacy-docs/DocWarehouse.tsx` | Add transfer workflow diagram |
| `src/components/pharmacy-docs/DocSessions.tsx` | Add session summary mockup |

