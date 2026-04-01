

# Seed Attendance Data for April 2026

## Current State
- 430 attendance records exist, but only up to **March 10, 2026**
- 13 employees in org `b1111111-...` have records
- No data for the current month (April 2026) — the attendance calendar/sheet shows empty

## Plan

### Migration: Insert attendance records for March 11–31 and April 1, 2026

For all 13 employees in the primary organization, generate realistic attendance data:

**Date range**: March 11 → April 1 (22 days × 13 employees = ~286 records)

**Logic per day**:
- **Fridays** → status `weekend` (no check_in/out)
- **Remaining weekdays** → realistic mix:
  - ~70% `present` (check_in 08:00–08:30, check_out 16:00–17:30, working_hours 7.5–9)
  - ~10% `late` (check_in 08:45–09:30, late_minutes 15–60)
  - ~5% `absent`
  - ~5% `half_day` (check_out ~12:30)
  - ~5% `on_leave`
  - ~5% `work_from_home`

**Realistic details included**:
- `check_in_source`: mix of `biometric`, `manual`, `system`
- `working_hours`: calculated from check_in/check_out
- `overtime_hours`: occasional 0.5–2h for some employees
- `late_minutes`: 0 for present, 15–60 for late
- `early_leave_minutes`: occasional for half_day

### Files Changed
- **1 SQL migration** — INSERT ~286 attendance records with realistic Pakistani hospital staff patterns

