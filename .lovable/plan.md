

# Add Warehouse Management to Pharmacy Sidebar

## Problem
The pharmacist role sidebar has no option to manage warehouses (create, view, edit). Warehouse management is currently only available under the **Inventory/Store Manager** role at `/app/inventory/stores`. Pharmacists -- especially in independent pharmacy setups -- need direct access to create and manage their warehouses without switching roles or navigating to hospital inventory pages.

## Solution
Add a "Warehouses" section to the pharmacist sidebar configuration in `src/config/role-sidebars.ts`, linking to the existing warehouse management pages (`/app/inventory/stores`, `/app/inventory/stores/new`, `/app/inventory/transfers`).

## Changes

### File: `src/config/role-sidebars.ts`

Add a new "Warehouses" menu group to the `pharmacist` sidebar config, placed between the existing "Procurement" and "Setup" sections:

```
{
  name: "Warehouses",
  path: "",
  icon: "Warehouse",
  children: [
    { name: "All Warehouses", path: "/app/inventory/stores", icon: "List" },
    { name: "Create Warehouse", path: "/app/inventory/stores/new", icon: "Plus" },
    { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
  ]
}
```

This reuses the same routes and pages already built for the store manager role -- no new pages needed. The pharmacist will be able to:
- View all warehouses for their organization
- Create new warehouses (e.g., "Pharmacy Main", "Pharmacy Cold Storage")
- Manage inter-store transfers

