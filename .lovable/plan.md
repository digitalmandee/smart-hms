

# Fix: Radiology Orders Not Showing in OPD Checkout

## Root Cause

The imaging orders query on line 172-185 of `OPDCheckoutPage.tsx` filters **only** by `consultation_id`. When imaging orders were created but failed to link to the consultation (e.g., due to the duplicate key errors we fixed earlier), they have `consultation_id = NULL` and are invisible at checkout.

## Fix

### File: `src/pages/app/opd/OPDCheckoutPage.tsx` (lines 172-185)

Change the imaging orders query to use an `.or()` filter that captures:
1. Orders linked to this consultation (`consultation_id = X`)
2. Orders for the same patient created today with no consultation link and no invoice (`consultation_id IS NULL AND patient_id = Y AND invoice_id IS NULL AND created_at >= today`)

```typescript
const { data: imagingOrders } = useQuery({
  queryKey: ["opd-checkout-imaging-orders", consultation?.id, appointment?.patient?.id],
  queryFn: async () => {
    const today = new Date().toISOString().split('T')[0];
    const patientId = appointment?.patient?.id;
    
    let query = supabase
      .from("imaging_orders")
      .select("*, imaging_procedure:imaging_procedures(base_price, service_type_id, service_types(id, default_price))");
    
    if (consultation?.id && patientId) {
      query = query.or(
        `consultation_id.eq.${consultation.id},and(patient_id.eq.${patientId},consultation_id.is.null,invoice_id.is.null,created_at.gte.${today})`
      );
    } else if (consultation?.id) {
      query = query.eq("consultation_id", consultation.id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  enabled: !!(consultation?.id || appointment?.patient?.id),
});
```

This ensures imaging orders that weren't properly linked to the consultation (due to the earlier duplicate key bug) still appear at checkout for billing.

### No other files changed. No migration needed.

