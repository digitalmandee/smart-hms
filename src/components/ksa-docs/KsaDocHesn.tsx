import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocHesn = () => (
  <KsaDocPageWrapper pageNumber={8} totalPages={12}>
    <KsaSectionTitle icon="🛡" title="HESN — Public Health Reporting" subtitle="Health Electronic Surveillance Network — MOH communicable disease reporting" />

    <KsaSubSection title="Reportable Conditions">
      <KsaMockupTable
        headers={["Category", "Examples", "Deadline"]}
        rows={[
          ["Immediate", "MERS-CoV, Cholera, Plague", "Within 1 hour"],
          ["Urgent", "TB, Measles, Hepatitis B", "Within 24 hours"],
          ["Routine", "Seasonal Influenza, Chickenpox", "Within 7 days"],
          ["Immunization", "All vaccinations administered", "Within 24 hours"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Reporting Workflow">
      <KsaStepList steps={[
        "Doctor diagnoses a reportable condition during consultation",
        "System auto-detects reportable ICD-10 codes and shows alert",
        "Click 'Report to HESN' — generates FHIR Communication resource",
        "Report sent via hesn-gateway edge function to MOH HESN API",
        "Confirmation received and logged in hesn_reports table",
        "Follow-up reports can be submitted for case updates",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Data Elements Reported">
      <KsaFeatureList items={[
        "Patient demographics — age, gender, nationality, city/region",
        "Clinical data — diagnosis codes, symptoms, onset date, lab results",
        "Facility information — MOH facility code, reporting physician",
        "Epidemiological data — travel history, contact tracing, exposure",
        "Outcome tracking — hospitalization, ICU, recovery, or death",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Auto-Detection">
      HealthOS maintains a built-in ICD-10 watchlist for HESN-reportable conditions. When a matching diagnosis is entered, the reporting button activates automatically.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
