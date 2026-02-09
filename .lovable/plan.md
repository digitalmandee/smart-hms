

# Add Warehouse Management & Patient Entitlement to Landing Page, Presentation & Proposal

## Overview

Add new content sections showcasing **Warehouse Management** (multi-warehouse sub-stores, bin/rack tracking, inter-store transfers) and **Patient Entitlement Engine** (entitled vs. non-entitled dispensing) as platform capabilities. These are presented as generic enterprise features, not tied to any specific hospital name.

---

## What Gets Added

### 1. New Landing Page Section: "Enterprise Warehouse & Supply Chain"

A new section placed after the Procurement Cycle Diagram on the homepage, containing:

- **Section badge**: "Enterprise Supply Chain"
- **Left column**: Warehouse hierarchy visual -- Central Store branching into Medical Store, Surgical Store, Dental Store, Equipment Store with icons
- **Right column**: Patient Entitlement flow -- ID scan leads to category lookup (Entitled: Serving/Retired/Dependents vs. Non-Entitled) which auto-routes to free dispensing or billing
- **Comparison grid** (6 rows): Traditional approach vs. HealthOS 24

| Workflow | Traditional | HealthOS 24 |
|----------|-------------|-------------|
| Patient entitlement check | Manual card verification | Auto ID-based entitlement lookup |
| Medicine indent from sub-store | Paper-based demand forms | Digital indent with approval workflow |
| Stock visibility across stores | Physical stock count | Real-time dashboard across all sub-stores |
| Non-entitled billing | Manual ledger entries | Auto-route to billing vs free dispensing |
| Expiry management | Monthly physical checks | Auto alerts 30/60/90 days before expiry |
| Inter-store transfers | Manual register entries | Digital transfer with auto stock update |

- **Bottom stats**: "6+ Sub-store Types" / "4+ Entitlement Categories" / "Real-time Stock Visibility"

### 2. New Presentation Slide: "Warehouse & Supply Chain Management" (Slide 26)

Follows existing slide patterns with:

- Warehouse sub-store hierarchy diagram (Central Store to 4 sub-stores with colored icons)
- Entitled vs. Non-Entitled patient dispensing flow
- Key metrics row at bottom
- Existing slides after Procurement (Case Studies, Lab Network, etc.) shift by +1

### 3. New Proposal Page: "Warehouse & Supply Chain" (Page 08/11)

6 modules in a 2x3 grid with indigo color theme:

| Module | Features |
|--------|----------|
| Multi-Warehouse Management | Sub-store creation, central dashboard, stock allocation, zone configuration |
| Bin/Rack Location Tracking | Physical location mapping, pick lists, location-based audits, label printing |
| Patient Entitlement Engine | Category configuration, auto-dispensing rules, entitlement verification, override logs |
| Inter-Store Transfers | Transfer requests, approval workflow, auto stock adjustment, transfer history |
| Indent/Demand System | Department-wise indents, scale-of-issue limits, approval matrix, fulfillment tracking |
| Controlled Substance Tracking | Chain of custody, register compliance, usage reconciliation, regulatory reports |

### 4. Update Existing ComparisonTable

Add 4 new rows under a new "Warehouse & Supply Chain" category:

- Multi-warehouse tracking: Paper "Impossible" / Excel "Separate sheets" / HealthOS "Unified dashboard"
- Inter-store transfers: Paper "Register entries" / Excel "Manual update" / HealthOS "Digital with auto stock"
- Patient entitlement: Paper "Card check" / Excel "Lookup sheet" / HealthOS "Auto ID-based"
- Controlled substance tracking: Paper "Manual ledger" / Excel "Basic log" / HealthOS "Full chain of custody"

Update stats: "24 Features Compared" becomes "28 Features Compared". Update mobile category list to include "Warehouse & Supply Chain".

### 5. Update FeaturesTabs (Inventory Module)

Expand the existing Inventory tab:

- **Description**: Append text about multi-warehouse sub-store management (Medical, Surgical, Dental, Equipment stores) and patient entitlement-based dispensing (Entitled vs Non-Entitled categories)
- **Highlights**: Add "Multi-Warehouse" and "Patient Entitlement" to the highlights array

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/landing/WarehouseSection.tsx` | New landing page section |
| `src/components/presentation/WarehouseSlide.tsx` | New presentation slide |
| `src/components/proposal/ProposalWarehouseFeatures.tsx` | New proposal page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Import and add WarehouseSection after ProcurementCycleDiagram |
| `src/components/landing/ComparisonTable.tsx` | Add 4 "Warehouse & Supply Chain" rows, update stats from 24 to 28, add category to mobile list |
| `src/components/landing/FeaturesTabs.tsx` | Expand Inventory module description and highlights |
| `src/pages/Presentation.tsx` | Import WarehouseSlide, add after ProcurementSlide, update TOTAL_SLIDES from 31 to 32 |
| `src/pages/PricingProposal.tsx` | Import ProposalWarehouseFeatures, insert after pharmacy page (page 06), shift subsequent page numbers |

---

## Technical Details

### WarehouseSection.tsx

- Uses AnimatedSection wrapper for scroll animations
- Color theme: indigo/slate for professional enterprise feel
- Icons from lucide-react: Building2, Package, Warehouse, ArrowRight, Shield, Users, Pill, Wrench
- Responsive: single column on mobile, 2-column on desktop
- Comparison grid renders as scrollable cards on mobile

### WarehouseSlide.tsx

- Uses `.slide` CSS class matching existing presentation pattern
- Header badge: "Supply Chain"
- Slide number: 26 / 32
- Visual: Connected cards for Central Store and 4 sub-stores with colored backgrounds (blue, green, orange, purple)
- Side panel: Entitled vs Non-Entitled flow with arrow connectors
- Bottom metrics row with 3 stats

### ProposalWarehouseFeatures.tsx

- Uses `.proposal-page` CSS class matching existing proposal pattern
- Header: HealthOS24Logo + page number "06 / 11"
- Gradient accent: indigo (from-indigo-500 to-indigo-400)
- 6 module cards in 2-column grid, each with icon, name, and 4 bullet features
- Footer: "HealthOS 24 Proposal" / "healthos24.com"

### Presentation.tsx Changes

- TOTAL_SLIDES: 31 changes to 32
- WarehouseSlide inserted after ProcurementSlide (after line 356)
- Comment: "Slide 26: Warehouse & Supply Chain"
- All subsequent slide comments shift by +1

### PricingProposal.tsx Changes

- Insert `{ id: "warehouse", label: "Warehouse & Supply Chain", component: ProposalWarehouseFeatures }` after the pharmacy entry in the pages array
- Subsequent pages auto-adjust since page numbers are component-internal

