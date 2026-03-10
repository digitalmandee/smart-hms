

## HR Module Seed Data Plan

### Current State
- **13 employees** in Shifa Medical Center (org `b1111111`)
- **Attendance**: Only Jan 2026 data exists. Nothing for Feb/Mar 2026
- **All HR sub-tables empty**: leave_balances, leave_requests, medical_fitness_records, vaccination_records, disciplinary_actions, employee_licenses, employee_documents, employee_contracts, training_programs, training_enrollments, hr_letter_templates

### Seed Data to Insert

**1. Attendance Records — Last 10 days (Mar 1-10, 2026)**
- 13 employees × 10 days = 130 records
- Realistic mix: ~75% present, ~10% late, ~8% absent, ~5% on_leave, weekends as weekend
- Mar 7 (Sat) & Mar 8 (Sun) = weekend for all
- Include check_in/check_out times, late_minutes, working_hours

**2. Leave Balances — 2026**
- 13 employees × 6 leave types = 78 records
- Annual: 20 entitled, Sick: 10, Casual: 12, Maternity: 90, Paternity: 10, Unpaid: 0
- Some used days to match leave requests

**3. Leave Requests — 5 requests**
- Mix of approved, pending, rejected statuses
- Different leave types and employees

**4. Employee Contracts — 10 contracts**
- Active contracts for most employees with start/end dates

**5. Employee Licenses — 8 licenses**
- Medical licenses for doctors, nurses, lab techs, pharmacist
- Mix of valid and expiring-soon statuses

**6. Medical Fitness Records — 6 records**
- Recent fitness exams for clinical staff

**7. Vaccination Records — 10 records**
- Hepatitis B, COVID-19, Flu for clinical staff

**8. Training Programs — 4 programs**
- BLS, Infection Control, Fire Safety, HIPAA
- With enrollments for various employees

**9. HR Letter Templates — 4 templates**
- Offer Letter, Experience Certificate, NOC, Warning Letter

**10. Disciplinary Actions — 2 records**
- One warning, one verbal counseling

### Implementation
Single data insertion via the insert tool containing all the above SQL statements. No schema changes needed.

