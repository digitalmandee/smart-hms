
# Patient Photo Capture & OPD/Compensation Flow Verification

## Analysis Summary

After thorough exploration of the codebase, here's what I found:

---

## 1. Patient Photo Capture - NEEDS IMPLEMENTATION

### Current State
- **Database Ready**: `patients.profile_photo_url` column exists in the schema
- **UI Missing**: The patient profile page (`PatientDetailPage.tsx`) shows a static User icon placeholder (lines 269-271), with no "Take Picture" button
- **No Camera Component**: No existing camera capture functionality for patients (though radiology has `ImageCapturePage.tsx` for PACS images)

### Implementation Required

**New Component: `PatientPhotoCapture.tsx`**
- Uses browser's `navigator.mediaDevices.getUserMedia()` API for camera access
- Provides live camera preview with capture button
- Option to upload from file as fallback
- Uploads captured image to Supabase Storage bucket
- Updates `patients.profile_photo_url` with the stored URL

**Files to Create:**
| File | Purpose |
|------|---------|
| `src/components/patients/PatientPhotoCapture.tsx` | Camera capture dialog component |

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/pages/app/patients/PatientDetailPage.tsx` | Add camera button to avatar, show actual photo if exists |
| `src/pages/app/patients/PatientFormPage.tsx` | Add photo capture section to registration form |

**Storage Setup:**
- Create `patient-photos` storage bucket with public access
- RLS policy for organization-scoped access

---

## 2. OPD Flow Verification - COMPLETE

The OPD clinical workflow is fully implemented:

| Step | Component | Status |
|------|-----------|--------|
| 1. Registration | `PatientFormPage.tsx` | Complete |
| 2. Appointment Booking | `NewAppointmentPage.tsx` | Complete |
| 3. Walk-in Registration | `OPDWalkInPage.tsx` | Complete |
| 4. Nurse Vitals | `OPDVitalsPage.tsx` | Complete |
| 5. Doctor Queue | `DoctorDashboard.tsx` | Complete |
| 6. Consultation | `ConsultationPage.tsx` | Complete (auto-status to `in_progress`) |
| 7. Prescription | `PrescriptionBuilder.tsx` | Complete |
| 8. Lab Orders | `LabOrderBuilder.tsx` | Complete |
| 9. Complete Visit | `VisitSummaryDialog.tsx` | Complete |
| 10. Checkout | `OPDCheckoutPage.tsx` | Complete (redirects if pending orders) |
| 11. Pending Checkout | `PendingCheckoutPage.tsx` | Complete |

**Consultation Completion Flow:**
- Doctor clicks "Complete Consultation" → Summary Dialog appears
- Prescription and Lab Orders are created
- Appointment status updated to `completed`
- Redirects to Checkout if pending orders exist

---

## 3. Doctor Compensation System - COMPLETE

The doctor compensation system is fully implemented:

### Fee Configuration
| Component | Location | Status |
|-----------|----------|--------|
| Compensation Plan Type | `DoctorCompensationForm.tsx` | Complete (Fixed/Commission/Hybrid) |
| Consultation Fee + Share % | Employee Form > Compensation Tab | Complete |
| IPD Visit Fee + Share % | Same | Complete |
| Surgery Fee + Share % | Same (for surgeons) | Complete |
| Anesthesia Share % | Same (for anesthetists) | Complete |
| Lab Referral % | Same | Complete |
| Minimum Guarantee | Same | Complete |

### Earnings Triggers
| Event | Trigger | Status |
|-------|---------|--------|
| Invoice Paid (with consultation) | `post_consultation_earning()` | Complete |
| IPD Daily Charge | `post_ipd_visit_earning()` | Complete |
| Surgery Completed | `post_surgery_completion_earning()` | Complete |

### Settlement Workflow
| Feature | Component | Status |
|---------|-----------|--------|
| Wallet Balances | `DoctorWalletBalancesPage.tsx` | Complete |
| Daily Commission Report | `DailyCommissionReport.tsx` | Complete |
| Settlement Dialog | `SettlementDialog.tsx` | Complete (payment method, reference #) |
| Settlement Receipt | `SettlementReceiptDialog.tsx` | Complete (printable) |
| Settlement History | Wallet Balances > History Tab | Complete |

**Settlement Flow:**
1. Admin views pending balances per doctor
2. Clicks "Settle" button
3. Selects payment method (Cash/Bank/JazzCash/EasyPaisa)
4. Enters reference number (for non-cash)
5. Confirms settlement
6. Receipt generated with settlement number (SET-YYYYMMDD-XXXX)
7. Earnings marked as `is_paid = true`

---

## Implementation Plan

### Phase 1: Patient Photo Capture Component

**Create `PatientPhotoCapture.tsx`:**
```typescript
// Key functionality:
- Uses getUserMedia({ video: true, facingMode: "user" })
- Canvas capture for snapshot
- File upload fallback
- Uploads to Supabase Storage
- Returns URL for profile_photo_url update
```

**Storage Bucket Setup (SQL Migration):**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true);

CREATE POLICY "Users can upload patient photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-photos');

CREATE POLICY "Anyone can view patient photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-photos');
```

### Phase 2: Integrate into Patient Pages

**PatientDetailPage.tsx Changes:**
- Replace static User icon with Avatar component showing `profile_photo_url`
- Add camera button overlay on hover
- Open `PatientPhotoCapture` dialog on click

**PatientFormPage.tsx Changes:**
- Add photo capture section in the essential fields area
- Preview captured photo before saving

---

## Summary

| Feature | Current State | Action Required |
|---------|---------------|-----------------|
| Patient Photo Capture | Missing | Create camera component + storage bucket |
| OPD Flow | Complete | No action needed |
| Doctor Compensation Config | Complete | No action needed |
| Doctor Earnings Triggers | Complete | No action needed |
| Settlement Workflow | Complete | No action needed |
| Settlement Receipts | Complete | No action needed |

The only missing piece is the **patient photo capture** functionality. The OPD flow and doctor compensation system are fully operational with:
- Real-time earnings calculation displayed in compensation form
- Automatic wallet credits on invoice payment
- Professional settlement workflow with receipts
- Complete settlement history tracking
