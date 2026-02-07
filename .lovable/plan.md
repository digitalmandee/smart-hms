# Billing Session Enforcement - COMPLETED

## Implementation Summary

This plan has been **fully implemented**. All payment collection pages now require an active billing session.

### Files Created
- `src/hooks/useRequireSession.ts` - Hook to check for active billing session
- `src/components/billing/SessionRequiredGuard.tsx` - Guard component that blocks payment collection
- `src/components/billing/SessionStatusBanner.tsx` - Banner showing session status

### Files Modified
- `src/hooks/useBilling.ts` - Added `billingSessionId` parameter to `useRecordPayment`
- `src/hooks/useIPDDeposit.ts` - Added session linking for deposit payments
- `src/pages/app/billing/PaymentCollectionPage.tsx` - Full session guard + banner
- `src/pages/app/billing/InvoiceFormPage.tsx` - Warning banner (soft enforcement)
- `src/pages/app/opd/OPDCheckoutPage.tsx` - Session guard + session ID linking
- `src/pages/app/opd/OPDWalkInPage.tsx` - Session banner + payment session linking
- `src/pages/app/clinic/ClinicTokenPage.tsx` - Session banner + payment session linking
- `src/components/ipd/QuickPaymentDialog.tsx` - Session requirement check
- `src/components/lab/LabPaymentDialog.tsx` - Session requirement check

### Behavior
1. **Hard Enforcement** (PaymentCollectionPage, OPDCheckoutPage): Blocks payment collection entirely without session
2. **Soft Enforcement** (InvoiceFormPage): Shows warning but allows invoice creation
3. **Session Linking**: All payments now include `billing_session_id` for audit trail
4. **Status Banners**: Visual indicators on payment pages showing session status

### User Flow
```
Staff Login → Navigate to Billing → See "No Active Session" warning
    ↓
Click "Open Session" → Enter opening cash → Session started
    ↓
All payment pages now accessible with session ID linked
    ↓
End of shift → Close Session → Cash reconciliation
```
