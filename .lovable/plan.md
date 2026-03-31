

# Fix: Add Imaging Orders to Radiologist Sidebar

## Problem
The radiology **Orders** page already exists at `/app/radiology/orders` with full filtering (status, modality, priority) and `ReportTable` — identical pattern to Lab Queue. However, only the `radiology_technician` role has it in their sidebar. The **radiologist** role is missing it entirely.

## Fix

### File: `src/config/role-sidebars.ts`
Add an "Orders" menu item to the `radiologist` sidebar, after Dashboard:

```
{ name: "Imaging Orders", path: "/app/radiology/orders", icon: "ClipboardList" },
```

This gives radiologists direct access to view all imaging orders with filters, just like the lab queue works for lab technicians.

## Files Changed
- `src/config/role-sidebars.ts` — add Imaging Orders link to radiologist sidebar

