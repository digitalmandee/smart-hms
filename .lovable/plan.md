
# Token Status Update Analysis & Issues

## Current Flow Analysis

### 1. Token Generation (Reception Side)
**Works Correctly:**
- `OPDWalkInPage.tsx` creates appointment with `status: "scheduled"` + `token_number`
- `useCreateAppointment` (line 211-232) generates sequential token per doctor/date
- Token slip is printed via `PrintableTokenSlip` with token #, Visit ID, payment status

### 2. Check-In (Nurse/Reception Side)
**Works Correctly:**
- `CheckInPage.tsx` updates status from `scheduled` to `checked_in`
- Records vitals in `check_in_vitals` field
- Updates `check_in_at` timestamp and `check_in_by`

### 3. Consultation Start (Doctor Side)
**ISSUE IDENTIFIED:**
- Doctor Dashboard (`DoctorDashboard.tsx`) shows queue but clicking navigates directly to consultation WITHOUT updating status
- The "Start Consultation" link (line 175) goes to `/app/opd/consultation/{id}` but does NOT call `useStartConsultation`
- `ConsultationPage.tsx` does NOT update appointment status to `in_progress` on load

**Current behavior:**
- Doctor clicks patient -> Goes to consultation page
- Status remains `checked_in` until manually changed
- Queue display shows wrong status

### 4. Queue Display Sync
**Works but depends on status being correct:**
- `QueueDisplayPage.tsx` reads from `useTodayQueue()` hook
- Auto-refreshes every 10 seconds
- Filters `in_progress` for "Now Serving", `checked_in` for "Next Up"
- Database trigger `sync_token_log_status` syncs to kiosk_token_logs table

---

## Problems Found

| Issue | Location | Impact |
|-------|----------|--------|
| Doctor dashboard doesn't update status when starting consultation | `DoctorDashboard.tsx` lines 162-179 | Status stays `checked_in`, queue display wrong |
| ConsultationPage doesn't auto-start consultation | `ConsultationPage.tsx` | Doctor must manually start elsewhere |
| No real-time subscriptions on queue pages | `QueueDisplayPage.tsx`, `AppointmentQueuePage.tsx` | 10-30 second delay in updates |
| AppointmentQueuePage `onStart` callback missing | `AppointmentQueuePage.tsx` line 181-194 | Checked-in cards don't have Start action for non-doctors |

---

## Required Fixes

### Fix 1: Auto-update status when doctor opens consultation
**File: `src/pages/app/opd/ConsultationPage.tsx`**

Add effect to automatically update status to `in_progress` when doctor opens consultation:
```typescript
useEffect(() => {
  // Auto-start consultation if status is checked_in
  if (appointment?.status === 'checked_in' && currentDoctor) {
    updateAppointment.mutate({
      id: appointmentId!,
      status: 'in_progress',
    });
  }
}, [appointment?.status, appointmentId, currentDoctor]);
```

### Fix 2: Update DoctorDashboard to use proper navigation
**File: `src/pages/app/opd/DoctorDashboard.tsx`**

When doctor clicks "Start Consultation", explicitly update status first:
```typescript
const handleStartConsultation = async (appointmentId: string, status: string) => {
  // Update status to in_progress if not already
  if (status === 'checked_in') {
    await updateAppointment.mutateAsync({
      id: appointmentId,
      status: 'in_progress',
    });
  }
  navigate(`/app/opd/consultation/${appointmentId}`);
};
```

### Fix 3: Add real-time subscriptions for queue updates
**File: `src/pages/app/appointments/QueueDisplayPage.tsx`**

Add Supabase real-time subscription:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('queue-status-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'appointments',
      filter: `appointment_date=eq.${today}`,
    }, () => {
      refetch();
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [today, refetch]);
```

### Fix 4: Add similar subscription to AppointmentQueuePage
**File: `src/pages/app/appointments/AppointmentQueuePage.tsx`**

Same real-time subscription pattern for the internal queue management.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/opd/ConsultationPage.tsx` | Auto-update status to `in_progress` on load |
| `src/pages/app/opd/DoctorDashboard.tsx` | Import `useUpdateAppointment`, update status before navigation |
| `src/pages/app/appointments/QueueDisplayPage.tsx` | Add Supabase real-time subscription |
| `src/pages/app/appointments/AppointmentQueuePage.tsx` | Add Supabase real-time subscription |

---

## Summary of Flow After Fix

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RECEPTION                                     │
│  Walk-in/Appointment → Payment → Token Generated                     │
│  Status: scheduled | Token: Assigned | Printed: Yes                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NURSE STATION                                 │
│  Patient arrives → Vitals recorded → Check-in complete               │
│  Status: checked_in | Visible in: Doctor Queue, TV Display           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DOCTOR                                        │
│  Opens consultation page → Status AUTO-UPDATES to in_progress        │
│  TV Display: "Now Serving Token #X" (real-time)                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPLETION                                    │
│  Doctor clicks Complete → Status: completed                          │
│  Redirect to checkout if pending orders                              │
└─────────────────────────────────────────────────────────────────────┘
```

The key change is ensuring the status automatically updates to `in_progress` when the doctor opens the consultation, which then triggers real-time updates to all queue displays.
