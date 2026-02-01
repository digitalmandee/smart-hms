
# PWA Mobile Optimization Plan for All Screens

## Current State Analysis

### Already Mobile-Optimized Pages (9 pages with `showMobileUI` pattern):
1. `DashboardLayout.tsx` - Core layout wrapper ✅
2. `AppointmentsListPage.tsx` - Appointments list ✅
3. `DoctorDashboard.tsx` (OPD) - Doctor dashboard ✅
4. `NurseDashboard.tsx` (OPD) - Nurse station ✅
5. `PharmacyDashboard.tsx` - Pharmacy dashboard ✅
6. `LabDashboard.tsx` - Lab dashboard ✅
7. `ProfilePage.tsx` - User profile ✅
8. `MorePage.tsx` - More options ✅
9. `NotificationsPage.tsx` - Notifications ✅

### Pages Requiring Mobile Optimization (100+ pages):

**Priority 1 - Critical Clinical Workflows (Doctor/Nurse/Patient):**
| Page | Role | Usage Frequency |
|------|------|-----------------|
| `OPDVitalsPage.tsx` | Nurse | Very High |
| `TriagePage.tsx` (ER) | Nurse | High |
| `ConsultationPage.tsx` | Doctor | Very High |
| `ConsultationHistoryPage.tsx` | Doctor | High |
| `PatientsListPage.tsx` | All | Very High |
| `PatientDetailPage.tsx` | All | Very High |
| `PatientFormPage.tsx` | Receptionist | High |
| `AppointmentQueuePage.tsx` | Nurse/Doctor | Very High |
| `CheckInPage.tsx` | Receptionist | High |
| `MyCalendarPage.tsx` | Doctor/Nurse | High |
| `PrescriptionQueuePage.tsx` | Pharmacist | Very High |
| `LabQueuePage.tsx` | Lab Tech | Very High |

**Priority 2 - IPD/OT Workflows:**
| Page | Role |
|------|------|
| `IPDDashboard.tsx` | IPD Nurse |
| `NursingNotesPage.tsx` | IPD Nurse |
| `MedicationChartPage.tsx` | IPD Nurse |
| `IPDVitalsPage.tsx` | IPD Nurse |
| `DailyRoundsPage.tsx` | Doctor |
| `OTDashboard.tsx` | OT Staff |
| `OTSchedulePage.tsx` | OT Staff |
| `SurgeriesListPage.tsx` | Surgeon |
| `PACUPage.tsx` | Anesthetist |

**Priority 3 - Administrative/Settings:**
| Page | Role |
|------|------|
| `ReceptionistDashboard.tsx` | Receptionist |
| `BillingDashboard.tsx` | Cashier |
| `InvoicesListPage.tsx` | Cashier |
| `HRDashboard.tsx` | HR |
| `InventoryDashboard.tsx` | Store Manager |
| Settings pages | Admin |

---

## Implementation Strategy

### Approach A: Mobile View Components (Recommended for Complex Pages)
Create dedicated mobile view components like `MobileNurseView.tsx` pattern for:
- Pages with complex workflows
- Pages with data tables that need card-based layouts
- Pages with multi-column desktop layouts

### Approach B: Responsive Adaptation (For Simpler Pages)
Add conditional mobile styling within existing components for:
- Form pages
- Detail view pages
- Simple list pages

---

## Technical Implementation Pattern

Each page will follow this structure:

```typescript
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";

export default function ExamplePage() {
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  // Mobile Layout
  if (showMobileUI) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-4 pb-24">
          {/* Mobile-optimized content */}
        </div>
      </PullToRefresh>
    );
  }

  // Desktop Layout (existing)
  return (/* existing desktop layout */);
}
```

---

## Phase 1: Critical Clinical Pages (Immediate Priority)

### 1. OPD Vitals Page (`src/pages/app/opd/OPDVitalsPage.tsx`)
**Current Issues:**
- Two-column grid layout doesn't work on mobile
- Dialog modals may be too wide
- Fixed height ScrollArea problematic on mobile

**Mobile Optimization:**
- Stack columns vertically on mobile
- Use full-screen sheet instead of dialog
- Touch-optimized patient cards
- Swipe to record vitals action

### 2. ER Triage Page (`src/pages/app/emergency/TriagePage.tsx`)
**Current Issues:**
- Three-column layout
- Dialog for triage assessment
- Triage guidelines panel

**Mobile Optimization:**
- Single column with tabs (Queue / Guidelines)
- Bottom sheet for triage form
- Large touch targets for critical actions

### 3. Patients List Page (`src/pages/app/patients/PatientsListPage.tsx`)
**Current Issues:**
- DataTable with 7+ columns
- Stats cards grid
- Search bar

**Mobile Optimization:**
- Card-based patient list
- Compact stats (2x2 grid)
- Floating action button for new patient
- Pull-to-refresh

### 4. Patient Detail Page (`src/pages/app/patients/PatientDetailPage.tsx`)
**Mobile Optimization:**
- Collapsible sections
- Tab navigation (Info / Visits / Documents)
- Quick action buttons

### 5. Appointment Queue Page (`src/pages/app/appointments/AppointmentQueuePage.tsx`)
**Mobile Optimization:**
- Horizontal tabs for queue status
- Touch-friendly action buttons
- Real-time updates indicator

### 6. Prescription Queue (`src/pages/app/pharmacy/PrescriptionQueuePage.tsx`)
**Mobile Optimization:**
- Card-based prescription list
- Swipe actions (Dispense / Reject)
- Medicine quantity input optimized for touch

### 7. Lab Queue (`src/pages/app/lab/LabQueuePage.tsx`)
**Mobile Optimization:**
- Sample collection queue cards
- Barcode scanner integration
- Quick status updates

---

## Phase 2: IPD/OT Workflows

### 8. IPD Dashboard (`src/pages/app/ipd/IPDDashboard.tsx`)
**Create:** `src/components/mobile/MobileIPDView.tsx`
- Ward-wise patient cards
- Bed status indicators
- Quick vitals entry

### 9. Nursing Notes Page (`src/pages/app/ipd/NursingNotesPage.tsx`)
**Mobile Optimization:**
- Timeline view of notes
- Voice-to-text input
- Photo attachment

### 10. Medication Chart (`src/pages/app/ipd/MedicationChartPage.tsx`)
**Mobile Optimization:**
- Time-based medication schedule
- One-tap administration logging
- Due medication alerts

### 11. OT Dashboard (`src/pages/app/ot/OTDashboard.tsx`)
**Create:** `src/components/mobile/MobileOTView.tsx`
- Surgery schedule cards
- OT room status
- Team assignment

---

## Phase 3: Reception/Billing

### 12. Receptionist Dashboard (`src/pages/app/reception/ReceptionistDashboard.tsx`)
**Create:** `src/components/mobile/MobileReceptionView.tsx`
- Quick patient registration
- Token display
- Bed availability

### 13. Check-In Page (`src/pages/app/appointments/CheckInPage.tsx`)
**Mobile Optimization:**
- Simplified vitals form
- Touch-friendly inputs
- Quick check-in flow

### 14. Invoices List (`src/pages/app/billing/InvoicesListPage.tsx`)
**Mobile Optimization:**
- Invoice cards with amount
- Quick payment status filter
- Print/share actions

---

## New Mobile Components to Create

| Component | Purpose |
|-----------|---------|
| `MobilePatientList.tsx` | Card-based patient list |
| `MobilePatientDetail.tsx` | Patient profile mobile view |
| `MobileVitalsEntry.tsx` | Touch-optimized vitals form |
| `MobileTriageView.tsx` | ER triage mobile interface |
| `MobileIPDView.tsx` | IPD dashboard mobile |
| `MobileOTView.tsx` | OT dashboard mobile |
| `MobileReceptionView.tsx` | Reception dashboard mobile |
| `MobilePrescriptionQueue.tsx` | Pharmacy queue mobile |
| `MobileLabQueue.tsx` | Lab queue mobile |
| `MobileInvoiceList.tsx` | Billing list mobile |

---

## Common Mobile UI Patterns to Apply

### 1. Pull-to-Refresh
All list pages wrapped with `PullToRefresh` component

### 2. Bottom Sheet Actions
Replace desktop dialogs with `Sheet` from bottom for:
- Forms
- Detail views
- Quick actions

### 3. Swipe Actions
Implement swipeable cards for:
- Delete/Archive actions
- Quick status updates
- Mark as done

### 4. Touch Targets
Minimum 44px height for all interactive elements

### 5. Haptic Feedback
Use `useHaptics` hook for:
- Button taps
- Success/error feedback
- Navigation

### 6. Safe Area Padding
Apply `pb-24` to all pages for bottom navigation clearance

### 7. Card-Based Lists
Replace DataTable with stacked cards showing:
- Primary info prominently
- Secondary info smaller
- Actions accessible

---

## CSS Enhancements Needed

Add to `src/index.css`:

```css
/* Touch-friendly form elements */
@media (max-width: 768px) {
  input, select, textarea, button {
    min-height: 44px;
    font-size: 16px; /* Prevents iOS zoom */
  }
  
  /* Prevent horizontal scroll */
  .mobile-page-content {
    overflow-x: hidden;
  }
  
  /* Better scrolling */
  .scroll-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
}
```

---

## Files to Create/Modify

### New Files (10):
1. `src/components/mobile/MobilePatientList.tsx`
2. `src/components/mobile/MobilePatientDetail.tsx`
3. `src/components/mobile/MobileVitalsEntry.tsx`
4. `src/components/mobile/MobileTriageView.tsx`
5. `src/components/mobile/MobileIPDView.tsx`
6. `src/components/mobile/MobileOTView.tsx`
7. `src/components/mobile/MobileReceptionView.tsx`
8. `src/components/mobile/MobilePrescriptionQueue.tsx`
9. `src/components/mobile/MobileLabQueue.tsx`
10. `src/components/mobile/MobileInvoiceList.tsx`

### Modified Files (25+):
1. `src/pages/app/opd/OPDVitalsPage.tsx`
2. `src/pages/app/emergency/TriagePage.tsx`
3. `src/pages/app/patients/PatientsListPage.tsx`
4. `src/pages/app/patients/PatientDetailPage.tsx`
5. `src/pages/app/patients/PatientFormPage.tsx`
6. `src/pages/app/appointments/AppointmentQueuePage.tsx`
7. `src/pages/app/appointments/CheckInPage.tsx`
8. `src/pages/app/appointments/MyCalendarPage.tsx`
9. `src/pages/app/pharmacy/PrescriptionQueuePage.tsx`
10. `src/pages/app/lab/LabQueuePage.tsx`
11. `src/pages/app/ipd/IPDDashboard.tsx`
12. `src/pages/app/ipd/NursingNotesPage.tsx`
13. `src/pages/app/ipd/MedicationChartPage.tsx`
14. `src/pages/app/ipd/IPDVitalsPage.tsx`
15. `src/pages/app/ipd/DailyRoundsPage.tsx`
16. `src/pages/app/ot/OTDashboard.tsx`
17. `src/pages/app/ot/OTSchedulePage.tsx`
18. `src/pages/app/ot/SurgeriesListPage.tsx`
19. `src/pages/app/reception/ReceptionistDashboard.tsx`
20. `src/pages/app/billing/BillingDashboard.tsx`
21. `src/pages/app/billing/InvoicesListPage.tsx`
22. `src/pages/app/DashboardPage.tsx`
23. `src/index.css`
24. Additional pages as needed

---

## Recommended Implementation Order

**Week 1: Core Clinical (Doctor/Nurse)**
1. OPDVitalsPage
2. TriagePage
3. PatientsListPage
4. PatientDetailPage
5. AppointmentQueuePage

**Week 2: Pharmacy/Lab**
6. PrescriptionQueuePage
7. LabQueuePage
8. LabResultEntryPage

**Week 3: IPD**
9. IPDDashboard
10. NursingNotesPage
11. MedicationChartPage

**Week 4: OT/Reception/Billing**
12. OTDashboard
13. ReceptionistDashboard
14. BillingDashboard/Invoices

---

## Summary

- **Total pages requiring optimization:** ~100+
- **Critical priority pages:** 12-15
- **New mobile components:** 10
- **Estimated effort:** 4 weeks for complete coverage
- **Pattern:** Use existing `showMobileUI` + dedicated mobile view components
