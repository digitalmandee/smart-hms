# Critical-Path E2E Tests

Transactional end-to-end tests covering the highest-risk lifecycles in HealthOS 24.
Unlike the smoke tests in `../`, these specs walk a full workflow from start to GL post.

## Run

```bash
# Full critical-path suite
npx playwright test tests/e2e/critical-path

# Or via npm script
npm run test:e2e:critical

# Single spec
npx playwright test tests/e2e/critical-path/ipd-admit-to-discharge.spec.ts

# Headed (watch in browser)
npx playwright test tests/e2e/critical-path --headed
```

## Coverage

| Spec | Lifecycle | Hospital impact if it breaks |
|------|-----------|------------------------------|
| `ipd-admit-to-discharge` | Register → Admit → Charge → Discharge → Invoice → Payment | Patient can't be billed at discharge — direct revenue loss |
| `opd-walkin-to-bill` | Walk-in 4-step wizard → Token → Consult → Invoice → Payment | OPD queue freezes; reception can't process patients |
| `lab-order-to-result` | Order → Specimen collected → Result entered → Published → Billed | Diagnoses delayed; lab results not visible to doctor |
| `pharmacy-pos-checkout` | Open session → Add items → Pay → Receipt → Close | Pharmacy can't sell; daily reconciliation fails |
| `grn-to-stock` | PR → PO → GRN → Stock upsert → AP/INV journal | Inventory wrong; vendor invoices not matched |
| `payroll-run-to-post` | Create run → Calculate → Approve → Post to GL | Payday missed; legal exposure |
| `daily-closing` | Close billing sessions → Run closing → Reconcile | Daily cash count fails; cashier locked out next day |
| `zatca-invoice` | Create invoice → Generate UBL XML → Hash chain | KSA tax non-compliance; fines |
| `nphies-claim` | Create claim → Scrub → Submit → Status | Insurance revenue stuck in AR |

## Design rules

- **Lenient selectors** — uses `getByRole`, `getByLabel`, regex name matching so specs survive minor UI changes
- **`.catch(() => false)` guards** — optional steps degrade gracefully; assertions on the destination page still run
- **Timestamped test data** — every record uses `E2E${Date.now()}` for easy cleanup
- **Serial execution within a spec** — `test.describe.serial` so step 5 sees step 1's data
- **Specs are parallel-safe across files** — each spec creates its own data

## Maintenance

When a spec fails, the failure type tells you what to fix:
- **Selector not found** — UI button label changed; update the regex in the spec
- **Page didn't load** — real bug; the route or required data is broken
- **Assertion failed on data** — workflow is broken end-to-end; investigate immediately

These tests are NOT a replacement for clinical UAT. They verify the system works,
not that the medicine dose was correct for the patient's age.
