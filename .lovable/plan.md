

## Problem

The `useOnboarding.ts` hook was written assuming columns that don't exist in the actual `employee_onboarding` table. The real schema has:

| Actual Column | Hook Assumes |
|---|---|
| `item_name` | `step_name` |
| `description` | `step_category` |
| `due_date` | - |
| `template_id` | - |
| *(missing)* | `sort_order` |

The query fails with `column employee_onboarding.sort_order does not exist`.

The insert mutation also tries to write `step_name`, `step_category`, `sort_order` -- none of which exist.

## Regarding "is onboarding done when employee is added?"

Currently no -- onboarding is a separate manual action from the Onboarding page. The flow is: Add Employee first, then go to Onboarding page and click "Start Onboarding" to select that employee and create checklist items. This is the correct design since not every employee needs onboarding (transfers, rehires, etc.).

## Fix Plan

**File: `src/hooks/useOnboarding.ts`**

1. Update the interface to match actual columns (`item_name`, `description`, `due_date`, `template_id`)
2. Fix the query: remove `.order('sort_order')`, order by `created_at` instead
3. Fix the select to use `item_name` instead of `step_name`
4. Fix `DEFAULT_ONBOARDING_STEPS` to use actual columns: `item_name` instead of `step_name`, `description` instead of `step_category`, remove `sort_order`
5. Fix the insert mutation to use correct column names
6. Update grouping logic to reference correct field names

**File: `src/pages/app/hr/OnboardingPage.tsx`**

1. Update references from `step.step_name` to `step.item_name`
2. Update references from `step.step_category` to `step.description`
3. Update `CATEGORY_LABELS` usage to work with description field

### Default Onboarding Items (mapped to real columns)

```typescript
const DEFAULT_ONBOARDING_STEPS = [
  { item_name: 'Document Collection', description: 'Collect ID, certificates, contracts' },
  { item_name: 'ID Card Issuance', description: 'Issue employee ID badge' },
  { item_name: 'IT Account Setup', description: 'Create email and system accounts' },
  { item_name: 'System Access & Training', description: 'Grant system access and basic training' },
  { item_name: 'Uniform Issuance', description: 'Issue uniforms and PPE' },
  { item_name: 'Department Orientation', description: 'Introduce to team and department' },
  { item_name: 'Policy Acknowledgement', description: 'Review and sign company policies' },
  { item_name: 'Buddy/Mentor Assignment', description: 'Assign onboarding buddy' },
  { item_name: 'Probation Goals Set', description: 'Define probation period objectives' },
  { item_name: 'First Week Check-in', description: 'Manager check-in after first week' },
];
```

No database migration needed -- just aligning code to the existing table schema.

