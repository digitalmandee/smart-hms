
# Fix Warehouse Dashboard, Clinical Isolation, and HR Integration

## Problems Found

1. **404 on Dashboard**: `warehouse_admin` and `warehouse_user` are missing from `ROLE_DASHBOARD_MAP` in `DashboardPage.tsx`. When a warehouse user logs in, they land on the generic dashboard which shows clinical quick actions (New Patient, Schedule Appointment, etc.) that link to clinical pages -- causing 404s since those modules are hidden for warehouse orgs.

2. **Clinical Content on Dashboard**: Even if the redirect works, the generic dashboard shows clinical stats (Total Patients, Today's Appointments, Active Consultations) and clinical quick actions. Warehouse users need warehouse-specific content.

3. **HR Module Linking**: The sidebar config for `warehouse_admin` includes HR paths which is correct. But the HR pages themselves don't have any facility-type issues -- they query by `organization_id` so warehouse HR data is already isolated. No fix needed there.

---

## Step 1: Add Warehouse Roles to Dashboard Redirect

In `src/pages/app/DashboardPage.tsx`, add warehouse roles to `ROLE_DASHBOARD_MAP`:

```
warehouse_admin: "/app/inventory",
warehouse_user: "/app/inventory",
```

This redirects warehouse users directly to the inventory dashboard instead of showing the clinical dashboard.

## Step 2: Make Dashboard Facility-Type Aware

For cases where an `org_admin` or `branch_admin` logs into a warehouse organization, the generic dashboard still shows. Update `DashboardPage.tsx` to:

- Fetch the organization's `facility_type`
- When `facility_type === 'warehouse'`: show warehouse-specific quick actions (New GRN, Stock Levels, Put-Away Tasks, Shipping) and warehouse stats instead of clinical ones
- When `facility_type === 'pharmacy'`: show pharmacy-specific quick actions (POS Terminal, Stock Alerts, Purchase Orders, Returns)
- Default (hospital/clinic): keep existing clinical dashboard as-is

The quick actions and stats cards will be conditionally rendered based on facility type.

## Step 3: Verify HR Routes Are Accessible

Confirm that `/app/hr/*` routes are registered in `App.tsx` and accessible to warehouse users. The sidebar already links to these paths -- the data isolation works via `organization_id` on all HR queries (employees, attendance, leaves, payroll).

No changes needed for HR -- it is already properly working for warehouse context.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/app/DashboardPage.tsx` | Add warehouse/pharmacy role redirects; add facility-type-aware quick actions and stats for admin roles |

## Technical Details

- `ROLE_DASHBOARD_MAP` gets 2 new entries for warehouse roles
- New `warehouseQuickActions` array with paths like `/app/inventory/grn`, `/app/inventory/stock`, `/app/inventory/putaway`, `/app/inventory/shipping`
- New `pharmacyQuickActions` array with paths like `/app/pharmacy/pos`, `/app/pharmacy/alerts`
- Organization `facility_type` fetched via existing pattern (same as `DynamicSidebar.tsx` uses)
- Stats cards conditionally show inventory metrics vs clinical metrics based on facility type
- PharmacyAlertsWidget and CollectionsWidget only shown for clinical facility types
