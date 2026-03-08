

# ZATCA & Wasfaty Integration Audit — Findings & Implementation Plan

## Current State Analysis

### ZATCA E-Invoicing

| Component | Status | Issue |
|-----------|--------|-------|
| `zatca-einvoice` edge function | ✅ Exists | Phase 1 QR generation |
| `zatca-phase2` edge function | ✅ Exists | UBL 2.1 XML + Phase 2 QR |
| `ublGenerator.ts` library | ✅ Exists | Invoice XML generation |
| Database columns (`zatca_qr_code`, `zatca_uuid`, etc.) | ✅ Exists | On `invoices` table |
| **Invoice UI integration** | ❌ MISSING | No button to generate ZATCA QR, no display of QR on invoice |
| **PrintableInvoice QR display** | ❌ MISSING | ZATCA QR code not shown on printed invoices |
| **Auto-generation on invoice creation** | ❌ MISSING | Must be triggered manually |

**Problem**: ZATCA backend is complete, but **not connected to the invoicing UI**. Users cannot generate or see ZATCA QR codes.

### Wasfaty E-Prescription

| Component | Status | Issue |
|-----------|--------|-------|
| `wasfaty-gateway` edge function | ✅ Exists | Prescription submission API |
| `WasfatyConfigPanel.tsx` | ✅ Exists | Organization config UI |
| `WasfatySubmitButton.tsx` | ✅ Exists | Prescription submit button |
| `wasfaty_prescriptions` table | ✅ Exists | Database storage |
| **Config panel in settings** | ❌ NOT USED | `WasfatyConfigPanel` is never imported |
| **Submit button in dispensing** | ❌ NOT USED | `WasfatySubmitButton` is never imported |
| **PrescriptionQueuePage integration** | ❌ MISSING | No Wasfaty status shown |

**Problem**: Wasfaty components exist but are **orphaned** — not integrated into any page.

---

## Implementation Plan

### 1. ZATCA Invoice Integration

**Files to modify:**

| File | Change |
|------|--------|
| `src/pages/app/billing/InvoiceDetailPage.tsx` | Add "Generate ZATCA QR" button, display ZATCA status badge, show QR code |
| `src/components/billing/PrintableInvoice.tsx` | Display `zatca_qr_code` as scannable QR image when present |
| `src/hooks/useBilling.ts` | Add `useGenerateZatcaQR` mutation hook to call edge function |
| `src/pages/app/billing/InvoiceFormPage.tsx` | Auto-trigger ZATCA generation when KSA + e_invoicing_enabled + invoice finalized |

**New component:**
- `src/components/billing/ZatcaQRDisplay.tsx` — Shows ZATCA QR code with status badge

### 2. Wasfaty Prescription Integration

**Files to modify:**

| File | Change |
|------|--------|
| `src/pages/app/billing/NphiesSettingsPage.tsx` | Add Wasfaty config tab or section (import `WasfatyConfigPanel`) |
| `src/pages/app/pharmacy/DispensingPage.tsx` | Add `WasfatySubmitButton` when KSA + wasfaty_enabled |
| `src/pages/app/pharmacy/PrescriptionQueuePage.tsx` | Show `WasfatyStatusBadge` for each prescription |

---

## Technical Details

### ZATCA QR on Invoice Detail Page
```
┌─────────────────────────────────────────┐
│ Invoice INV-240308-001                  │
├─────────────────────────────────────────┤
│ [Status: Paid]                          │
│                                         │
│ ZATCA Compliance (KSA only)             │
│ ┌───────────┐                           │
│ │   [QR]    │  Status: Generated        │
│ │           │  UUID: abc-123...         │
│ └───────────┘  ICV: 42                  │
│                                         │
│ [Generate ZATCA QR] (if not generated)  │
│ [Re-generate] (if already generated)    │
└─────────────────────────────────────────┘
```

### ZATCA QR on Printed Invoice
- If `invoice.zatca_qr_code` exists, render as QR image in bottom-right corner
- Base64 TLV data converted to QR image using existing `generateQRCodeUrl` util

### Wasfaty in Dispensing Page
```
┌─────────────────────────────────────────┐
│ Prescription #RX-001                    │
├─────────────────────────────────────────┤
│ [Medication list...]                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Wasfaty (KSA Only)                  │ │
│ │ [Send to Wasfaty]  Status: Pending  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Summary of Changes

| Task | Files | Priority |
|------|-------|----------|
| Add ZATCA QR button + display to InvoiceDetailPage | 1 file | HIGH |
| Display ZATCA QR on PrintableInvoice | 1 file | HIGH |
| Create `useGenerateZatcaQR` hook | 1 file | HIGH |
| Add WasfatyConfigPanel to NphiesSettingsPage | 1 file | MEDIUM |
| Add WasfatySubmitButton to DispensingPage | 1 file | MEDIUM |
| Add WasfatyStatusBadge to PrescriptionQueuePage | 1 file | MEDIUM |

**Total: 6 files to modify, 1 new component to create**

