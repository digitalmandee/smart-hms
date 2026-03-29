

# Why Imaging Orders Have NULL consultation_id — And the Real Problem

## What I Found

### Data Analysis

Looking at all imaging orders in the database:

| Order | consultation_id | Created Via |
|-------|----------------|-------------|
| IMG-260329-0001 | `1e107713...` ✅ | Consultation page (correctly linked) |
| IMG-260329-0002 | NULL | Billing/direct radiology form (no consultation context) |
| All older orders | NULL | Billing flow or radiology module — not consultation |

**Answer to your question**: Most imaging orders have `consultation_id = NULL` because they were created through the **radiology order form** (`/app/radiology/orders/new`) or through the **billing/checkout flow** — NOT through the consultation page. Only the consultation page passes `consultation_id` when creating orders (line 194 of `ConsultationPage.tsx`).

### The REAL Problem

For your **latest consultation** (`c13cba3f` for patient `bbed1ff7`), there are **zero imaging orders in the database**. The order was never created — likely because:

1. The duplicate key error (`IMG-260329-0002` already exists) killed the insert
2. The error was shown as a toast ("Failed to create order: duplicate key...") but the consultation still completed
3. So at checkout, there's nothing to show — not a query issue, but a **data creation failure**

The duplicate key fix we just deployed should prevent this going forward. But the imaging order for this specific consultation was lost.

## Recommended Fix

### 1. Add retry logic to imaging order creation in ConsultationPage

**File**: `src/pages/app/opd/ConsultationPage.tsx` (lines 191-203)

Currently, if one imaging order fails, the loop stops (it uses `await` in a `for` loop with no try-catch). Wrap each iteration in try-catch with a single retry:

```typescript
for (const item of imagingOrderItems) {
  try {
    await createImagingOrder.mutateAsync({ ... });
  } catch (err) {
    // Retry once (duplicate key race condition)
    try {
      await createImagingOrder.mutateAsync({ ... });
    } catch (retryErr) {
      toast.error(`Failed to create imaging order: ${item.procedure_name}`);
    }
  }
}
```

### 2. Prevent consultation from marking "completed" if orders failed

Currently the appointment status is set to `completed` (line 208) even if imaging order creation fails. Add a flag to track failures and warn the user.

### 3. For the current test: manually re-create the missing order

The user needs to go back to the radiology module and create the order manually for this patient, or re-do the consultation.

## Files to Change

- `src/pages/app/opd/ConsultationPage.tsx` — Add try-catch + retry around imaging order creation loop, track failures

