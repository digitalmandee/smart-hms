

# Fix: Doctor Earnings Trigger Using Wrong Column Name

## Root Cause

The `auto_create_doctor_earnings()` trigger references `item.total` but the actual column in `invoice_items` is **`total_price`**. In PL/pgSQL, referencing a non-existent column on a RECORD returns NULL, so the INSERT silently inserts NULL amounts or fails — no earnings are ever created.

This affects ALL source types (consultation, lab, radiology, etc.).

The description patterns ARE correct:
- Lab checkout creates: `"Lab Tests: APTT"` → matches `%test%`
- Imaging checkout creates: `"XRAY: Chest X-Ray (PA)"` → matches `%x-ray%`
- Consultation