
# Invoice Consultation Pricing Fix

## Problem Summary
When creating a new invoice and selecting a "Consultation" service type, the price defaults to the service's `default_price` (e.g., Rs. 2000) instead of allowing selection of a doctor whose specific consultation fee should be used. Additionally, there's no doctor selector, so doctor wallet earnings cannot be attributed.

## Current Architecture

**Data Flow Analysis:**
- `service_types` table has category="consultation" with a generic `default_price`
- `doctors` table has per-doctor `consultation_fee`
- `doctor_fee_schedule` allows different fees by appointment type per doctor
- `invoice_items.doctor_id` exists for wallet earning attribution but isn't populated from the invoice form

## Solution Design

### Phase 1: Add Doctor Selector for Consultation Services

**Modify `InvoiceItemsBuilder.tsx`:**
- Detect when a service with category="consultation" is selected
- Show a doctor selector dropdown after selecting a consultation service
- Fetch the selected doctor's consultation fee (from `doctors.consultation_fee` or `doctor_fee_schedule`)
- Auto-populate the unit price with the doctor's fee
- Store `doctor_id` in the invoice item for wallet earnings

### Phase 2: Create Doctor-Consultation Selector Component

**New Component: `ConsultationDoctorSelector.tsx`**
- Reusable component for selecting doctor when adding consultation items
- Shows doctor name, specialization, and their consultation fee
- Returns doctor_id and fee for the invoice item

### Phase 3: Update Invoice Item Flow

**Update `InvoiceItemsBuilder.tsx` logic:**
```
1. User clicks "Consultation" category
2. User selects a consultation service (e.g., "General Consultation")
3. NEW: Doctor selector appears
4. User selects a doctor
5. Price auto-fills with doctor's consultation_fee (or doctor_fee_schedule if exists)
6. Item added with both service_type_id AND doctor_id
```

## Technical Implementation

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/billing/ConsultationDoctorSelector.tsx` | Doctor picker with fee display for consultations |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/billing/InvoiceItemsBuilder.tsx` | Add doctor selection flow for consultation services |
| `src/hooks/useBilling.ts` | Already supports doctor_id - no changes needed |

### UI Flow Changes

**Before (Current):**
```
Select Service → Price auto-fills from service_types.default_price → Add Item
```

**After (Proposed):**
```
Select Consultation Service → Select Doctor → Price auto-fills from doctor.consultation_fee → Add Item (with doctor_id)
```

### Database Dependencies (Already Exist)
- `doctors.consultation_fee` - Default fee per doctor
- `doctor_fee_schedule` - Fee by appointment type per doctor
- `invoice_items.doctor_id` - Already exists for attribution

### Fallback Logic
1. Try `doctor_fee_schedule` for matching appointment type first
2. Fall back to `doctors.consultation_fee`
3. Finally fall back to `service_types.default_price` if no doctor selected

## Summary

| Item | Current | After Fix |
|------|---------|-----------|
| Consultation price source | `service_types.default_price` | `doctor.consultation_fee` or `doctor_fee_schedule` |
| Doctor selection | Not available | Required for consultation items |
| Doctor attribution | Missing | Stored in `invoice_items.doctor_id` |
| Wallet earnings | Not triggered | Will trigger via existing `doctor_id` triggers |

This fix ensures consultation fees on invoices match the actual doctor's rate and properly attribute earnings for commission tracking.
