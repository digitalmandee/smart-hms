import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocInsurance = () => (
  <DocPageWrapper pageNumber={12} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="🏥" title="Insurance & Claims Management" subtitle="NPHIES integration, claim lifecycle, and insurance billing reconciliation" />
    <SubSection title="Insurance Billing Flow">
      <StepList steps={[
        "Patient presents insurance card — Eligibility verified via NPHIES in real-time",
        "Services rendered — OPD checkout or IPD discharge triggers billing split calculation",
        "InsuranceBillingSplit component calculates: Insurance Coverage vs Patient Copay/Deductible",
        "Invoice generated for full amount — Payment collected for patient portion",
        "InsuranceClaimPrompt triggers — Pre-filled claim created for insurance portion",
        "Claim submitted to insurer via NPHIES with all required clinical documentation",
        "Insurer processes claim — Approved, partially approved, or rejected",
        "Payment received from insurer — Reconciled against original claim",
      ]} />
    </SubSection>
    <SubSection title="NPHIES Integration">
      <MockupTable headers={["Feature", "Description", "Status"]} rows={[
        ["Eligibility Check", "Real-time patient coverage verification", "✅ Active"],
        ["Pre-Authorization", "Request approval before expensive procedures", "✅ Active"],
        ["Claim Submission", "Electronic claim with diagnosis and procedure codes", "✅ Active"],
        ["Claim Status Inquiry", "Track claim processing status in real-time", "✅ Active"],
        ["Payment Reconciliation", "Match insurer payments to submitted claims", "✅ Active"],
        ["Rejection Management", "Re-submit corrected claims after rejection", "✅ Active"],
      ]} />
    </SubSection>
    <SubSection title="Insurance Financial Features">
      <FeatureList items={[
        "Insurance company master — Manage payers with contract terms and fee schedules",
        "Plan management — Multiple plans per insurer with different coverage levels",
        "Copay/deductible calculation — Auto-computed based on plan terms and service type",
        "Claim aging report — Track outstanding claims by insurer and aging bucket",
        "Revenue recognition — Insurance revenue recognized on claim approval, not submission",
        "Write-off workflow — Rejected claims reviewed and written off with proper journal entries",
        "Batch claim submission — Submit multiple claims to same insurer in single batch",
        "Reconciliation dashboard — Match ERA (Electronic Remittance Advice) with claims",
      ]} />
    </SubSection>
    <TipBox title="KSA Compliance">NPHIES eligibility verification is mandatory for insured patients during IPD admission — the system enforces this as a required step in the admission workflow.</TipBox>
  </DocPageWrapper>
);
