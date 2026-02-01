
# PWA Mobile Optimization - Batch 2 & Form Pages

## Summary

This plan covers mobile optimization for:
1. **Batch 2 - OPD & Consultation Pages** (4 pages)
2. **Critical Form Pages** (2 pages)
3. **Patient Profile Page** (1 page)

Total: **7 pages + 4 new mobile components**

---

## Pages to Optimize

### Batch 2: OPD & Consultation

| Page | Current Issues | Mobile Solution |
|------|----------------|-----------------|
| `ConsultationPage.tsx` | 3-column grid layout, desktop dialogs, multiple form sections | Tab-based mobile view with collapsible sections |
| `OPDVitalsPage.tsx` | 2-column grid, `h-[500px]` ScrollArea, Dialog modal | Horizontal tabs + bottom sheet for vitals entry |
| `OPDOrdersPage.tsx` | DataTable with 8 columns, horizontal tabs | Card-based order list with filter chips |
| `ConsultationHistoryPage.tsx` | DataTable layout, multiple filter dropdowns | Card list with filter sheet |

### Critical Form Pages

| Page | Current Issues | Mobile Solution |
|------|----------------|-----------------|
| `AppointmentFormPage.tsx` (869 lines) | Complex multi-step form, TimeSlotPicker grid, payment step | Step indicator wizard, simplified time selection |
| `PatientFormPage.tsx` (967 lines) | Accordion sections, many fields, desktop layout | Step-by-step wizard with progress indicator |

### Patient Profile

| Page | Current Issues | Mobile Solution |
|------|----------------|-----------------|
| `PatientDetailPage.tsx` (648 lines) | 3-column grid, 15+ tabs, action buttons in header | Profile card + scrollable tabs + quick actions |

---

## New Mobile Components to Create

### 1. `MobileConsultationView.tsx`
Touch-optimized consultation interface for doctors:
- Compact patient header with vitals summary
- Tab navigation: **Vitals** | **Rx** | **Lab** | **Notes**
- Full-screen builders for prescription and lab orders
- Bottom action bar with Save Draft / Complete buttons
- Collapsible previous visits section

### 2. `MobileVitalsView.tsx`
Nurse vitals entry interface:
- Horizontal tabs: **Awaiting** | **Ready** (instead of 2-column)
- Touch-friendly patient cards with one-tap "Record" action
- Full-screen bottom sheet for vitals entry form
- Quick priority selector (Normal / Urgent / Emergency)
- Haptic feedback on save

### 3. `MobileOrdersList.tsx`
OPD orders mobile view:
- Horizontal scrollable tabs: **Lab** | **Prescriptions**
- Filter chips for status (Pending / Processing / Complete)
- Card-based order display showing:
  - Patient name + MR#
  - Order number + status badge
  - Item count + priority
- Tap card to view details in bottom sheet

### 4. `MobilePatientProfile.tsx`
Patient detail mobile view:
- Profile card with photo, name, vitals summary
- Horizontal scrollable quick actions (Book Visit, Create Invoice, etc.)
- Segmented tab bar with max 4 visible (scroll for more)
- Pull-to-refresh for activity updates
- Collapsible sections for each tab content

---

## Page-by-Page Implementation

### 1. ConsultationPage.tsx
**Pattern**: Add `showMobileUI` check, render `MobileConsultationView` for mobile

```typescript
// Add at top of component
const isMobileScreen = useIsMobile();
const isNative = Capacitor.isNativePlatform();
const showMobileUI = isMobileScreen || isNative;

// Before existing return
if (showMobileUI) {
  return (
    <MobileConsultationView
      appointment={appointment}
      patient={patient}
      existingConsultation={existingConsultation}
      // ... pass all form state and handlers
    />
  );
}
```

**Mobile Layout**:
```
┌─────────────────────────────┐
│ ← Consultation - Token #12  │  (compact header)
├─────────────────────────────┤
│ [Patient Info Card]         │  (collapsible)
│ Name • MR# • Age • BP       │
├─────────────────────────────┤
│ [Vitals] [Rx] [Lab] [Notes] │  (tab bar)
├─────────────────────────────┤
│                             │
│   (Active tab content)      │
│   Full-screen forms         │
│                             │
├─────────────────────────────┤
│ [Save Draft] [Complete ✓]   │  (sticky bottom)
└─────────────────────────────┘
```

### 2. OPDVitalsPage.tsx
**Pattern**: Inline mobile optimization with horizontal tabs

```typescript
if (showMobileUI) {
  return (
    <MobileVitalsView
      awaitingVitals={filteredAwaiting}
      vitalsComplete={filteredComplete}
      inProgress={inProgress}
      onSelectPatient={openVitalsDialog}
      onRefresh={refetch}
    />
  );
}
```

**Mobile Features**:
- Pull-to-refresh
- Swipe between Awaiting/Ready tabs
- Bottom sheet for vitals form (replaces Dialog)
- 2x2 stats grid instead of 4-column

### 3. OPDOrdersPage.tsx
**Pattern**: Replace DataTable with card list

```typescript
if (showMobileUI) {
  return (
    <MobileOrdersList
      labOrders={filteredLabOrders}
      prescriptions={filteredPrescriptions}
      onRefresh={refetch}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
}
```

### 4. ConsultationHistoryPage.tsx
**Pattern**: Card list with filter sheet

**Mobile Layout**:
- Sticky search bar at top
- Filter button opens bottom sheet with all filters
- Card-based consultation list
- Tap to view details

### 5. AppointmentFormPage.tsx (New Appointment)
**Pattern**: Step-by-step wizard with progress indicator

**Current Flow** (complex):
```
[Patient Search] → [Doctor/Date/Time] → [Type Selection] → [Payment] → [Success]
```

**Mobile Flow** (simplified):
```
Step 1: Select Patient (full-screen search)
Step 2: Select Doctor & Date
Step 3: Select Time Slot (list view, not grid)
Step 4: Confirm & Pay (bottom sheet)
→ Success Screen (print token)
```

**Key Changes**:
- Step indicator at top
- One step per screen
- Larger touch targets (48px minimum)
- Bottom action bar: [Back] [Next →]
- Time slots as vertical list with bigger buttons

### 6. PatientFormPage.tsx (New Patient)
**Pattern**: Multi-step wizard replacing accordions

**Current Flow**:
```
Single page with 6 accordion sections
```

**Mobile Flow**:
```
Step 1: Basic Info (Name, Phone, CNIC)
Step 2: Personal Details (DOB, Gender, Blood)
Step 3: Contact & Address
Step 4: Emergency Contact
Step 5: Insurance & Referral (optional)
Step 6: Review & Save
```

**Key Changes**:
- Progress bar showing current step
- Swipe between steps or use [Previous]/[Next]
- Validation per step before proceeding
- Final step shows summary for review
- Sticky [Save Patient] button on last step

### 7. PatientDetailPage.tsx
**Pattern**: Dedicated mobile profile component

```typescript
if (showMobileUI) {
  return (
    <MobilePatientProfile
      patient={patient}
      currentVisit={currentVisit}
      activeAdmission={activeAdmission}
      profileStats={profileStats}
    />
  );
}
```

**Mobile Layout**:
```
┌─────────────────────────────┐
│ ← Patient Profile           │
├─────────────────────────────┤
│   [Photo]                   │
│   John Smith                │
│   MR-001234 • Male • 45y    │
│   🩸 A+ | 📞 0300-1234567   │
├─────────────────────────────┤
│ [Book] [Invoice] [Surgery]  │  (horizontal scroll)
├─────────────────────────────┤
│ [Overview][Vitals][Rx][Lab] │  (scrollable tabs)
├─────────────────────────────┤
│                             │
│   (Tab content)             │
│                             │
└─────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/mobile/MobileConsultationView.tsx` | Doctor consultation mobile UI |
| `src/components/mobile/MobileVitalsView.tsx` | Nurse vitals entry mobile UI |
| `src/components/mobile/MobileOrdersList.tsx` | OPD orders mobile UI |
| `src/components/mobile/MobilePatientProfile.tsx` | Patient detail mobile UI |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/opd/ConsultationPage.tsx` | Add showMobileUI + mobile component |
| `src/pages/app/opd/OPDVitalsPage.tsx` | Add showMobileUI + mobile component |
| `src/pages/app/opd/OPDOrdersPage.tsx` | Add showMobileUI + mobile component |
| `src/pages/app/opd/ConsultationHistoryPage.tsx` | Add inline mobile layout |
| `src/pages/app/appointments/AppointmentFormPage.tsx` | Add mobile wizard flow |
| `src/pages/app/patients/PatientFormPage.tsx` | Add mobile step-by-step form |
| `src/pages/app/patients/PatientDetailPage.tsx` | Add showMobileUI + mobile component |

---

## Mobile UI Patterns Applied

1. **PullToRefresh** - All list pages
2. **Bottom Sheets** - Replace desktop dialogs
3. **Horizontal Tabs** - Replace multi-column grids
4. **Card Lists** - Replace DataTables
5. **Step Wizards** - Replace long forms
6. **Sticky Actions** - Bottom action bars
7. **Haptic Feedback** - On all interactions
8. **48px Touch Targets** - All buttons and inputs
9. **Safe Area Padding** - `pb-24` for bottom nav clearance

---

## Implementation Order

1. Create `MobileConsultationView.tsx` + update `ConsultationPage.tsx`
2. Create `MobileVitalsView.tsx` + update `OPDVitalsPage.tsx`
3. Create `MobileOrdersList.tsx` + update `OPDOrdersPage.tsx`
4. Update `ConsultationHistoryPage.tsx` (inline optimization)
5. Update `AppointmentFormPage.tsx` (mobile wizard)
6. Update `PatientFormPage.tsx` (mobile wizard)
7. Create `MobilePatientProfile.tsx` + update `PatientDetailPage.tsx`

---

## Expected Results

After implementation:
- No horizontal scroll on any page
- No "glitch screenshift" - smooth transitions
- Touch-optimized forms with larger inputs
- Native-app feel with haptic feedback
- All functionality accessible on mobile
- Consistent patterns across all roles (Doctor, Nurse, Receptionist)
