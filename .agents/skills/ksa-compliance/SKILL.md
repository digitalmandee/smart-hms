---
name: ksa-compliance
description: Saudi Arabia regulatory and compliance rules for HealthOS — ZATCA e-invoicing (Phase 1 & 2), NPHIES insurance claims, Wasfaty e-prescriptions, Tatmeen/RSD, Nafath auth, Sehhaty, HESN, Saudi National ID/Iqama validation, Hijri dual-calendar, and insurance billing/claims workflow. Load when working on invoicing for KSA tenants, insurance claims, e-prescriptions, regulatory submissions, Saudi ID fields, Hijri dates, or anything gated by country code SA.
---

# KSA Compliance

All KSA-specific behavior is **gated by the tenant's country code**. Never apply these rules unconditionally — non-KSA tenants must not see Nafath, Hijri, ZATCA chaining, etc.

## ZATCA e-invoicing (Phase 1 & 2)

- Output format: **UBL 2.1 XML**.
- Every invoice has a **SHA-256 hash** of its canonical XML.
- **Mandatory chaining**: each invoice references the previous invoice hash (`PreviousInvoiceHash`). Breaking the chain rejects the batch — never re-number or back-fill historical invoices.
- Phase 2 requires cryptographic stamp + QR code (TLV-encoded) on every B2C invoice.

## NPHIES (insurance)

- **HL7 FHIR** workflow — eligibility → preauth → claim → payment notice.
- Look up codes in `medical_codes` table (ICD-10-AM, SCT, custom). Don't free-text diagnoses.
- **Claim scrubbing** runs before submission; surface errors to the user, don't auto-fix silently.
- Insurance billing: compute coverage vs copay, prompt to file claim **after** invoice creation. **IPD admission must verify insurance check** before bed allocation.
- Insurance module is **standalone at `/app/insurance/*`** — don't nest it under billing.

## Wasfaty (MOH e-prescription)

- Routed through the **`wasfaty-gateway` edge function**. Don't call the MOH API directly from the client.
- Submitted prescriptions stored in `wasfaty_prescriptions` with reference number returned by MOH.
- Available only when tenant country = SA and Wasfaty integration is enabled.

## Saudi ID validation

- 10 digits, first digit must be **1 (citizen)** or **2 (resident / Iqama)**.
- Validate on patient registration when country = SA.

## Tatmeen / RSD (pharmacy track-and-trace)

- Pharmacy dispensing of controlled/serialized items reports to Tatmeen.
- Conditionally rendered KSA-only action in the dispense flow.

## Nafath (national auth)

- Used for patient identity verification flows. Conditionally rendered, KSA-only.

## Sehhaty / HESN

- Patient-facing app integrations. Surface only for SA tenants.

## Dual calendar (Gregorian + Hijri)

- Render both Gregorian and Hijri dates **only when country = SA**.
- Use the existing date helper — don't reinvent Hijri conversion.

## HIPAA / data security (apply everywhere, not just KSA)

- Storage buckets have RLS; PHI is masked in list views.
- Session timeouts enforced; kiosk endpoints use `SECURITY DEFINER` functions with explicit allowlists.
- See `mem://security/hardening-policy` and `mem://security/hipaa-compliance-status`.

## See also

- `supabase-patterns` — edge function secret handling
- `finance-gl-posting` — invoice GL posting (ZATCA hash is computed in the invoice trigger)
- `clinical-workflow-conventions` — IPD insurance-check requirement
