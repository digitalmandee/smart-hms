

# Add Default Salary Components

## Problem
The Salary Components page is empty — no earning or deduction components exist in the database yet. The page UI and CRUD functionality are fully built, but need initial data.

## Solution
Insert a comprehensive set of default salary components into the `salary_components` table covering standard earning and deduction types used in healthcare/hospital payroll.

### Default Earnings (component_type = 'earning')
| Name | Code | Calc Type | Default Value | Taxable |
|------|------|-----------|--------------|---------|
| Basic Salary | BASIC | fixed | 0 | Yes |
| House Rent Allowance | HRA | percentage | 40 | Yes |
| Transport Allowance | TRANSPORT | fixed | 3000 | No |
| Medical Allowance | MEDICAL | fixed | 2500 | No |
| Overtime | OT | fixed | 0 | Yes |
| Special Allowance | SPECIAL | fixed | 0 | Yes |
| Performance Bonus | PERF_BONUS | fixed | 0 | Yes |
| Night Shift Allowance | NIGHT_SHIFT | fixed | 1500 | No |
| On-Call Allowance | ON_CALL | fixed | 2000 | No |
| Education Allowance | EDUCATION | fixed | 0 | No |

### Default Deductions (component_type = 'deduction')
| Name | Code | Calc Type | Default Value | Taxable |
|------|------|-----------|--------------|---------|
| Income Tax | TAX | percentage | 0 | No |
| Provident Fund | PF | percentage | 8.33 | No |
| EOBI / Social Insurance | EOBI | fixed | 250 | No |
| Professional Tax | PROF_TAX | fixed | 200 | No |
| Loan Deduction | LOAN | fixed | 0 | No |
| Advance Salary | ADV_SAL | fixed | 0 | No |
| Late Deduction | LATE_DED | fixed | 0 | No |
| Absent Deduction | ABSENT_DED | fixed | 0 | No |

## Implementation
- Use the Supabase insert tool to add ~18 rows to `salary_components` table
- Each row includes: name, code, component_type, calculation_type, default_value, is_taxable, is_active, sort_order, description
- No schema changes needed — the table already exists with all required columns

## Files to Change
- No code changes — data insertion only via Supabase insert tool

