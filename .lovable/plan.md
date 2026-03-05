

# Lab Templates Evaluation — Diagnosis & Fix Plan

## Current State

**Templates exist in the system.** There is a full template management UI at `/app/lab/templates` where you can create/edit templates with fields, units, and reference ranges. The `lab_test_templates` table stores them.

## Why Templates Don't Show During Result Entry

The `TestResultForm` component fetches all active templates via `useLabTestTemplates()` and tries to match them to each lab order item using two strategies:

1. **By `service_type_id`** — exact match between order item and template
2. **By name** — fuzzy substring match on `test_name`

**The likely problem:** Templates in the database either:
- Have **no `service_type_id` linked** to the service type used when ordering the test, AND
- The **template name doesn't substring-match** the order item's test name

So the matching fails silently and the form falls back to a plain free-text textarea.

Additionally, the query in `useLabTestTemplates` has **no `organization_id` filter**, which means it fetches templates from ALL organizations — but if there are simply no templates created yet for your tests, nothing will match.

## Fix Plan

### 1. Auto-link templates when creating lab orders
When a lab order is created with a `service_type_id`, and a template exists with that same `service_type_id`, the match should work. The issue is templates may not have `service_type_id` set.

### 2. Add organization_id filter to useLabTestTemplates
The hook used by `TestResultForm` should filter by the user's organization to avoid cross-org data leaks and improve query performance.

### 3. Improve template matching logic
Make the matching more robust:
- First: exact `service_type_id` match
- Second: exact name match (case-insensitive)
- Third: substring match
- Add a debug indicator when no template is found so lab techs know they need to create one

### 4. Auto-create templates from Unified Services
When a lab service is added in Settings, optionally auto-create a blank template stub linked via `service_type_id`, so the link is always there.

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/useLabTestTemplates.ts` | Add `organization_id` filter using `useAuth` |
| `src/components/lab/TestResultForm.tsx` | Improve matching logic, add "no template" indicator with link to create one |
| `src/hooks/useUnifiedServices.ts` | Auto-create template stub when adding lab service (optional enhancement) |

## Technical Details

**`useLabTestTemplates.ts`** — Add org filter:
```typescript
const { profile } = useAuth();
// ...
.eq("organization_id", profile?.organization_id)
.eq("is_active", true)
```

**`TestResultForm.tsx`** — Better matching + indicator:
```typescript
const template = templates?.find((t) =>
  (item.service_type_id && t.service_type_id === item.service_type_id)
) || templates?.find((t) =>
  t.test_name.toLowerCase() === item.test_name.toLowerCase()
) || templates?.find((t) =>
  item.test_name.toLowerCase().includes(t.test_name.toLowerCase()) ||
  t.test_name.toLowerCase().includes(item.test_name.toLowerCase())
);
```

When no template found, show an info banner: "No template configured for this test. Results will be entered as free text." with a link to `/app/lab/templates/new`.

