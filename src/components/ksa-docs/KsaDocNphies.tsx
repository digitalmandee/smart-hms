import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocNphies = () => (
  <KsaDocPageWrapper pageNumber={4} totalPages={12}>
    <KsaSectionTitle icon="🏥" title="NPHIES — Insurance & Claims" subtitle="National Platform for Health Insurance Exchange Services (CHI)" />

    <KsaSubSection title="Eligibility Verification">
      <KsaStepList steps={[
        "Select patient and insurance policy from the registration screen",
        "Click 'Verify Eligibility' — sends FHIR CoverageEligibilityRequest to NPHIES",
        "System receives real-time response with coverage details and co-pay info",
        "Eligibility status is cached for 24 hours to reduce API calls",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Claims Workflow">
      <KsaMockupTable
        headers={["Step", "Action", "NPHIES Resource"]}
        rows={[
          ["1", "Pre-Authorization Request", "FHIR Claim (use=preauthorization)"],
          ["2", "Claim Submission", "FHIR Claim (use=claim)"],
          ["3", "Response Processing", "FHIR ClaimResponse"],
          ["4", "Denial Management", "FHIR Claim (use=claim) resubmit"],
          ["5", "Payment Reconciliation", "FHIR PaymentReconciliation"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Supported Claim Types">
      <KsaFeatureList items={[
        "Institutional — inpatient admissions with DRG grouping",
        "Professional — outpatient consultations and procedures",
        "Pharmacy — prescription claims with drug coding",
        "Vision & Dental — specialty claims with specific coding",
        "Batch submission — up to 100 claims per batch request",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Auto-Coding">
      HealthOS automatically maps ICD-10, CPT, and ACHI codes to NPHIES-compatible formats during claim generation, reducing manual coding errors by 95%.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
