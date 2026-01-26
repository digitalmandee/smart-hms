
# Plan: Fix Duplicate Room Charges and Add Database Protection

## Issue Verified

The investigation confirmed that **duplicate room charges** exist in the database:

| Field | Value |
|-------|-------|
| Admission Date | **2026-01-26** |
| Charge 1 | 2026-01-25, Rs. 5,000, created at 14:39:14.554 |
| Charge 2 | 2026-01-25, Rs. 5,000, created at 14:39:14.582 |
| **Total Displayed** | **Rs. 10,000** (incorrectly doubled) |

**Root Causes:**
1. No unique constraint on `ipd_charges` table to prevent duplicate room charges per day
2. Race condition in the `useEffect` that triggers backfill on page load
3. Date calculation issue causing charges for the wrong date

---

## Solution

### Phase 1: Add Database Unique Constraint (Prevents Future Duplicates)

Create a unique partial index to prevent multiple room charges for the same admission on the same day:

```sql
-- Add unique constraint to prevent duplicate room charges per admission per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_ipd_charges_unique_room_per_day 
ON public.ipd_charges (admission_id, charge_date, charge_type) 
WHERE charge_type = 'room';
```

This allows multiple "service" or "medication" charges per day but only ONE room charge per day.

### Phase 2: Clean Up Existing Duplicate Data

Delete duplicate room charges, keeping only the first one created:

```sql
-- Delete duplicate room charges (keep the earliest one per admission+date)
DELETE FROM public.ipd_charges
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY admission_id, charge_date, charge_type ORDER BY created_at) as rn
    FROM public.ipd_charges
    WHERE charge_type = 'room'
  ) dupes
  WHERE rn > 1
);
```

### Phase 3: Fix Race Condition in DischargeFormPage

Add a flag to prevent multiple backfill calls:

**File:** `src/pages/app/ipd/DischargeFormPage.tsx`

```typescript
// Add ref to track if backfill was already triggered
const backfillTriggeredRef = useRef(false);

useEffect(() => {
  if (
    admission?.id && 
    admission?.admission_date && 
    !isLoading &&
    !backfillTriggeredRef.current  // Only trigger once
  ) {
    backfillTriggeredRef.current = true;
    backfillRoomCharges({
      admissionId: admission.id,
      admissionDate: admission.admission_date,
      bedType: admission.bed?.bed_type || null,
      bedNumber: admission.bed?.bed_number || null,
      wardChargePerDay: dailyRate,
    });
  }
}, [admission?.id, admission?.admission_date, isLoading, dailyRate]);

// Reset on unmount if needed
useEffect(() => {
  return () => {
    backfillTriggeredRef.current = false;
  };
}, []);
```

### Phase 4: Fix Date Calculation in useRoomChargeSync

Ensure consistent UTC date handling:

**File:** `src/hooks/useRoomChargeSync.ts`

```typescript
// Current (problematic - uses local time):
const startDate = new Date(admissionDate);
startDate.setHours(0, 0, 0, 0);
const today = new Date();
today.setHours(0, 0, 0, 0);

// Fixed (consistent date strings):
const startDateStr = admissionDate.split('T')[0]; // Extract YYYY-MM-DD
const todayStr = new Date().toISOString().split('T')[0]; // Today as YYYY-MM-DD

// Then iterate using date strings for comparison
```

---

## Files to Modify

| File | Action |
|------|--------|
| Database Migration | Add unique index + clean up duplicates |
| `src/pages/app/ipd/DischargeFormPage.tsx` | Add ref to prevent duplicate backfill calls |
| `src/hooks/useRoomChargeSync.ts` | Fix date calculation to use consistent UTC |

---

## Expected Outcome

After implementation:
1. **Existing duplicates cleaned up** - Patient will show Rs. 5,000 (1 day × Rs. 5,000) instead of Rs. 10,000
2. **Future duplicates prevented** - Database constraint ensures only one room charge per day per admission
3. **No race condition** - `useRef` prevents multiple backfill triggers
4. **Consistent dates** - Room charges are posted for correct dates regardless of timezone
