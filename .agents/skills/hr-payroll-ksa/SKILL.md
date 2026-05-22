---
name: hr-payroll-ksa
description: HR and payroll conventions — Saudi end-of-service gratuity (ESB), two-pass payroll engine, multi-stage approval, salary revision history, exit clearance automation, and the HR vs billing tax-slab distinction. Auto-loads for any work in payroll runs, employee compensation, resignations/clearance, or KSA labor-law calculations.
---

# HR & Payroll (KSA-aware)

## 1. Payroll engine — two-pass calculation

The engine runs in two passes. Don't collapse them or basic-derived allowances will be wrong:

1. **Pass 1**: compute basic-based components (HRA %, transport %, etc. as % of basic).
2. **Pass 2**: sum to gross, then compute gross-based components (tax, social insurance, GOSI) on the gross.

If you add a new component, declare its base (`basic` | `gross` | `fixed`) so the engine picks the right pass.

## 2. `payroll_runs` has no `updated_at`

Omit `updated_at` from every UPDATE payload on `payroll_runs`. Including it throws a column-not-found error. Use a dedicated `last_action_at` column if you need an audit timestamp.

## 3. Multi-stage approval

`payroll_runs.status` flows: `draft → submitted → approved → posted → paid`.
- Each stage has its own approver role (HR Manager, Finance Manager, CFO).
- Posting (`approved → posted`) triggers GL journal via DB trigger — never insert journal entries from app code (see `finance-gl-posting`).
- `paid` is terminal. To reverse, issue a new reversing run; never UPDATE a paid run.

## 4. Salary revision = new row, not UPDATE

```ts
// On revision: insert new salary record, mark previous as not current
await supabase.from("employee_salaries").update({ is_current: false })
  .eq("employee_id", id).eq("is_current", true).select();

await supabase.from("employee_salaries").insert({
  employee_id: id, effective_from: today, is_current: true, ...newComponents,
}).select();
```

This preserves history for back-pay, ESB calc, and audit. Never overwrite the existing row.

## 5. Saudi End-of-Service Benefit (ESB / Gratuity)

KSA-only, auto-calculated on termination:
- **First 5 years**: 0.5 month basic per year of service.
- **After 5 years**: 1 month basic per year for years 6+.
- **Resignation**: prorated (1/3 for 2–5 yrs, 2/3 for 5–10 yrs, full ≥10 yrs).
- **Termination by employer**: full ESB regardless of tenure.

Use the existing `calculateESB(employeeId, terminationType)` helper. Don't reimplement — Saudi MoL formulas have edge cases (partial years, unpaid leave exclusions).

## 6. Exit / resignation auto-clearance

Submitting a resignation in `employee_resignations` triggers a checklist insert into `employee_clearance` (IT, Finance, HR, Department head, Asset return). Final settlement (ESB + last-month payroll + leave encashment − advances) is blocked until all checklist items are `cleared`.

Don't manually short-circuit clearance — auditors require the trail.

## 7. Tax slabs — two separate tables

| Table | Purpose |
|---|---|
| `tax_slabs` | **HR/payroll** income tax slabs applied to employee salaries |
| `billing_tax_slabs` | **Invoice** VAT/sales tax applied to patient/customer billing |

They are **not interchangeable**. Querying the wrong one produces silently incorrect calculations. Check the module before picking.

## 8. Module isolation by facility type

HR UI/workflows adapt based on tenant `facility_type` (hospital, clinic, warehouse-only). Don't hardcode field visibility — read from the facility config.

## See also

- `finance-gl-posting` — payroll posting trigger pattern
- `ksa-compliance` — Saudi ID validation, dual-calendar
- `supabase-patterns` — `.single()` ban, empty-UUID → null
