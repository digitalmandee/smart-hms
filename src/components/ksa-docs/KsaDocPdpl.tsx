import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocPdpl = () => (
  <KsaDocPageWrapper pageNumber={11} totalPages={12}>
    <KsaSectionTitle icon="🔒" title="PDPL & Consent Management" subtitle="Personal Data Protection Law compliance with granular patient consent" />

    <KsaSubSection title="Consent Categories">
      <KsaMockupTable
        headers={["Category", "Purpose", "Required"]}
        rows={[
          ["Treatment", "Use data for medical treatment", "Mandatory"],
          ["Insurance", "Share with insurance provider", "Mandatory for claims"],
          ["Research", "De-identified data for research", "Optional"],
          ["Marketing", "Health tips & promotions", "Optional"],
          ["Data Sharing", "Share with other providers", "Per-request"],
          ["Sehhaty Sync", "Push data to Sehhaty app", "Optional"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Consent Collection Flow">
      <KsaStepList steps={[
        "Patient arrives at registration — consent form presented (paper or digital)",
        "Staff records consent choices per category in HealthOS",
        "Consent stored in patient_consents table with timestamp and staff ID",
        "Consent status checked before any data sharing operation",
        "Patient can withdraw consent at any time — logged with reason",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="PDPL Rights Supported">
      <KsaFeatureList items={[
        "Right to Access — patients can request a copy of all stored data",
        "Right to Correction — patients can request corrections to their records",
        "Right to Deletion — request removal of non-legally-required data",
        "Right to Portability — export patient data in standard FHIR format",
        "Breach Notification — automated alerts if data breach is detected",
        "Data Minimization — system only collects clinically necessary fields",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Audit Trail">
      Every consent change is logged with who collected it, when, and the patient's explicit choice. This audit trail is retained for the legally required 5-year period.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
