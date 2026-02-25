

# Fix IPD Dashboard: Auto-show Recent Admissions + Realtime Notifications

## Problem Summary

1. **New admissions don't appear on IPD Dashboard** -- The dashboard queries `useAdmissions("admitted")` but new admissions start with `"pending"` status. They only appear after nurse confirmation. The dashboard should show ALL recent admissions (pending + admitted) automatically.

2. **No realtime updates** -- The IPD dashboard has no Supabase Realtime subscription, so new admissions only appear after manual page refresh. Other modules (Lab Queue, Appointment Queue) already have realtime -- IPD should too.

3. **No in-app push notification for new admissions** -- When a new admission is created, staff on the IPD dashboard should receive an in-app toast/notification immediately.

4. **AdmissionCard missing "pending" status color** -- The status badge shows no color for pending admissions.

---

## Changes

### 1. IPD Dashboard -- Show Recent Admissions (All Statuses)

**File: `src/pages/app/ipd/IPDDashboard.tsx`**

- Change line 46 from `useAdmissions("admitted")` to a new hook call that fetches BOTH `pending` and `admitted` admissions, ordered by `created_at DESC`, limited to 6
- Add Supabase Realtime subscription on the `admissions` table that auto-invalidates queries when INSERT/UPDATE events occur
- Show a toast notification ("New admission: [Patient Name] - [Admission Number]") when a new admission INSERT is detected via realtime
- Add `pending` admissions as a separate highlighted section above the "admitted" ones, or merge them with a visible "NEW" badge

### 2. New Hook: `useRecentAdmissions`

**File: `src/hooks/useAdmissions.ts`**

- Add a new `useRecentAdmissions(limit?: number)` hook that fetches admissions with status IN (`pending`, `admitted`) ordered by `created_at DESC` with a limit (default 6)
- This ensures the dashboard always shows the latest activity without requiring a specific status filter

### 3. Realtime Subscription for IPD Dashboard

**File: `src/pages/app/ipd/IPDDashboard.tsx`**

- Add a `useEffect` with a Supabase channel subscribing to `postgres_changes` on the `admissions` table (same pattern as `LabQueuePage.tsx` and `AppointmentQueuePage.tsx`)
- On INSERT: invalidate `admissions`, `ipd-stats`, `pending-rounds` queries + show toast notification
- On UPDATE: invalidate same queries (covers status changes like pending to admitted)
- Cleanup channel on unmount

### 4. AdmissionCard -- Add Pending Status Color

**File: `src/components/ipd/AdmissionCard.tsx`**

- Add `pending: "bg-amber-500/10 text-amber-600 border-amber-500/20"` to the `statusColors` map
- Add a pulsing "NEW" indicator for pending admissions to draw attention

### 5. AdmissionsListPage -- Default to Showing All Active

**File: `src/pages/app/ipd/AdmissionsListPage.tsx`**

- No change needed -- already has "pending" and "admitted" tabs. The issue was specifically about the dashboard not showing new ones.

### 6. Mobile IPD Dashboard -- Same Realtime

**File: `src/components/mobile/MobileIPDDashboard.tsx`**

- Update to show pending admissions with the "NEW" badge
- The realtime subscription will be in the parent `IPDDashboard.tsx` which passes data down

### 7. Translation Keys

**Files: `en.ts`, `ur.ts`, `ar.ts`**

Add:
- `"ipd.newAdmissionAlert"`: "New Admission" / "نیا داخلہ" / "قبول جديد"
- `"ipd.pendingConfirmation"`: "Pending Confirmation" / "تصدیق زیر التواء" / "في انتظار التأكيد"

---

## Technical Details

- Realtime follows the exact pattern from `src/pages/app/appointments/AppointmentQueuePage.tsx` (lines 71-88)
- The `useRecentAdmissions` hook queries with `.in("status", ["pending", "admitted"])` and `.order("created_at", { ascending: false }).limit(6)`
- Toast notifications use the existing `usePushNotifications().showLocalNotification()` for native platforms and `sonner` toast for web
- The realtime channel filters by `organization_id` where possible using the `filter` parameter to reduce noise
- Bed management already has View, Edit, Transfer, Admit, Bulk Add, and Edit Layout buttons -- these are functioning correctly
- OPD flow (appointments, queue, check-in) is confirmed working with existing realtime subscriptions

