

# Pharmacy Module Documentation -- Downloadable Guide

## Overview
Create a comprehensive, downloadable A4 documentation document for the standalone Pharmacy module, following the same pattern as the existing Pricing Proposal (`/pricing-proposal`). It will be accessible at `/pharmacy-documentation` and consist of approximately 15-18 pages covering every feature in detail.

## Document Structure (Pages)

### Page 1: Cover Page
- "HealthOS 24 Pharmacy Module" title
- "Complete Operations Guide" subtitle
- Version, date, and branding

### Page 2: Table of Contents
- Numbered section listing with page references for all chapters

### Page 3: Dashboard Overview
- Explanation of KPI cards (Pending Prescriptions, Dispensed Today, Low Stock, Expiring Soon)
- Quick Actions (Medicine Catalog, Add Stock, View Inventory)
- Daily Sales Summary widget
- Prescription Queue preview
- Mobile vs Desktop view behavior

### Page 4: Medicine Catalog & Categories
- Adding/editing medicines (name, generic name, category, dosage form, strength)
- Category management (create, organize)
- Medicine search and filtering

### Page 5: Inventory Management
- Stock levels, batch tracking, expiry dates
- Search and filter by category, stock status (Low Stock, Expiring)
- Inventory adjustment modal (manual corrections)
- Reorder level alerts
- FIFO/FEFO dispensing logic

### Page 6: Stock Entry (GRN)
- Adding new stock with batch number, expiry, unit price, selling price
- Supplier assignment
- Linking to purchase orders

### Page 7: POS Terminal (Part 1 -- Layout & Product Search)
- Full-screen terminal layout (left panel: products, right panel: cart)
- Barcode scanning input
- Product search with category filters
- Recent products quick-add
- Keyboard shortcuts (F2 Search, F4 Hold, F12 Checkout, Esc)

### Page 8: POS Terminal (Part 2 -- Cart & Checkout)
- Cart management (quantity, line discounts, remove items)
- Patient linking (search patient, link MR number)
- Prescription loading from OPD/IPD queue
- OT Medication queue integration
- Order Review screen
- Hold/Recall transactions

### Page 9: POS Terminal (Part 3 -- Payment & Receipt)
- Payment modal (Cash, Card, Mobile Wallet, Split payments)
- Exact amount button, quick cash denominations
- Credit/Pay Later option with due date
- Post to Patient Profile (IPD billing integration)
- Receipt printing and preview
- Configurable receipt header/footer

### Page 10: POS Sessions & Transaction History
- Session management (open/close daily sessions)
- Transaction listing with filters (date, status, payment method)
- Transaction detail view with itemized breakdown
- Receipt reprint capability

### Page 11: Prescription Queue & Dispensing
- Real-time OPD/IPD prescription queue
- Priority flagging
- Dispensing workflow (select batches, verify quantities)
- Batch selection with FIFO/FEFO
- Send to POS for billing
- Prescription history log

### Page 12: Returns & Refunds
- Search transaction by receipt number
- Select items to return (partial or full)
- Return reason documentation
- Refund method (Cash Refund or Patient Credit)
- Automatic inventory restocking
- Returns tracking with unique RET-XXXX numbers

### Page 13: Stock Movements & Alerts
- Unified movement log (GRN, Sale, Dispense, Adjustment, Return, Transfer In/Out, Expired, Damaged, Opening)
- Movement type filtering and date range
- Stock Alerts page (Low stock notifications, Expiry warnings)
- Configurable thresholds in Settings

### Page 14: Warehouse Management
- Creating and managing multiple warehouses
- Inter-store transfers (Request, Approve, Dispatch, Receive)
- Transfer tracking with TRF-XXXX numbers
- Store-aware inventory isolation

### Page 15: Procurement (PO & Suppliers)
- Supplier/vendor management
- Purchase Order creation and lifecycle
- GRN processing and invoice matching
- Indent-to-PO workflow from sub-stores

### Page 16-17: Reports Hub (29 Reports)
- **Sales Reports** (11): Daily Sales, Hourly Analysis, Sales by Category, Payment Methods, Discount Analysis, Monthly Comparison, Top Products, Customer Sales, Transaction Log, Refund Rate, Basket Size
- **Inventory Reports** (9): Stock Valuation, Expiry Report, Low Stock/Reorder, Dead Stock, Stock Movements, Batch-wise Stock, Category Distribution, Stock Aging, Inventory Turnover
- **Financial Reports** (5): Profit Margin, Returns & Refunds, Credit Sales, Daily Cash Summary, Tax Collection
- **Procurement Reports** (2): Supplier Purchases, PO Status Pipeline
- **Operational Reports** (2): Cashier Performance, Peak Hours Heatmap
- Export capabilities (CSV download, print)

### Page 18: Settings & Configuration
- Default tax rate
- Receipt header and footer customization
- Low stock threshold
- Expiry alert days
- Customer name requirement toggle
- Held transactions toggle
- Auto-print receipt toggle
- Controlled substance prescription requirement

## Technical Implementation

### New Files to Create
| File | Purpose |
|---|---|
| `src/pages/PharmacyDocumentation.tsx` | Main page with toolbar, pagination, print/download (mirrors `PricingProposal.tsx` pattern) |
| `src/components/pharmacy-docs/DocCoverPage.tsx` | Cover page |
| `src/components/pharmacy-docs/DocTableOfContents.tsx` | TOC page |
| `src/components/pharmacy-docs/DocDashboard.tsx` | Dashboard overview |
| `src/components/pharmacy-docs/DocMedicineCatalog.tsx` | Medicine & categories |
| `src/components/pharmacy-docs/DocInventory.tsx` | Inventory management |
| `src/components/pharmacy-docs/DocStockEntry.tsx` | Stock entry / GRN |
| `src/components/pharmacy-docs/DocPOSLayout.tsx` | POS Terminal part 1 |
| `src/components/pharmacy-docs/DocPOSCart.tsx` | POS Terminal part 2 |
| `src/components/pharmacy-docs/DocPOSPayment.tsx` | POS Terminal part 3 |
| `src/components/pharmacy-docs/DocSessions.tsx` | Sessions & transactions |
| `src/components/pharmacy-docs/DocDispensing.tsx` | Prescription queue & dispensing |
| `src/components/pharmacy-docs/DocReturns.tsx` | Returns & refunds |
| `src/components/pharmacy-docs/DocStockMovements.tsx` | Stock movements & alerts |
| `src/components/pharmacy-docs/DocWarehouse.tsx` | Warehouse management |
| `src/components/pharmacy-docs/DocProcurement.tsx` | PO & suppliers |
| `src/components/pharmacy-docs/DocReports.tsx` | Reports hub (may span 2 pages) |
| `src/components/pharmacy-docs/DocSettings.tsx` | Settings & configuration |

### Route Addition
Add to `src/App.tsx`:
```
<Route path="pharmacy-documentation" element={<PharmacyDocumentation />} />
```

### Design Pattern
- Reuses the same `proposal-page` CSS class for A4 sizing and print optimization
- Same toolbar with Back, page navigation dots, Print, and Download PDF buttons
- HealthOS 24 branding with page numbers
- Uses green accent color (matching existing pharmacy proposal page theme)
- Each page component is a self-contained A4 page with header, content sections, and footer
- Sections use icons, feature lists, step-by-step workflows, and tip/note callouts
- Print mode renders all pages sequentially for full PDF download

