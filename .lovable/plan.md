

# Enable Donations Module and Test End-to-End

## Current State
- The `donations` module exists in `available_modules` (id: `a2113e0c-48f3-40d1-8393-2404c4acc383`)
- No record exists in `organization_modules` for org `b1111111-1111-1111-1111-111111111111` with `module_code = 'donations'`
- This is why the sidebar items are hidden -- the module filter correctly excludes them

## Implementation Steps

### 1. Enable the Module (Data Insert)
Insert a row into `organization_modules`:
```sql
INSERT INTO organization_modules (organization_id, module_code, is_enabled, enabled_at)
VALUES ('b1111111-1111-1111-1111-111111111111', 'donations', true, now());
```

### 2. Manual End-to-End Testing
After enabling, log in as `branch_admin` and verify:

1. **Sidebar visibility** -- "Donation Management" parent with 4 children (Dashboard, Donors, Record Donation, Recurring Schedules) should appear
2. **Donation Dashboard** (`/app/donations`) -- Cards showing 0 totals initially
3. **Register a Donor** (`/app/donations/donors/new`) -- Fill in name, type, phone, etc. and submit
4. **Record a Donation** (`/app/donations/record`) -- Select the new donor, enter amount, purpose (e.g. Zakat), payment method, submit
5. **View Receipt** -- Navigate to receipt page for the created donation, verify trilingual print layout
6. **Dashboard Stats** -- Return to dashboard, confirm total received and this month stats updated

No code changes are needed -- only the data insert to enable the module.

