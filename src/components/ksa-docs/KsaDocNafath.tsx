import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox } from "./KsaDocPageWrapper";

export const KsaDocNafath = () => (
  <KsaDocPageWrapper pageNumber={9} totalPages={12}>
    <KsaSectionTitle icon="🪪" title="Nafath — Identity Verification" subtitle="ELM National Authentication — secure patient identity via mobile MFA" />

    <KsaSubSection title="Verification Flow">
      <KsaStepList steps={[
        "Staff clicks 'Verify with Nafath' on patient registration screen",
        "System sends verification request to Nafath API with patient's National ID",
        "Random number displayed on screen — patient must select it in Nafath app",
        "Patient opens Nafath mobile app and approves with matching number",
        "System polls for result — verified status saved to patient record",
        "Patient marked as nafath_verified with timestamp for audit trail",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="When to Use Nafath">
      <KsaFeatureList items={[
        "New patient registration — verify identity before creating medical record",
        "Insurance eligibility — confirm patient identity matches policy holder",
        "Controlled substance dispensing — verify patient for narcotics/psychotropics",
        "Consent management — authenticate patient before PDPL consent collection",
        "Telemedicine — verify remote patient identity before virtual consultation",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Technical Details">
      <KsaFeatureList items={[
        "Supports Saudi National ID (10 digits) and Iqama (10 digits)",
        "Verification timeout: 120 seconds for patient to respond",
        "Polling interval: 3 seconds for real-time status updates",
        "Cached verification valid for configurable period (default 30 days)",
        "Fallback: manual ID verification with document upload if Nafath unavailable",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Privacy">
      Nafath verification is privacy-preserving — HealthOS never receives the patient's Nafath credentials. Only a verified/rejected status is returned.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
