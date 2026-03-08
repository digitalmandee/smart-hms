import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaInfoCard, KsaTipBox } from "./KsaDocPageWrapper";

export const KsaDocOverview = () => (
  <KsaDocPageWrapper pageNumber={3} totalPages={12}>
    <KsaSectionTitle icon="🇸🇦" title="Integration Landscape Overview" subtitle="Saudi Arabia's digital health ecosystem — 7 mandatory integrations" />

    <div className="grid grid-cols-4 gap-2 mb-4">
      <KsaInfoCard icon="🏥" label="Insurance" value="NPHIES" />
      <KsaInfoCard icon="🧾" label="E-Invoicing" value="ZATCA" />
      <KsaInfoCard icon="💊" label="E-Rx" value="Wasfaty" />
      <KsaInfoCard icon="📦" label="Drug Track" value="Tatmeen" />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-4">
      <KsaInfoCard icon="🛡" label="Public Health" value="HESN" />
      <KsaInfoCard icon="🪪" label="Identity" value="Nafath" />
      <KsaInfoCard icon="📱" label="Patient App" value="Sehhaty" />
    </div>

    <KsaSubSection title="Regulatory Bodies">
      <KsaFeatureList items={[
        "NPHIES — Council of Health Insurance (CHI) for insurance claims & eligibility",
        "ZATCA — Zakat, Tax and Customs Authority for Phase 2 e-invoicing",
        "Wasfaty — MOH e-Prescription platform for outpatient prescriptions",
        "Tatmeen / RSD — SFDA for pharmaceutical track & trace using GS1 standards",
        "HESN — MOH Health Electronic Surveillance Network for disease reporting",
        "Nafath — ELM National Authentication for patient identity verification",
        "Sehhaty — MOH patient engagement app for appointments & lab results",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Additional Compliance">
      <KsaFeatureList items={[
        "PDPL — Personal Data Protection Law with consent management",
        "ACHI / SBS / SNOMED / LOINC — medical terminology coding standards",
        "Hijri Calendar — dual Gregorian/Hijri date support across the platform",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Sandbox Mode">
      All integrations run in sandbox/simulation mode until API keys are configured in Supabase Secrets. No live data is sent without explicit configuration.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
