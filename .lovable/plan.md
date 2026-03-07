

# Fix: Billing Session Menu & Scope Enforcement

## Problems

1. **No menu item** for opening/closing billing sessions in the receptionist sidebar. Receptionists must navigate to `/app/billing` manually.
2. **Billing session popup appears for non-reception roles** — Lab technicians (LabPaymentDialog), IPD staff (QuickPaymentDialog), and invoice creators (InvoiceFormPage) all enforce `useRequireSession("reception")`, even though only reception staff manage billing sessions.

## Changes

### 1. Add "Billing Sessions" menu item to receptionist sidebar
**File: `src/config/role-sidebars.ts`** (lines 434-444)

Add a "Billing Sessions" child under the Billing group pointing to `/app/billing`:

```
children: [
  { name: "Billing Sessions", path: "/app/billing", icon: "Monitor" },
  { name: "OPD Checkout", path: "/app/opd/checkout", icon: "Receipt" },
  { name: "New Invoice", path: "/app/billing/invoices/new", icon: "FilePlus" },
  ...
]
```

### 2. Remove billing session enforcement from non-reception pages

These components should NOT require a billing session because they are used by non-reception roles:

| File | Current | Fix |
|------|---------|-----|
| `src/components/lab/LabPaymentDialog.tsx` | Blocks payment if no session | Remove `useRequireSession`; pass `billingSessionId` as `undefined` (optional) |
| `src/components/ipd/QuickPaymentDialog.tsx` | Blocks entire dialog if no session | Remove `useRequireSession`; pass `billingSessionId` as `undefined` |
| `src/pages/app/billing/InvoiceFormPage.tsx` | Shows warning if no session | Remove `useRequireSession` entirely (creating invoices is not payment collection) |

Pages that correctly keep session enforcement (reception-only):
- `OPDWalkInPage.tsx` — reception walk-in flow
- `OPDCheckoutPage.tsx` — reception checkout flow  
- `PaymentCollectionPage.tsx` — direct payment collection
- `ClinicTokenPage.tsx` — clinic token (reception-driven)

### 3. Add i18n key
**Files: `en.ts`, `ar.ts`, `ur.ts`**

Add `billing.billingSessions`: "Billing Sessions" / "جلسات الفوترة" / "بلنگ سیشنز"

### 4. Ensure `Monitor` icon is mapped
**Files: `DynamicSidebar.tsx`, `MobileSideMenu.tsx`**

Verify `Monitor` is in the `iconMap`. If not, add it.

