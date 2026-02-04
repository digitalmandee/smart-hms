
# Complete Daily Closing & Cash Reconciliation System

## Executive Summary
This plan implements a comprehensive Daily Closing system that covers all billing counters (Reception, IPD, Pharmacy) with cash drawer reconciliation, session management, and consolidated day-end reporting.

---

## Current State Analysis

### What Exists
| Component | Status | Details |
|-----------|--------|---------|
| Pharmacy POS Sessions | Partial | Table exists (`pharmacy_pos_sessions`), but transactions bypass sessions |
| Automated Accounting | Complete | All payments auto-post to `journal_entries` via triggers |
| Shift-wise Reports | Complete | `ShiftWiseCollectionReport.tsx` analyzes revenue by shift/cashier |
| Payment Methods | Complete | Mapped to ledger accounts for accurate posting |

### What's Missing
| Feature | Impact |
|---------|--------|
| Billing Sessions Table | No session management for reception/IPD counters |
| Cash Drawer Reconciliation UI | Cashiers cannot enter physical counts |
| Daily Closing Wizard | No unified EOD workflow |
| Session-based Transaction Enforcement | Payments can be made without open sessions |
| Consolidated Day-End Summary | No single report combining all counters |

---

## Implementation Plan

### Phase 1: Database Schema

#### New Table: `billing_sessions`
Universal session management for all billing counters (not just pharmacy).

```sql
CREATE TABLE public.billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  session_number VARCHAR(50) NOT NULL,
  counter_type VARCHAR(30) NOT NULL CHECK (counter_type IN ('reception', 'ipd', 'pharmacy', 'opd')),
  opened_by UUID NOT NULL REFERENCES profiles(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_by UUID REFERENCES profiles(id),
  closed_at TIMESTAMPTZ,
  opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
  expected_cash DECIMAL(12,2),
  actual_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  card_total DECIMAL(12,2) DEFAULT 0,
  other_total DECIMAL(12,2) DEFAULT 0,
  total_collections DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reconciled')),
  notes TEXT,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'evening', 'night')),
  reconciled_by UUID REFERENCES profiles(id),
  reconciled_at TIMESTAMPTZ,
  discrepancy_approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### New Table: `daily_closings`
Master record for end-of-day reconciliation.

```sql
CREATE TABLE public.daily_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  closing_date DATE NOT NULL,
  closing_number VARCHAR(50) NOT NULL,
  total_cash_collected DECIMAL(12,2) DEFAULT 0,
  total_card_collected DECIMAL(12,2) DEFAULT 0,
  total_other_collected DECIMAL(12,2) DEFAULT 0,
  grand_total DECIMAL(12,2) DEFAULT 0,
  total_invoices INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  outstanding_receivables DECIMAL(12,2) DEFAULT 0,
  pharmacy_sales DECIMAL(12,2) DEFAULT 0,
  opd_collections DECIMAL(12,2) DEFAULT 0,
  ipd_collections DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  closed_by UUID REFERENCES profiles(id),
  closed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, branch_id, closing_date)
);
```

---

### Phase 2: React Hooks

#### `useBillingSessions.ts`
```typescript
// Core functions:
- useOpenSession(counterType) - Opens new billing session
- useCloseSession() - Closes session with cash count
- useActiveSession(counterType) - Gets current open session
- useSessionTransactions(sessionId) - Lists transactions in session
- useReconcileSession() - Finalizes with manager approval
```

#### `useDailyClosing.ts`
```typescript
// Core functions:
- useDailyClosingSummary(date) - Aggregates all sessions for a day
- useCreateDailyClosing() - Creates EOD record
- useApproveDailyClosing() - Manager approval
- useDailyClosingHistory(days) - Historical closings list
```

---

### Phase 3: UI Components

#### A. Session Management Components

| Component | Purpose |
|-----------|---------|
| `OpenSessionDialog.tsx` | Open shift with opening cash balance |
| `CloseSessionDialog.tsx` | Close shift with cash count and reconciliation |
| `SessionStatusBadge.tsx` | Shows current session status |
| `ActiveSessionBanner.tsx` | Persistent banner showing active session |

#### B. Daily Closing Pages

| Page | Route | Purpose |
|------|-------|---------|
| `DailyClosingPage.tsx` | `/app/billing/daily-closing` | Main wizard for EOD |
| `SessionsListPage.tsx` | `/app/billing/sessions` | View all sessions |
| `ClosingHistoryPage.tsx` | `/app/billing/closing-history` | Past daily closings |

---

### Phase 4: Daily Closing Wizard Flow

```text
Step 1: Session Review
+--------------------------------+
| Today's Sessions               |
+--------------------------------+
| [x] Reception - Morning        |
|     Opened: 8:00 AM            |
|     Collections: Rs. 45,000    |
|     Status: Closed             |
+--------------------------------+
| [x] IPD Counter - Morning      |
|     Opened: 8:00 AM            |
|     Collections: Rs. 125,000   |
|     Status: Closed             |
+--------------------------------+
| [ ] Pharmacy - Evening         |
|     Opened: 2:00 PM            |
|     Collections: Rs. 32,000    |
|     Status: OPEN (Must Close!) |
+--------------------------------+
     [Close All Open Sessions →]

Step 2: Cash Reconciliation
+--------------------------------+
| Cash Drawer Reconciliation     |
+--------------------------------+
| Expected Cash: Rs. 85,000      |
|                                |
| Enter Physical Count:          |
| 5000 notes: [__] x 5000        |
| 1000 notes: [__] x 1000        |
| 500 notes:  [__] x 500         |
| 100 notes:  [__] x 100         |
| 50 notes:   [__] x 50          |
| 20 notes:   [__] x 20          |
| 10 notes:   [__] x 10          |
| Coins:      [_______]          |
+--------------------------------+
| Total Counted: Rs. 84,800      |
| Difference: -Rs. 200 (SHORT)   |
+--------------------------------+
     [Explain Discrepancy...]
     [Continue →]

Step 3: Summary & Approval
+--------------------------------+
| Daily Closing Summary          |
| Date: Feb 4, 2026              |
+--------------------------------+
| Total Collections:             |
|   Cash:       Rs. 85,000       |
|   Card:       Rs. 42,000       |
|   Other:      Rs. 15,000       |
|   -----------------------      |
|   TOTAL:      Rs. 142,000      |
+--------------------------------+
| By Department:                 |
|   OPD:        Rs. 45,000       |
|   IPD:        Rs. 65,000       |
|   Pharmacy:   Rs. 32,000       |
+--------------------------------+
| Outstanding: Rs. 28,500        |
+--------------------------------+
| Notes: [_________________]     |
+--------------------------------+
     [Save Draft] [Submit for Approval]
```

---

### Phase 5: Integration Points

#### 1. Payment Collection Page
Add session validation before accepting payments:
```typescript
// In PaymentCollectionPage.tsx
const { data: activeSession } = useActiveSession('reception');
if (!activeSession) {
  return <OpenSessionPrompt />;
}
```

#### 2. Billing Dashboard
Add session status card and quick actions:
- "Open Session" button if no active session
- "Close Session" button if session is open
- Daily closing summary widget

#### 3. Navigation Updates
Add new menu items:
- Billing > Sessions
- Billing > Daily Closing
- Reports > Daily Closing History

---

## Files to Create

### Database
| File | Purpose |
|------|---------|
| `supabase/migrations/[timestamp]_billing_sessions.sql` | New tables + RLS |

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useBillingSessions.ts` | Session CRUD operations |
| `src/hooks/useDailyClosing.ts` | EOD operations |

### Components
| File | Purpose |
|------|---------|
| `src/components/billing/OpenSessionDialog.tsx` | Open session modal |
| `src/components/billing/CloseSessionDialog.tsx` | Close session with cash count |
| `src/components/billing/SessionStatusBadge.tsx` | Status indicator |
| `src/components/billing/ActiveSessionBanner.tsx` | Header banner |
| `src/components/billing/CashDenominationInput.tsx` | Cash counting UI |
| `src/components/billing/DailyClosingSummary.tsx` | Summary card |

### Pages
| File | Purpose |
|------|---------|
| `src/pages/app/billing/DailyClosingPage.tsx` | Main wizard |
| `src/pages/app/billing/SessionsListPage.tsx` | Sessions history |
| `src/pages/app/billing/ClosingHistoryPage.tsx` | Past closings |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/billing/BillingDashboard.tsx` | Add session status, quick actions |
| `src/pages/app/billing/PaymentCollectionPage.tsx` | Session validation |
| `src/App.tsx` | New routes |
| `src/config/role-sidebars.ts` | Add menu items for billing roles |

---

## Technical Specifications

### Cash Denomination Calculator
Pakistani currency denominations:
- Notes: 5000, 1000, 500, 100, 50, 20, 10
- Coins: 5, 2, 1

### Session Number Format
`SES-YYMMDD-XXXX` (e.g., `SES-260204-0001`)

### Daily Closing Number Format  
`EOD-YYMMDD-XX` (e.g., `EOD-260204-01`)

### Shift Detection
Uses existing `getShiftFromTime()` from `ShiftFilter.tsx`:
- Morning: 6:00 AM - 1:59 PM
- Evening: 2:00 PM - 9:59 PM  
- Night: 10:00 PM - 5:59 AM

---

## Security & Permissions

### RLS Policies
- Sessions visible only within same organization/branch
- Only session opener can close their session
- Discrepancy approval requires manager role
- Daily closing approval requires `billing_manager` or `org_admin`

### Audit Trail
All session and closing records include:
- `created_at`, `opened_by`, `closed_by`
- `reconciled_by`, `approved_by`
- Timestamps for each action

---

## Implementation Order

1. **Database Migration** - Create tables with RLS
2. **Hooks** - `useBillingSessions` and `useDailyClosing`
3. **Session Components** - Open/Close dialogs
4. **Daily Closing Page** - Step-by-step wizard
5. **Integration** - Update existing billing pages
6. **Navigation** - Add menu items
7. **Testing** - End-to-end flow validation

---

## Expected Outcomes

After implementation:
- Cashiers must open a session before collecting payments
- Physical cash counts are recorded at shift end
- Discrepancies are tracked and require explanation
- Daily closing provides consolidated EOD summary
- Managers can approve closings with full audit trail
- Reports show historical closing data for reconciliation
