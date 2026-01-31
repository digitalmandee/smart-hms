
# Executive Dashboard Navigation & Radiology Fix

## Problem Summary

The Executive Dashboard has two issues:
1. **Wrong navigation targets**: Clicking on department cards (OPD, IPD, Pharmacy, Lab, HR) navigates to operational dashboards instead of analytics reports
2. **Missing departments**: Radiology and Surgery/OT analytics are completely absent from the executive view

## Current vs Expected Behavior

| Department | Current Navigation | Expected Navigation |
|------------|-------------------|---------------------|
| OPD | `/app/opd` (Doctor Queue) | `/app/clinic/reports` (Analytics) |
| IPD | `/app/ipd` (Admissions List) | `/app/ipd/reports` (Census/LOS) |
| Pharmacy | `/app/pharmacy` (POS) | `/app/pharmacy/reports` (Sales Analytics) |
| Laboratory | `/app/lab` (Queue) | `/app/lab/reports` (TAT/Volume) |
| HR | `/app/hr` (Employee List) | `/app/hr/reports` (Workforce Analytics) |
| Radiology | Not shown | `/app/radiology/reports` (TAT/Modality) |
| Surgery/OT | Not shown | `/app/ot/reports` (Volume/Utilization) |

## Solution Design

### Phase 1: Update Department Card Navigation

Modify `ExecutiveDashboardReport.tsx` to change the `onClick` handlers:

**Department Performance Cards (lines 269-308):**
- OPD: Change from `/app/opd` → `/app/clinic/reports`
- IPD: Change from `/app/ipd` → `/app/ipd/reports`
- Pharmacy: Change from `/app/pharmacy` → `/app/pharmacy/reports`
- Lab: Change from `/app/lab` → `/app/lab/reports`

**HR Summary Card (line 316):**
- HR: Change from `/app/hr` → `/app/hr/reports`

### Phase 2: Add Missing Department Cards

Add Radiology and Surgery cards to the Department Performance grid:

**Radiology Card:**
- Icon: Scan (from lucide-react)
- Data: Imaging orders processed, pending interpretations, revenue
- Navigation: `/app/radiology/reports`

**Surgery/OT Card:**
- Icon: Scissors (from lucide-react)
- Data: Surgeries completed, pending surgeries
- Navigation: `/app/ot/reports`

### Phase 3: Extend Data Hook

Update `useExecutiveSummary.ts` to include radiology and surgery metrics:

**New Interface Fields:**
```typescript
radiology: { 
  ordersProcessed: number; 
  pendingInterpretations: number; 
  revenue: number; 
}
surgery: { 
  completed: number; 
  scheduled: number; 
  revenue: number; 
}
```

**New Queries:**
- `imaging_orders` - for radiology volume and pending count
- `surgeries` - for surgery volume and scheduled count

---

## Technical Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/reports/ExecutiveDashboardReport.tsx` | Fix navigation paths, add Radiology & OT cards, expand grid to 6 columns |
| `src/hooks/useExecutiveSummary.ts` | Add radiology and surgery data fetching |

### Navigation Path Updates

```typescript
// Before (Dashboard)                    // After (Reports)
navigate("/app/opd")           →        navigate("/app/clinic/reports")
navigate("/app/ipd")           →        navigate("/app/ipd/reports")
navigate("/app/pharmacy")      →        navigate("/app/pharmacy/reports")
navigate("/app/lab")           →        navigate("/app/lab/reports")
navigate("/app/hr")            →        navigate("/app/hr/reports")
```

### New Department Cards Layout

The Department Performance grid will expand from 4 to 6 cards:

```
┌─────────┬─────────┬─────────┐
│   OPD   │   IPD   │ Pharmacy│
├─────────┼─────────┼─────────┤
│   Lab   │Radiology│Surgery/OT│
└─────────┴─────────┴─────────┘
```

### Hook Data Extension

```typescript
// New queries to add:
const imagingOrdersPromise = supabase
  .from("imaging_orders")
  .select("id, status")
  .gte("created_at", startStr)
  .lte("created_at", endStr + "T23:59:59");

const surgeriesPromise = supabase
  .from("surgeries")
  .select("id, status")
  .gte("surgery_date", startStr)
  .lte("surgery_date", endStr);
```

---

## Summary

| Issue | Fix |
|-------|-----|
| OPD clicks → Doctor Queue | Navigate to `/app/clinic/reports` |
| IPD clicks → Admissions | Navigate to `/app/ipd/reports` |
| Pharmacy clicks → POS | Navigate to `/app/pharmacy/reports` |
| Lab clicks → Queue | Navigate to `/app/lab/reports` |
| HR clicks → Employees | Navigate to `/app/hr/reports` |
| Radiology missing | Add card with imaging stats |
| Surgery missing | Add card with surgery stats |

This ensures executives see **analytics and reports** when drilling down, not operational screens meant for clinical staff.
