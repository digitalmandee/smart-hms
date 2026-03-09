

# Add Radiology Order Builder to Consultation Page

## Overview
Add an "Imaging" tab to the consultation page so doctors can order radiology studies (X-Ray, CT, MRI, etc.) directly during consultation, mirroring the existing Lab Orders tab pattern.

## Changes

### 1. Create `RadiologyOrderBuilder` component
**New file: `src/components/consultation/RadiologyOrderBuilder.tsx`**

Modeled after `LabOrderBuilder.tsx`:
- Searchable list of common imaging procedures (from `IMAGING_MODALITIES` constants)
- Priority selector (routine/urgent/STAT)
- Each item has: modality, procedure name, clinical indication, body part
- Add/remove items, custom procedure entry
- Clinical notes textarea

Interface for items:
```typescript
export interface ImagingOrderItemInput {
  modality: ImagingModality;
  procedure_name: string;
  clinical_indication?: string;
  body_part?: string;
}
```

### 2. Update `ConsultationPage.tsx`
- Import `RadiologyOrderBuilder` and `useCreateImagingOrder`
- Add state: `imagingOrderItems`, `imagingOrderPriority`, `imagingOrderNotes`
- Add 5th tab "Imaging" with `Scan` icon (from lucide) in the tabs grid (change from `grid-cols-4` to `grid-cols-5`)
- In `saveConsultation()`: when completing, create imaging orders for each item (similar to lab order creation)
- Update `hasPendingOrders` check to include imaging items
- Pass imaging items to `VisitSummaryDialog`

### 3. Update `VisitSummaryDialog.tsx`
- Accept new prop `imagingOrderItems` (array of imaging order items)
- Display imaging orders section with `Scan` icon between Lab Orders and Follow-up
- Include imaging items in the pending checkout condition

### 4. No database changes needed
The `imaging_orders` table already exists with `consultation_id` field. The `useCreateImagingOrder` hook is already available.

## Files to create/modify
- **Create**: `src/components/consultation/RadiologyOrderBuilder.tsx`
- **Modify**: `src/pages/app/opd/ConsultationPage.tsx`
- **Modify**: `src/components/consultation/VisitSummaryDialog.tsx`

