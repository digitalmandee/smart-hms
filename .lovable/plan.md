

## Problem Root Cause

The PATCH requests to `lab_order_items` return `[]` (empty array) — the updates are **silently blocked by RLS**. The data never persists, so items remain "pending" and the "Submit for Approval" button never appears.

**Why RLS blocks the update:**
- The UPDATE policy on both `lab_orders` and `lab_order_items` requires `has_permission('consultations.update')` or `has_permission('laboratory.orders')`
- The permission code `consultations.update` **does not exist** — the correct code is `consultations.edit`
- The doctor role has `consultations.edit` but **not** `laboratory.orders` or `laboratory.results`
- Result: the `has_permission()` check always returns `false` for this user

## Plan

### 1. Fix RLS policies (SQL migration)
Update the UPDATE policies on both `lab_orders` and `lab_order_items` to:
- Use `consultations.edit` instead of `consultations.update`
- Also allow `laboratory.results` permission (for lab technicians entering results)

### 2. Grant lab permissions to doctor role
Insert role_permissions for the `doctor` role to include:
- `laboratory.orders` — manage lab orders
- `laboratory.results` — enter lab results
- `laboratory.view` — view laboratory

This ensures doctors who order labs can also process them.

### Technical Details

**SQL Migration:**
```sql
-- Fix lab_orders UPDATE policy
DROP POLICY IF EXISTS "Users with lab or consultation permission can update lab orders" ON lab_orders;
CREATE POLICY "Users with lab or consultation permission can update lab orders"
ON lab_orders FOR UPDATE TO authenticated
USING (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
)
WITH CHECK (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
);

-- Fix lab_order_items UPDATE policy
DROP POLICY IF EXISTS "Users with lab or consultation permission can update lab order " ON lab_order_items;
CREATE POLICY "Users with lab or consultation permission can update lab order items"
ON lab_order_items FOR UPDATE TO authenticated
USING (
  lab_order_id IN (SELECT id FROM lab_orders WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id()))
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
);

-- Grant lab permissions to doctor role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'doctor', id, true FROM permissions WHERE code IN ('laboratory.view', 'laboratory.orders', 'laboratory.results')
ON CONFLICT DO NOTHING;
```

**No frontend code changes needed** — the save logic, submit button, and publish flow are already correctly implemented. The only issue is the database blocking updates.

