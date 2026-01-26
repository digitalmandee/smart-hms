
# Plan: Fix Room Charges Display and Lab Order Creation from Invoice

## Issues Identified

### Issue 1: Room Charges Calculation Bug
The `useAdmissionFinancials` hook has a critical bug:

**Line 141**: Calculates room charges dynamically:
```typescript
const roomCharges = daysAdmitted * dailyRate;
```

**Lines 163-167**: ALSO adds posted room charges to `serviceCharges`:
```typescript
case "service":
case "room":  // Room charges incorrectly going to serviceCharges!
  serviceCharges += amount;
```

This causes:
- **Double counting**: Room charges calculated dynamically AND from posted charges
- **Confusion**: Deposit (Rs. 10,000) showing separately while room charges are miscategorized
- **Inaccurate balance**: Total charges includes both calculated room charges and posted ones

### Issue 2: Lab Order Not Created from Invoice
The `create_lab_order_from_invoice` trigger fails because:

**Current RLS Policy** on `lab_orders` (INSERT):
```sql
has_permission('ot:view') OR has_permission('laboratory.orders') OR has_permission('consultations.create')
```

Billing staff creating invoices don't have these permissions, causing silent trigger failure.

---

## Solution

### Phase 1: Fix Room Charges Logic in useAdmissionFinancials.ts

**File:** `src/hooks/useAdmissionFinancials.ts`

Change the logic to:
1. **Use posted room charges from ipd_charges table** instead of dynamic calculation
2. **Fall back to dynamic calculation** only if no room charges are posted
3. **Display daily rate info** for transparency

```typescript
// Categorize charges - separate room charges from service charges
let postedRoomCharges = 0;
let serviceCharges = 0;
let medicationCharges = 0;
let labCharges = 0;
let otherCharges = 0;
let hasUnbilledCharges = false;

(charges || []).forEach((charge) => {
  const amount = charge.total_amount || 0;
  
  if (!charge.is_billed) {
    hasUnbilledCharges = true;
  }

  switch (charge.charge_type) {
    case "room":
      postedRoomCharges += amount;  // Correctly sum room charges
      break;
    case "medication":
      medicationCharges += amount;
      break;
    case "lab":
      labCharges += amount;
      break;
    case "service":
      serviceCharges += amount;
      break;
    default:
      otherCharges += amount;
  }
});

// Use posted room charges if available, otherwise calculate dynamically
const roomCharges = postedRoomCharges > 0 
  ? postedRoomCharges 
  : daysAdmitted * dailyRate;
```

### Phase 2: Update AdmissionFinancialSummary Display

**File:** `src/components/ipd/AdmissionFinancialSummary.tsx`

Update the room charges display to show:
- Posted room charges amount
- Number of days charged vs total days admitted
- "Sync" button if room charges need backfilling

```tsx
<div className="flex items-center justify-between py-2 border-b">
  <div className="flex items-center gap-2">
    <BedDouble className="h-4 w-4 text-blue-500" />
    <span>Room Charges</span>
    <Badge variant="secondary" className="text-xs">
      {financials.roomChargesDaysPosted || financials.daysAdmitted} days × {formatCurrency(financials.dailyRate)}
    </Badge>
  </div>
  <span className="font-medium">{formatCurrency(financials.roomCharges)}</span>
</div>
```

### Phase 3: Fix Lab Order RLS Policy

**SQL Migration**

Update the INSERT policy on `lab_orders` to include billing permissions:

```sql
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "OT and Lab staff can create lab orders" ON public.lab_orders;

-- Create new policy that includes billing staff
CREATE POLICY "Clinical and billing users can create lab orders" 
ON public.lab_orders FOR INSERT 
WITH CHECK (
  has_permission('ot:view'::text) OR 
  has_permission('laboratory.orders'::text) OR 
  has_permission('consultations.create'::text) OR
  has_permission('billing.invoices'::text) OR
  has_permission('billing.create'::text) OR
  has_permission('patients.create'::text)
);

-- Also update lab_order_items to allow creation via trigger
DROP POLICY IF EXISTS "Users with appropriate permissions can create lab order items" 
ON public.lab_order_items;

CREATE POLICY "Users can create lab order items for org lab orders"
ON public.lab_order_items FOR INSERT
WITH CHECK (
  (lab_order_id IN (
    SELECT lo.id FROM public.lab_orders lo
    JOIN public.branches b ON b.id = lo.branch_id
    WHERE b.organization_id = get_user_organization_id()
  )) AND (
    has_permission('consultations.create'::text) OR 
    has_permission('ot:view'::text) OR 
    has_permission('laboratory.orders'::text) OR
    has_permission('billing.invoices'::text) OR
    has_permission('billing.create'::text)
  )
);
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/hooks/useAdmissionFinancials.ts` | Fix room charge categorization - use posted charges |
| `src/components/ipd/AdmissionFinancialSummary.tsx` | Update display to show accurate room charges |
| Database Migration | Update lab_orders and lab_order_items INSERT policies |

---

## Expected Outcome

After implementation:
1. **Room Charges**: Correctly display posted room charges from `ipd_charges` table, not double-counted
2. **Deposit vs Room**: Clear separation - deposit shows as credit, room charges show as line items
3. **Lab Orders**: Invoices with lab items will automatically create lab orders via trigger
4. **Accurate Balance**: Total = Room + Services + Meds + Lab - Deposit

---

## Technical Details

### Room Charges Flow (Fixed)

```text
┌─────────────────────────────────────────────────────────┐
│ ipd_charges table (charge_type = 'room')                │
│ - Populated by daily edge function or manual sync       │
│ - Each day = 1 record with daily rate                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ useAdmissionFinancials hook                             │
│ - Sum all ipd_charges where charge_type = 'room'        │
│ - Fall back to (days × rate) if no charges posted       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ AdmissionFinancialSummary                               │
│ - Display: Room Charges: Rs. X (Y days × Rs. Z/day)     │
│ - Separate from Deposit Collected                       │
└─────────────────────────────────────────────────────────┘
```

### Lab Order Creation Flow (Fixed)

```text
┌──────────────────┐     ┌────────────────────────────┐
│ Create Invoice   │────▶│ trg_create_lab_order       │
│ (with lab items) │     │ (AFTER INSERT trigger)     │
└──────────────────┘     └─────────────┬──────────────┘
                                       │
                                       ▼
                         ┌────────────────────────────┐
                         │ RLS Policy Check           │
                         │ ✓ billing.invoices OR      │
                         │ ✓ billing.create OR        │
                         │ ✓ laboratory.orders        │
                         └─────────────┬──────────────┘
                                       │
                                       ▼
                         ┌────────────────────────────┐
                         │ lab_orders + lab_order_items│
                         │ created successfully       │
                         └────────────────────────────┘
```
