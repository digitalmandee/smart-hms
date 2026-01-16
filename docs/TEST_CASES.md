# HMS Test Cases Documentation

## Test Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Patients | 25 | Pakistani names, MR-2024-00001 to MR-2024-00025 |
| Appointments | 15 | 3 scheduled, 4 checked-in, 2 in-progress, 6 completed |
| Consultations | 8 | Linked to completed/in-progress appointments |
| Prescriptions | 6 | 3 dispensed, 2 pending, 1 cancelled |
| Prescription Items | 16 | Multi-item prescriptions |
| Lab Orders | 5 | Various statuses |
| Lab Order Items | 15 | CBC, LFT, RFT, etc. |
| ER Registrations | 5 | Diverse triage levels |
| Invoices | 6 | 2 paid, 2 partial, 2 pending |
| Invoice Items | 18 | Consultation, labs, medications |

---

## Role-Based Test Cases

### 1. Receptionist Tests
**Login:** `receptionist@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Dashboard | Login → `/app/opd` | See today's appointments count |
| Search Patient | Search "Muhammad Ahmed" | Find patient MR-2024-00001 |
| Create Appointment | Patients → Select patient → New Appointment | Appointment created with token |
| Check-in Patient | Appointments → Select scheduled → Check In | Status changes to checked_in |

### 2. Doctor Tests
**Login:** `doctor@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Queue | `/app/opd` | See 4 checked-in patients |
| Start Consultation | Select patient → Start Consultation | Consultation form opens |
| Add Diagnosis | Enter diagnosis (ICD-10) → Save | Diagnosis saved |
| Create Prescription | Add medicines → Save | Prescription created (RX-XXXXXX) |
| Order Labs | Add lab tests → Submit | Lab order created |

### 3. Nurse (OPD) Tests
**Login:** `nurse@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Patients | `/app/opd/nursing` | See patients needing vitals |
| Record Vitals | Select patient → Enter BP, Temp, etc. | Vitals saved |
| Triage Assessment | Complete triage form | Patient ready for doctor |

### 4. Lab Technician Tests
**Login:** `lab_technician@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Queue | `/app/lab/queue` | See 5 lab orders |
| Collect Sample | Select order → Mark Collected | Status: collected |
| Enter Results | Add result values → Save | Results recorded |
| Complete Order | Mark Complete | Status: completed |

### 5. Pharmacist Tests
**Login:** `pharmacist@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Prescriptions | `/app/pharmacy` | See pending prescriptions |
| Dispense Items | Select Rx → Dispense | Items marked dispensed |
| POS Transaction | Create sale → Payment | Transaction recorded |

### 6. Accountant Tests
**Login:** `accountant@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View Invoices | `/app/billing` | See 6 invoices |
| Process Payment | Select invoice → Add payment | Payment recorded |
| Generate Receipt | Print receipt | PDF generated |

### 7. Emergency Tests
**Login:** `emergency_doctor@healthos.demo`

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View ER Queue | `/app/emergency` | See 5 ER registrations |
| Triage Patient | Assign ESI level | Priority updated |
| Treat & Discharge | Complete treatment → Discharge | Patient discharged |
| Admit to IPD | Select Admit | Admission created |

---

## Quick Validation Checklist

- [ ] All 17 demo users can login
- [ ] Each role sees relevant dashboard data
- [ ] Patient search works across modules
- [ ] Appointments flow: Schedule → Check-in → Consult → Complete
- [ ] Prescriptions display in pharmacy queue
- [ ] Lab orders appear in lab queue
- [ ] Invoices show correct totals
- [ ] ER triage levels display correctly
