
# Enhance Warehouse Section with Module Integration Flow

## Problem

The current WarehouseSection on the landing page and WarehouseSlide in the presentation treat warehouse management as an isolated feature. They don't show how warehouse sub-stores connect back to the existing **Inventory**, **Procurement**, and **Accounts** modules -- which is the real value proposition.

## Current State (20 Modules on Landing Page)

| Category | Modules |
|----------|---------|
| Patient Care | Patients, Appointments, OPD, Emergency, OT, IPD, Nursing |
| Diagnostics | Laboratory, Radiology, Blood Bank |
| Pharmacy & Retail | Pharmacy, POS |
| Finance | Billing, Doctor Wallet, Compensation, Accounts |
| Supply Chain | Procurement, Inventory |
| HR | HR, Reports |
| Warehouse (new) | WarehouseSection (standalone, not integrated visually) |

## What Needs Enhancement

### 1. WarehouseSection (Landing Page) -- Add Integration Flow

Add a new **"Connected Supply Chain"** visual below the existing warehouse hierarchy and entitlement cards, showing the end-to-end integration:

```text
Warehouse Sub-Store --> Indent/Demand --> Procurement (PO/GRN) --> Inventory Stock Update --> Accounts (AP/Payment)
                                                                         |
                                                              Patient Entitlement Check
                                                                         |
                                                          Free Dispensing / Auto-Billing
```

This adds a horizontal flow diagram (similar to WorkflowDiagram pattern) with 5 connected steps:
1. **Sub-Store Demand** -- Department raises indent from sub-store (Medical/Surgical/Dental)
2. **Procurement** -- Auto-generates PO from approved indents, vendor selection
3. **GRN & Stock** -- Goods received, verified, routed to correct sub-store with bin/rack assignment
4. **Dispensing** -- Entitlement check routes to free or billed dispensing
5. **Accounts** -- AP created on GRN, payments tracked, billing revenue posted

Each step shows which existing module handles it (linking back to Procurement, Inventory, Accounts tabs).

### 2. Update Comparison Grid in WarehouseSection

Add 2 more rows to the existing 6-row comparison showing the integration advantage:

| Workflow | Traditional | HealthOS 24 |
|----------|-------------|-------------|
| Indent to PO conversion | Separate departments, no link | Auto-PO from approved indent |
| GRN to sub-store routing | Manual allocation | Auto-route to correct sub-store with bin assignment |

### 3. WarehouseSlide (Presentation) -- Add Integration Diagram

Replace the bottom stats row with a compact integration flow showing:
- Warehouse connects to Procurement (PO/GRN)
- Procurement connects to Inventory (stock routing)
- Inventory connects to Accounts (AP/payments)
- Dispensing connects to Billing (entitlement-based)

Keep the 3 stats but make them smaller and add the flow above them.

### 4. Update Inventory Tab Description (FeaturesTabs)

Enhance the Inventory module description to explicitly mention warehouse sub-store integration:
- Add mention of "indent-to-PO automation from sub-stores"
- Add mention of "GRN auto-routing to specific sub-store bins"
- Add highlight: "Indent-to-PO"

### 5. Update Procurement Tab Description (FeaturesTabs)

Add mention of warehouse demand integration:
- "Receive automated purchase requests from warehouse sub-store indents"
- Add highlight: "Sub-Store Indents"

### 6. Update Accounts Tab Description (FeaturesTabs)

Add mention of warehouse-linked AP:
- "Warehouse GRN verification auto-creates AP entries per sub-store"

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/landing/WarehouseSection.tsx` | Add integration flow diagram (5 steps), add 2 more comparison rows, update stats |
| `src/components/presentation/WarehouseSlide.tsx` | Add compact integration flow connecting Warehouse to Procurement to Inventory to Accounts |
| `src/components/landing/FeaturesTabs.tsx` | Update Inventory, Procurement, and Accounts tab descriptions and highlights to mention warehouse integration |

## Technical Details

### WarehouseSection.tsx Changes

- Add a new section between the 2-column cards and the comparison grid titled "Connected Supply Chain"
- Use the same horizontal flow pattern as `WorkflowDiagram.tsx` (icons connected by arrows, vertical on mobile)
- 5 steps with icons: ClipboardList (Indent), FileText (PO), Package (GRN), Pill (Dispense), Calculator (Accounts)
- Each step has a small badge showing the module it links to (e.g., "Procurement Module", "Accounts Module")
- Add 2 new rows to the `comparisons` array
- Update stats: change "6+" sub-store types to show "5 Modules Connected" as a new stat

### WarehouseSlide.tsx Changes

- Add a compact 5-icon horizontal flow at the bottom of the slide (before the stats row)
- Icons connected with arrows: Sub-Store Indent, Procurement PO, GRN Stock, Dispensing, Accounts
- Each icon has a label and a colored dot matching the module color from the presentation
- Reduce stats row padding to fit the flow

### FeaturesTabs.tsx Changes

- **Inventory** (line 187): Append to description: "Sub-store indents automatically generate procurement requests. GRN-verified goods are routed to specific sub-store bins with location tracking."
- Add highlight: `'Indent-to-PO'`
- **Procurement** (line 178): Append: "Receive automated purchase requests from warehouse sub-store indents with pre-approved item lists."
- Add highlight: `'Sub-Store Indents'`
- **Accounts** (line 169): Append: "Warehouse GRN verification auto-creates AP entries per sub-store for precise cost tracking."
