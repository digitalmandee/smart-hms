---
name: insurance-claims
description: Insurance billing, claims, coverage/copay calculation, and NPHIES (KSA) integration. Auto-loads for any work on insurance policies, pre-authorization, claim submission, coverage calculation, medical coding, or the standalone /app/insurance/* module.
---

# Insurance & Claims

## 1. Module location — standalone, NOT under billing

Insurance lives at **`/app/insurance/*`** as a top-level module. Do **not** nest it under `/app/billing/insurance` or the patient module. Navigation, permissions, and analytics all assume the top-level path.

## 2. Coverage vs copay calculation

For an invoice line covered by a policy:

```
covered_amount = line_total × coverage_percent
patient_copay  = line_total − covered_amount + fixed_copay
deductible_consumed = min(remaining_deductible, covered_amount)
claim_amount  = covered_amount − deductible_consumed
```

Order matters: deductible reduces the **insurer's** payable, not the patient's copay. Use the `calculateCoverage(policyId, lineItems)` helper — don't recompute inline.

## 3. Claim prompt — AFTER invoice creation

Flow is strict:
1. Create invoice (revenue posted to GL).
2. Trigger surfaces a "File claim?" prompt if any line is covered by an active policy.
3. User confirms → claim drafted in `insurance_claims` with status `draft`.
4. NPHIES scrubbing → `ready` → submission → `submitted`.

Never auto-submit without the prompt. Never create the claim **before** the invoice — revenue accrual depends on the invoice being the source of truth.

## 4. IPD admission — mandatory insurance check

If the patient has an active policy, IPD admission **blocks** bed allocation until insurance eligibility is verified (live check via NPHIES for KSA, manual confirmation otherwise). Don't allow override without admin role + audit reason.

## 5. NPHIES (KSA) — HL7 FHIR workflow

KSA-only, gated by tenant country = SA. Stages:
1. **Eligibility** — pre-visit, returns coverage details.
2. **Pre-authorization** — for inpatient/expensive procedures.
3. **Claim** — post-visit, attaches diagnoses + procedures + invoice.
4. **Payment notice** — insurer remittance.

All routed through the `nphies-gateway` edge function. Never call the NPHIES endpoint directly from the client.

## 6. Medical coding — use the `medical_codes` table

Diagnoses and procedures must reference codes from `medical_codes` (ICD-10-AM, SCT, CPT, locally extended). **No free-text** diagnoses on claim submissions — NPHIES rejects them.

Lookup pattern:
```ts
await supabase.from("medical_codes")
  .select("code, display, system")
  .eq("system", "ICD-10-AM")
  .ilike("display", `%${search}%`)
  .limit(20);
```

## 7. Claim scrubbing

Pre-submission validation runs locally before NPHIES. Common rejections:
- Missing pre-auth reference for procedures that require one.
- Diagnosis code not active on the service date.
- Provider NPI/license mismatch with the branch.
- Quantity/unit mismatch on consumables.

**Surface scrubbing errors to the user**; don't auto-fix silently.

## 8. Saudi ID validation

Patient must have valid 10-digit National ID or Iqama (first digit 1 = citizen, 2 = resident) for KSA insurance flows. See `ksa-compliance`.

## 9. GL posting

Insurance receivable splits the invoice:
```
At invoice:   DR AR-Insurance        CR Revenue – <module>
              DR AR-Patient (copay)
At remit:     DR Cash/Bank           CR AR-Insurance
              DR Insurance-Adjustment (write-off, if any)
```
Posted by the invoice trigger. Never write the journal manually.

## See also

- `ksa-compliance` — NPHIES, Saudi ID, Nafath, country-gated activation
- `finance-gl-posting` — AR posting, revenue routing by service prefix
- `clinical-workflow-conventions` — IPD admission preconditions
- `billing-revenue-ops` — invoice totals breakdown when insurance + deposit + cash combine
