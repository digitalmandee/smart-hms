

# Add Per-Department OPD Token Display Filtering

## Problem

Currently, all three display screens (TokenKioskPage, PublicQueueDisplay, QueueDisplayPage) show tokens from ALL OPD departments in a single view. In a hospital with multiple OPD departments (e.g., Medicine, Surgery, Pediatrics), each waiting room TV needs to show only its department's queue.

## Current State

- `useTodayQueue` already accepts an `opdDepartmentId` parameter and filters correctly
- `QueueDisplayPage` has an `OPDDepartmentSelector` dropdown for manual filtering (internal use)
- `TokenKioskPage` does NOT accept any department filter -- shows everything
- `PublicQueueDisplay` does NOT filter by department -- shows everything
- `KioskSetupPage` generates 3 static URLs (OPD display, ER display, Kiosk) with no department awareness
- `usePublicOPDQueue` in `usePublicQueue.ts` does not filter by department or include department data in the select
- No OPD departments currently exist in the database (tables are empty), but the schema and code fully support them

## Proposed Changes

### 1. Add Public Route with Department Code (`App.tsx`)

Add a new route:
```
/display/queue/:organizationId/:deptCode
```
This sits alongside the existing `/display/queue/:organizationId` (all departments). The `deptCode` is the short code like `MED`, `SURG`, `PED` -- human-readable and easy to set up on a TV.

### 2. Update `PublicQueueDisplay.tsx` -- Accept Optional `deptCode` Param

- Read `deptCode` from `useParams` (optional)
- If present, look up the `opd_departments` row by `code` + `organization_id` to get the department ID
- Pass `opd_department_id` filter to the appointments query
- Include `opd_department` in the select for token formatting
- Show department name/color in the header (e.g., "Medicine OPD" with the department's color accent)
- Use `formatTokenDisplay` for department-prefixed tokens

### 3. Update `usePublicQueue.ts` -- Add Department Filter

- Add optional `opdDepartmentId` parameter to `usePublicOPDQueue`
- Add `opd_department:opd_departments(id, name, code, color)` to the select
- When `opdDepartmentId` is provided, add `.eq("opd_department_id", opdDepartmentId)` filter
- Add new `usePublicOPDDepartments(organizationId)` hook to fetch active departments for an org (used by KioskSetupPage)

### 4. Update `TokenKioskPage.tsx` -- Add Department Selector

- Add `OPDDepartmentSelector` dropdown in the header (like QueueDisplayPage already has)
- Pass selected `opdDepartmentId` to `useTodayQueue`
- Show department name and color accent in the header when filtered
- When filtered, the "waiting" count and queue only show that department's patients

### 5. Update `KioskSetupPage.tsx` -- Generate Per-Department URLs

- Fetch active OPD departments using `useOPDDepartments`
- Under the existing "OPD Queue Display (TV)" card, add a new section: **"Department-Specific Displays"**
- For each active department, show a card with:
  - Department name, code, color badge
  - URL: `/display/queue/:orgId/:deptCode`
  - Copy and Preview buttons
- If no departments are configured, show a note: "No OPD departments configured. Go to Settings > OPD Departments to add them. Without departments, the main OPD display URL shows all tokens."
- Keep the "All Departments" URL as the first option

### 6. Trilingual Translation Keys

Add keys:
- `opd.allDepartments` -- "All Departments" / "تمام شعبے" / "جميع الأقسام"
- `opd.departmentDisplay` -- "Department Display" / "شعبہ ڈسپلے" / "عرض القسم"  
- `opd.noDepartmentsConfigured` -- "No OPD departments configured" / etc.

## Files Summary

| File | Action |
|------|--------|
| `src/App.tsx` | **EDIT** -- Add route `/display/queue/:organizationId/:deptCode` |
| `src/pages/public/PublicQueueDisplay.tsx` | **EDIT** -- Read `deptCode` param, resolve to department ID, filter query, show dept branding, use `formatTokenDisplay` |
| `src/hooks/usePublicQueue.ts` | **EDIT** -- Add `opdDepartmentId` filter to `usePublicOPDQueue`, add `opd_department` to select, add `usePublicOPDDepartments` hook |
| `src/pages/app/appointments/TokenKioskPage.tsx` | **EDIT** -- Add `OPDDepartmentSelector` in header, pass to `useTodayQueue` |
| `src/pages/app/appointments/KioskSetupPage.tsx` | **EDIT** -- Fetch departments, generate per-department URLs with copy/preview |
| `src/lib/i18n/translations/en.ts` | **EDIT** -- Add 3 keys |
| `src/lib/i18n/translations/ar.ts` | **EDIT** -- Add 3 keys |
| `src/lib/i18n/translations/ur.ts` | **EDIT** -- Add 3 keys |

## Technical Details

**Department Code Lookup** (in PublicQueueDisplay): Since the public route uses `deptCode` (e.g., `MED`) rather than UUID, the component will do a one-time lookup:
```sql
SELECT id, name, code, color FROM opd_departments 
WHERE code = :deptCode AND organization_id = :orgId AND is_active = true
```
This result is cached with `staleTime: 5min` since department config rarely changes.

**No Migration Needed**: The `opd_departments` table and `opd_department_id` column on `appointments` already exist. This is purely a frontend routing and filtering change.

