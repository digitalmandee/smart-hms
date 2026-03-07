

# Fix: Billing Session Scope & Dedicated Session Management Pages

## Problem Summary

1. **Billing session popup still shows up for non-receptionist flows** (surgery requests, lab tests, etc.) — sessions are only needed for **reception** and **pharmacy** payment collection points
2. **No dedicated session list/detail page** — "Billing Sessions" in the sidebar just goes to the general BillingDashboard, with no way to see session history, details, or user-wise opening/closing
3. **CashFlow page exists but shows accounting cash flow (operating/investing/financing)** — not user-wise session cash opening/closing as the user expects
4. **Daily Closing page exists but lacks department-wise breakdown**

## Changes Planned

### 1. Create a Billing Sessions List Page (`src/pages/app/billing/BillingSessionsPage.tsx`)
A dedicated page at `/app/billing/sessions` showing:
- **Active sessions** (open now) with open/close actions
- **Session history** table with filters (date range, counter type, user)
- Each row shows: session number, user name, counter type, shift, opening cash, collections, closing cash, cash difference, status
- Click to view session detail
- "Open Session" button at top

### 2. Create a Session Detail Page (`src/pages/app/billing/SessionDetailPage.tsx`)
Route: `/app/billing/sessions/:id`
Shows:
- Session info: number, counter type, shift, opened by, opened at, closed at
- Opening cash vs closing cash vs expected cash
- Transaction list (payments made during this session)
- Cash denomination breakdown (if closed)
- Discrepancy info and reconciliation status

### 3. Add a Session Cash Flow Report Card to BillingSessionsPage
A section showing **user-wise cash opening and closing** for selected date:
- Table: User | Counter | Shift | Opening Cash | Collections | Expected Cash | Actual Cash | Difference
- Filterable by date

### 4. Update sidebar and routes
- Change receptionist sidebar "Billing Sessions" path from `/app/billing` to `/app/billing/sessions`
- Add "Daily Closing" and "Closing History" to the receptionist Billing menu
- Add routes for `/app/billing/sessions` and `/app/billing/sessions/:id`

### 5. Verify session enforcement is removed from non-payment pages
Already removed from `InvoiceFormPage`, `LabPaymentDialog`, `QuickPaymentDialog` in previous changes. Verify no other non-reception pages still use `useRequireSession`. Current enforcement is correct — only on:
- OPDWalkInPage (reception)
- OPDCheckoutPage (reception)
- PaymentCollectionPage (reception)
- ClinicTokenPage (reception)

---

## Implementation Details

### New Files
| File | Purpose |
|------|---------|
| `src/pages/app/billing/BillingSessionsPage.tsx` | Sessions list with filters, user-wise cash summary, open/close actions |
| `src/pages/app/billing/SessionDetailPage.tsx` | Single session detail with transactions |

### Modified Files
| File | Change |
|------|--------|
| `src/config/role-sidebars.ts` | Update "Billing Sessions" path to `/app/billing/sessions`, add "Daily Closing" child |
| `src/App.tsx` | Add routes for `billing/sessions` and `billing/sessions/:id` |
| `src/lib/i18n/translations/en.ts` | Add ~15 keys for session pages |
| `src/lib/i18n/translations/ar.ts` | Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Urdu translations |
| `src/hooks/useBillingSessions.ts` | Add `useAllBranchSessions(dateRange)` hook for history with date filtering |

### BillingSessionsPage Layout
```text
┌──────────────────────────────────────────────┐
│ Billing Sessions            [Open Session]   │
│ Manage billing sessions & cash tracking      │
├──────────────────────────────────────────────┤
│ Filters: [Date] [Counter Type] [Status]      │
├──────────────────────────────────────────────┤
│ User-Wise Cash Summary (Today)               │
│ ┌──────────┬────────┬────────┬────────────┐  │
│ │ User     │ Open $ │ Close $│ Difference │  │
│ └──────────┴────────┴────────┴────────────┘  │
├──────────────────────────────────────────────┤
│ All Sessions Table                           │
│ ┌──────┬──────┬──────┬───────┬────────────┐  │
│ │ # │User│Counter│Collections│Status│Action│  │
│ └──────┴──────┴──────┴───────┴────────────┘  │
└──────────────────────────────────────────────┘
```

