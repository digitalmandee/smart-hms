
# Fix RLS Policy and Complete Pharmacy Testing

## Critical Blocker Found

When testing the independent pharmacy creation flow, toggling modules for "MediCare Pharmacy" fails with:

> "new row violates row-level security policy for table 'organization_modules'"

**Root cause**: The RLS policy on `organization_modules` only allows `org_admin` of the **same organization** to manage modules. There is no policy for `super_admin` to manage modules across all organizations.

**Current policies**:
- `Users can view their org modules` -- SELECT where `organization_id = get_user_organization_id()`
- `Org admins can manage their org modules` -- ALL where `organization_id = get_user_organization_id() AND has_role(auth.uid(), 'org_admin')`

**Missing**: Super Admin full access policy.

---

## Fix: Add Super Admin RLS Policy

Add a new RLS policy on `organization_modules`:

```sql
CREATE POLICY "Super admins can manage all organization modules"
  ON public.organization_modules
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
```

This follows the existing pattern used elsewhere (e.g., `organizations`, `branches` tables) where `is_super_admin()` grants universal access.

---

## Post-Fix Testing Plan

After applying the migration, retest:

1. **Module Toggle** (Super Admin): Re-enable Pharmacy and Pharmacy POS for MediCare Pharmacy
2. **Verify Organization** in DB: Confirm `organization_modules` records are created
3. **Pharmacy Login Test**: Since MediCare Pharmacy has no users yet, pharmacy flows will be tested using the existing `pharmacist@healthos.demo` account (linked to Shifa Medical Center) -- this account already has Pharmacy and POS modules enabled
4. **Pharmacy Dashboard**: Verify it loads with stats
5. **POS Terminal**: Open a session, add items, process a sale
6. **Pharmacy Reports**: Verify sales trends, payment breakdown, top medicines, export functionality
7. **Stock Movements**: Verify pharmacy stock movement logs
8. **Returns**: Test the returns workflow

---

## Technical Details

| Item | Detail |
|------|--------|
| Table affected | `organization_modules` |
| Migration SQL | Single `CREATE POLICY` statement |
| No code changes | The `useToggleOrganizationModule` hook already handles insert/update correctly |
| New org ID | `c0d9b317-110d-4f2d-a13b-e79dbc056787` (MediCare Pharmacy) |
| Existing pharmacist | `pharmacist@healthos.demo` (Shifa Medical Center) -- will use for POS/report testing |

## Steps

1. Run the database migration to add the super admin policy
2. Retest module toggle for MediCare Pharmacy
3. Login as pharmacist and test all pharmacy sub-flows (Dashboard, POS, Reports, Returns, Stock Movements)
4. Document results
