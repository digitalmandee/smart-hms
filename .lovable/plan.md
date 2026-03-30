

# Dialysis Module — Manual Testing Plan

## Login
Use any clinical role (e.g., `doctor@healthos.demo`) or the role with dialysis access. Navigate to `/app/dialysis`.

---

## TEST SUITE 1: Dashboard (`/app/dialysis`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1.1 | Dashboard loads | Navigate to `/app/dialysis` | 4 stat cards visible: Enrolled Patients, Machines Available, Today's Sessions, In Progress |
| 1.2 | Today's sessions list | Check session list card | Shows sessions for current date with patient name, session number, chair, shift, status badge |
| 1.3 | Quick links work | Click each of: Patients, Machines, Schedule, Reports | Navigates to correct page |
| 1.4 | New Session button | Click "New Session" | Goes to `/app/dialysis/sessions/new` |
| 1.5 | View All sessions | Click "View All" on sessions card | Goes to `/app/dialysis/sessions` |

---

## TEST SUITE 2: Patient Enrollment (`/app/dialysis/patients/enroll`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 2.1 | Search patient | Type patient name in search | Matching patients appear |
| 2.2 | Select patient | Click a patient result | Patient details populate |
| 2.3 | Fill clinical data | Enter: dry weight, access type (AVF/AVG/CVC), access date, access location, hepatitis B/C/HIV status, EPO protocol, schedule pattern (MWF/TTS), shift preference | All fields accept input |
| 2.4 | Submit enrollment | Click Enroll/Save | Success toast, redirects to patients list, patient appears with badges |
| 2.5 | Duplicate enrollment | Try enrolling same patient again | Should show error or prevent duplicate |

---

## TEST SUITE 3: Patients List (`/app/dialysis/patients`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 3.1 | List loads | Navigate to page | Shows enrolled patients with access type, hepatitis badges |
| 3.2 | Enroll button | Click "Enroll Patient" | Goes to `/app/dialysis/patients/enroll` |

---

## TEST SUITE 4: Machines (`/app/dialysis/machines`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 4.1 | Machine grid | Navigate to page | Grid cards showing machine number, model, chair, status badge |
| 4.2 | Change status | Change machine status (available → maintenance) | Status badge updates |
| 4.3 | Disinfection info | Check a machine card | Shows last/next disinfection date |

---

## TEST SUITE 5: Create Session (`/app/dialysis/sessions/new`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 5.1 | Form loads | Navigate to page | Patient dropdown, machine dropdown, date, shift, chair fields visible |
| 5.2 | Prescription fields | Check form | Dialyzer type, blood flow rate, dialysate flow rate, heparin dose, UF target, duration fields present |
| 5.3 | Create session | Fill all fields → Submit | Success toast, redirects to sessions list |
| 5.4 | Required validation | Submit with empty patient/machine | Validation errors shown |

---

## TEST SUITE 6: Sessions List (`/app/dialysis/sessions`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 6.1 | List loads | Navigate to page | All sessions with patient name, date, chair, machine, weight, UF, status |
| 6.2 | Click session | Click any session row | Goes to `/app/dialysis/sessions/:id` |

---

## TEST SUITE 7: Session Detail — Full Treatment Lifecycle (`/app/dialysis/sessions/:id`)

This is the most critical test suite. Test each status transition:

### 7A. Scheduled → In Progress (Start Session)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7A.1 | Pre-assessment card visible | Open a `scheduled` session | "Pre-Dialysis Assessment" card with: Pre-Weight, Pre-BP (sys/dia), Pre-Pulse, Pre-Temperature |
| 7A.2 | Fill pre-vitals | Enter: weight 72kg, BP 140/90, pulse 78, temp 36.8 | All fields accept numeric input |
| 7A.3 | Start session | Click "Start Session" | Status changes to `in_progress`, `actual_start_time` is set, pre-vitals saved |

### 7B. In Progress — Intra-Dialysis Monitoring

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7B.1 | Record vitals | Click "Record Vitals" → Enter BP, pulse, BFR, UF rate, pressures | Vitals saved with minute mark and timestamp |
| 7B.2 | Vitals chart | Check chart section | Recharts line chart showing recorded vitals over time |
| 7B.3 | Vitals log table | Check below chart | Table of all recorded vitals with timestamps |
| 7B.4 | BP drop alert | Record systolic BP >20mmHg lower than pre-session | Alert/warning indicator appears |

### 7C. In Progress → Completed (Complete Session)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7C.1 | Completion form visible | While `in_progress` | Post-Weight, Post-BP (sys/dia), Post-Pulse, Actual UF, Complications, Nursing Notes, Doctor Notes fields visible |
| 7C.2 | Fill post-vitals | Enter: post-weight 70kg, BP 130/85, pulse 72, UF 2000ml | All fields accept input |
| 7C.3 | Add notes | Enter complications, nursing notes, doctor notes | Text fields accept input |
| 7C.4 | Complete session | Click "Complete Session" | Status = `completed`, `actual_end_time` set, all post-vitals saved |

### 7D. Completed — Treatment Outcome

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7D.1 | Outcome summary | Open a `completed` session | Shows: weight loss (pre - post), BP comparison, treatment duration, UF achieved vs target |
| 7D.2 | Prescription recap | Check outcome card | Dialyzer, BFR, DFR, heparin displayed |
| 7D.3 | Notes visible | Check notes section | Complications, nursing notes, doctor notes all visible |

### 7E. Staff Assignment

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7E.1 | Doctor dropdown | Check staff section | Doctor dropdown populated from doctors table |
| 7E.2 | Assign doctor | Select a doctor | Saved to session record |
| 7E.3 | Nurse field | Check staff section | Nurse input/dropdown present |

### 7F. Cancel / No-Show

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7F.1 | Cancel session | Open scheduled session → Click Cancel → Enter reason | Status = `cancelled`, reason saved |
| 7F.2 | No-show | Open scheduled session → Click No-Show | Status = `no_show` |

---

## TEST SUITE 8: Schedule (`/app/dialysis/schedule`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 8.1 | Schedule list | Navigate to page | Grouped by pattern (MWF/TTS) and shift |
| 8.2 | Create schedule | Click "Create Schedule" → Fill patient, pattern, shift, machine, chair, dates → Save | Schedule created, appears in list |

---

## TEST SUITE 9: Reports (`/app/dialysis/reports`)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 9.1 | Reports load | Navigate to page | 3 charts: Session status bar, Vascular access pie, UF trend line |
| 9.2 | Summary stats | Check stats section | Total sessions, avg UF, completion rate |

---

## TEST SUITE 10: End-to-End Flow

Execute this full lifecycle in sequence:

```text
1. Enroll patient     → /app/dialysis/patients/enroll
2. Create schedule    → /app/dialysis/schedule/new (MWF, Morning)
3. Create session     → /app/dialysis/sessions/new (with prescription)
4. Pre-assessment     → Fill BP 140/90, weight 72, pulse 78, temp 36.8
5. Start session      → Status: in_progress
6. Record 2 vitals    → At 0min and 30min
7. Complete session   → Post BP 130/85, weight 70, UF 2000ml, add notes
8. Verify outcome     → Weight loss 2kg, duration displayed, UF on target
9. Check dashboard    → Session shows as completed
10. Check reports     → Stats updated
```

---

## Failure / Edge Cases

| # | Test | Expected |
|---|------|----------|
| F1 | Start session without pre-weight | Validation error |
| F2 | Complete session without post-weight | Validation error |
| F3 | Enter BP as text instead of numbers | Validation/rejection |
| F4 | Navigate to invalid session ID | Error state or redirect |
| F5 | Create session for machine in maintenance | Should prevent or warn |

