import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocSehhaty = () => (
  <KsaDocPageWrapper pageNumber={10} totalPages={12}>
    <KsaSectionTitle icon="📱" title="Sehhaty — Patient Engagement" subtitle="MOH Sehhaty app integration for appointments, results, and sick leave" />

    <KsaSubSection title="Supported Data Types">
      <KsaMockupTable
        headers={["Data Type", "FHIR Resource", "Direction"]}
        rows={[
          ["Appointments", "Appointment", "Push to Sehhaty"],
          ["Lab Results", "DiagnosticReport + Observation", "Push to Sehhaty"],
          ["Radiology Reports", "ImagingStudy", "Push to Sehhaty"],
          ["Sick Leave (e-Jaza)", "DocumentReference", "Push to Sehhaty"],
          ["Prescriptions", "MedicationRequest", "Push to Sehhaty"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Push Workflow">
      <KsaStepList steps={[
        "Clinical event occurs — appointment booked, lab result finalized, etc.",
        "Staff clicks 'Push to Sehhaty' or auto-push triggers (configurable)",
        "HealthOS generates FHIR bundle with appropriate resources",
        "Bundle sent via sehhaty-gateway edge function to Sehhaty API",
        "Patient receives notification in Sehhaty mobile app",
        "Sync status logged in sehhaty_sync_log table for audit",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="e-Jaza (Electronic Sick Leave)">
      <KsaFeatureList items={[
        "Doctor issues sick leave from consultation — dates, diagnosis, employer",
        "e-Jaza automatically pushed to Sehhaty for MOH validation",
        "Patient and employer can verify sick leave via Sehhaty app",
        "Supports extension requests and cancellation workflows",
        "Integrated with HR/employer notification systems",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Auto-Push">
      Enable auto-push in KSA settings to automatically send lab results and appointments to Sehhaty without manual intervention — reducing staff workload.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
