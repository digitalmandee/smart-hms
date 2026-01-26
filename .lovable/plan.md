
# Plan: Fix Inventory Menu, Org Admin Options, and Menu Flickering

## Overview

Three issues have been identified:

1. **Inventory not showing for Org Admin** - The `org_admin` static sidebar config is missing the Inventory module
2. **Organization Admin options missing** - The org_admin sidebar is incomplete, missing HR, Billing, Accounts & Finance
3. **Menu flickering on 2nd/3rd level expand** - The collapsible animations are not defined in Tailwind config

---

## Phase 1: Fix Collapsible Animation (Root Cause of Flickering)

**File:** `tailwind.config.ts`

The `CollapsibleContent` component uses `animate-collapsible-up` and `animate-collapsible-down` classes, but these animations are NOT defined in the Tailwind config.

### Add Missing Keyframes and Animations:

```typescript
keyframes: {
  // ... existing keyframes ...
  "collapsible-down": {
    from: { height: "0" },
    to: { height: "var(--radix-collapsible-content-height)" },
  },
  "collapsible-up": {
    from: { height: "var(--radix-collapsible-content-height)" },
    to: { height: "0" },
  },
},
animation: {
  // ... existing animations ...
  "collapsible-down": "collapsible-down 0.2s ease-out",
  "collapsible-up": "collapsible-up 0.2s ease-out",
},
```

---

## Phase 2: Add Inventory & Procurement to Org Admin Sidebar

**File:** `src/config/role-sidebars.ts`

Add a complete Inventory section to the `org_admin` config:

```typescript
org_admin: {
  items: [
    // ... existing items ...
    { 
      name: "Inventory", 
      path: "", 
      icon: "Package",
      children: [
        { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
        { name: "Items", path: "/app/inventory/items", icon: "Box" },
        { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
        { name: "Categories", path: "/app/inventory/categories", icon: "FolderTree" },
        { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
        { name: "Purchase Orders", path: "/app/inventory/purchase-orders", icon: "FileEdit" },
        { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
        { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
        { name: "Reports", path: "/app/inventory/reports", icon: "BarChart3" },
      ]
    },
    // ... rest of config ...
  ]
}
```

---

## Phase 3: Add Missing Admin Sections to Org Admin

**File:** `src/config/role-sidebars.ts`

Add complete admin oversight sections:

### Add HR Section:
```typescript
{ 
  name: "HR & Staff", 
  path: "", 
  icon: "Users",
  children: [
    { name: "Dashboard", path: "/app/hr", icon: "LayoutDashboard" },
    { name: "Employees", path: "/app/hr/employees", icon: "Users" },
    { name: "Attendance", path: "/app/hr/attendance", icon: "Clock" },
    { name: "Leaves", path: "/app/hr/leaves", icon: "CalendarDays" },
    { name: "Payroll", path: "/app/hr/payroll", icon: "DollarSign" },
    { name: "Reports", path: "/app/hr/reports", icon: "BarChart3" },
  ]
},
```

### Add Billing Section:
```typescript
{ 
  name: "Billing", 
  path: "", 
  icon: "Receipt",
  children: [
    { name: "Invoices", path: "/app/billing/invoices", icon: "FileText" },
    { name: "Payments", path: "/app/billing/payments", icon: "CreditCard" },
    { name: "Reports", path: "/app/billing/reports", icon: "PieChart" },
  ]
},
```

### Add Accounts & Finance Section:
```typescript
{ 
  name: "Accounts", 
  path: "", 
  icon: "Landmark",
  children: [
    { name: "Dashboard", path: "/app/accounts", icon: "LayoutDashboard" },
    { name: "Chart of Accounts", path: "/app/accounts/chart", icon: "ListTree" },
    { name: "Journal Entries", path: "/app/accounts/journal", icon: "BookOpen" },
    { name: "Accounts Payable", path: "/app/accounts/payable", icon: "Wallet" },
    { name: "Reports", path: "/app/accounts/reports", icon: "PieChart" },
  ]
},
```

---

## Files to Modify

| File | Action |
|------|--------|
| `tailwind.config.ts` | Add collapsible-down/up animations |
| `src/config/role-sidebars.ts` | Add Inventory, HR, Billing, Accounts to org_admin |

---

## Expected Outcome

After implementation:
- Menu expand/collapse will be smooth with no flickering
- Org Admin will see complete Inventory & Procurement section
- Org Admin will have HR oversight access
- Org Admin will have Billing and Accounts visibility
- All menu levels will animate properly without z-index or timing issues
