

# Plan: Create Procurement Cycle Workflow Diagram

## Overview

Create a new `ProcurementCycleDiagram.tsx` component that visually illustrates the complete procurement workflow from Purchase Order creation to Vendor Payment, following the established pattern in `WorkflowDiagram.tsx` and `FlowSection.tsx`.

---

## Component Design

### Visual Structure

The diagram will feature **6 connected steps** with:
- Unique color-coded icons for each step
- Role/department badges showing responsibility
- Detailed descriptions explaining system actions
- Animated transitions on scroll
- Responsive layout (horizontal on desktop, vertical on mobile)

### Procurement Flow Steps

| Step | Icon | Title | Description | Role | Color |
|------|------|-------|-------------|------|-------|
| 01 | `ClipboardList` | **Requisition** | Department submits stock request with item specifications and urgency level | Store Manager | `bg-blue-500` |
| 02 | `FileText` | **Purchase Order** | Unified PO created for medicines & supplies. Vendor selected from approved list | Procurement | `bg-violet-500` |
| 03 | `Truck` | **Goods Received** | GRN verification: quantity check, expiry dates, batch numbers recorded | Store Keeper | `bg-orange-500` |
| 04 | `Package` | **Stock Update** | Verified items auto-routed to Pharmacy or General Inventory with location tracking | System | `bg-emerald-500` |
| 05 | `FileSpreadsheet` | **Accounts Payable** | GRN creates AP liability. Invoice matched with PO for payment scheduling | Accounts | `bg-rose-500` |
| 06 | `Banknote` | **Vendor Payment** | Payment processed via bank/cheque. AP cleared, ledger entries posted automatically | Finance | `bg-success` |

---

## Implementation Details

### File: `src/components/landing/ProcurementCycleDiagram.tsx`

```tsx
import { 
  ClipboardList, 
  FileText, 
  Truck, 
  Package, 
  FileSpreadsheet, 
  Banknote, 
  ArrowRight,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const procurementSteps = [
  {
    icon: ClipboardList,
    number: '01',
    title: 'Requisition',
    description: 'Department submits stock request with item specifications and urgency level',
    detail: 'Low stock alerts trigger automatic requisitions',
    role: 'Store Manager',
    roleColor: 'bg-blue-500',
    systemAction: 'Stock level monitoring',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Purchase Order',
    description: 'Unified PO created for medicines & supplies. Vendor selected from approved list',
    detail: 'Multi-level approval workflow with budget checks',
    role: 'Procurement',
    roleColor: 'bg-violet-500',
    systemAction: 'Vendor price comparison',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Goods Received',
    description: 'GRN verification: quantity check, expiry dates, batch numbers recorded',
    detail: 'Partial receipts supported with variance tracking',
    role: 'Store Keeper',
    roleColor: 'bg-orange-500',
    systemAction: 'Quality inspection checklist',
  },
  {
    icon: Package,
    number: '04',
    title: 'Stock Update',
    description: 'Verified items auto-routed to Pharmacy or General Inventory with location tracking',
    detail: 'FIFO/FEFO inventory management applied',
    role: 'System',
    roleColor: 'bg-emerald-500',
    systemAction: 'Automatic stock routing',
  },
  {
    icon: FileSpreadsheet,
    number: '05',
    title: 'Accounts Payable',
    description: 'GRN creates AP liability. Invoice matched with PO for payment scheduling',
    detail: '3-way matching: PO vs GRN vs Vendor Invoice',
    role: 'Accounts',
    roleColor: 'bg-rose-500',
    systemAction: 'Aging reports generated',
  },
  {
    icon: Banknote,
    number: '06',
    title: 'Vendor Payment',
    description: 'Payment processed via bank/cheque. AP cleared, ledger entries posted automatically',
    detail: 'Debit AP, Credit Bank with full audit trail',
    role: 'Finance',
    roleColor: 'bg-success',
    systemAction: 'Bank reconciliation ready',
  },
];
```

### Component Structure

The component will include:

1. **Header Section**
   - Badge: "Supply Chain"
   - Title: "Complete Procurement Cycle"
   - Subtitle explaining the PO → Payment flow

2. **Desktop Layout** (lg and above)
   - 6-column grid with connecting arrows
   - Each step as a card with icon, title, description
   - System action badges
   - Role indicators with color coding

3. **Mobile Layout** (below lg)
   - Vertical timeline with connecting line
   - Cards stacked with step indicators
   - Compact but complete information

4. **Summary Stats Section**
   - "Average PO processing: 24 hours"
   - "3-way matching accuracy: 99.5%"
   - "Zero manual ledger entries"

---

## Update Landing Page

### File: `src/pages/Index.tsx`

Add the new diagram after `WorkflowDiagram`:

```tsx
import { ProcurementCycleDiagram } from "@/components/landing/ProcurementCycleDiagram";

// In the main return, after WorkflowDiagram:
<WorkflowDiagram />
<ProcurementCycleDiagram />  {/* NEW */}
<RoleSelector />
```

---

## Visual Design Details

### Card Design (Desktop)
```
┌─────────────────────────────────────┐
│  [01]                               │  ← Step number badge
│  ┌───────┐                          │
│  │ Icon  │                          │  ← Color-coded icon
│  └───────┘                          │
│  Purchase Order                     │  ← Bold title
│  Unified PO created for             │  ← Description
│  medicines & supplies...            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⚡ Vendor price comparison  │    │  ← System action chip
│  └─────────────────────────────┘    │
│                                     │
│  ● Procurement                      │  ← Role badge
└─────────────────────────────────────┘
         ↓
    [Arrow to next step]
```

### Color Scheme
| Step | Primary Color | Usage |
|------|--------------|-------|
| Requisition | Blue (`bg-blue-500`) | Request initiation |
| Purchase Order | Violet (`bg-violet-500`) | Document creation |
| Goods Received | Orange (`bg-orange-500`) | Physical receipt |
| Stock Update | Emerald (`bg-emerald-500`) | System automation |
| Accounts Payable | Rose (`bg-rose-500`) | Financial liability |
| Vendor Payment | Success Green (`bg-success`) | Completion |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/landing/ProcurementCycleDiagram.tsx` | **CREATE** - New workflow diagram component |
| `src/pages/Index.tsx` | **MODIFY** - Import and add component |

---

## Expected Outcome

After implementation:

1. **Visual Flow Diagram** showing 6 procurement steps
2. **Role Clarity** - Each step shows responsible department
3. **System Actions** - Highlights automation features
4. **Responsive Design** - Works on all screen sizes
5. **Animated Entrance** - Staggered reveal on scroll
6. **PDF-Ready** - Clean, professional appearance for presentations

---

## Technical Notes

- Follows existing `WorkflowDiagram.tsx` patterns for consistency
- Uses `StaggerChildren` for animated step reveals
- Lucide icons: `ClipboardList`, `FileText`, `Truck`, `Package`, `FileSpreadsheet`, `Banknote`
- Maintains the "Modern & Colorful" design direction
- Currency references use "Rs." per standardization

