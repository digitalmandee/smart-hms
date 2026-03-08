import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox } from "./KsaDocPageWrapper";

export const KsaDocWasfaty = () => (
  <KsaDocPageWrapper pageNumber={6} totalPages={12}>
    <KsaSectionTitle icon="💊" title="Wasfaty — E-Prescription" subtitle="MOH Electronic Prescription Platform for outpatient medications" />

    <KsaSubSection title="How It Works">
      <KsaStepList steps={[
        "Doctor creates prescription in HealthOS consultation screen",
        "Click 'Submit to Wasfaty' — sends FHIR MedicationRequest bundle",
        "Wasfaty validates prescription and assigns a Wasfaty Reference Number",
        "Patient receives SMS with the reference number",
        "Patient presents reference at any Wasfaty-enabled pharmacy for dispensing",
        "Dispensing pharmacy pulls prescription, dispenses, and updates status",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Prescription Data Sent">
      <KsaFeatureList items={[
        "Patient demographics — national ID, name, contact, insurance details",
        "Prescriber details — Saudi Commission (SCFHS) license number",
        "Medication — GTIN code, dosage, frequency, route, quantity, duration",
        "Diagnosis — ICD-10 codes linked to the prescription",
        "Facility — MOH facility code for the prescribing hospital/clinic",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Pharmacy Workflow (Receiving End)">
      <KsaFeatureList items={[
        "Scan or enter Wasfaty reference number in HealthOS pharmacy module",
        "System fetches full prescription details from Wasfaty API",
        "Pharmacist reviews, validates stock availability, and dispenses",
        "Dispensing status automatically reported back to Wasfaty",
        "Partial dispensing supported with remaining quantity tracking",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="SCFHS Validation">
      HealthOS validates prescriber SCFHS license numbers before submission to prevent rejection. Invalid or expired licenses are flagged immediately.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
