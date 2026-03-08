import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocConfig = () => (
  <KsaDocPageWrapper pageNumber={12} totalPages={12}>
    <KsaSectionTitle icon="⚙️" title="Configuration & Testing Guide" subtitle="API keys, sandbox setup, and go-live checklist" />

    <KsaSubSection title="Required API Keys (Supabase Secrets)">
      <KsaMockupTable
        headers={["Secret Name", "Provider", "Purpose"]}
        rows={[
          ["NPHIES_API_KEY / _URL", "CHI", "Insurance eligibility & claims"],
          ["ZATCA_API_KEY / _URL", "ZATCA", "E-invoicing clearance & reporting"],
          ["WASFATY_API_KEY / _URL", "MOH", "E-prescription gateway"],
          ["TATMEEN_API_KEY / _URL", "SFDA", "Drug track & trace"],
          ["HESN_API_KEY / _URL", "MOH", "Public health reporting"],
          ["NAFATH_API_KEY / _APP_ID / _URL", "ELM", "Identity verification"],
          ["SEHHATY_API_KEY / _URL", "MOH", "Patient app sync"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Go-Live Checklist">
      <KsaStepList steps={[
        "Enable KSA Compliance module in Organization → Modules settings",
        "Add all API keys to Supabase Secrets (Dashboard → Edge Functions → Secrets)",
        "Configure ZATCA X.509 certificate and CSID via ZATCA onboarding portal",
        "Register facility MOH code for Wasfaty and HESN reporting",
        "Test each integration in sandbox mode — verify responses are successful",
        "Switch environment URLs from sandbox to production endpoints",
        "Run end-to-end test: registration → consultation → claim → invoice",
        "Enable auto-push for Sehhaty and auto-reporting for HESN",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Sandbox vs Production">
      <KsaFeatureList items={[
        "All integrations default to sandbox mode — no real data is submitted",
        "Sandbox responses are simulated with realistic success/error patterns",
        "Switch to production by updating API URLs in Supabase Secrets",
        "Production mode requires valid API keys from each regulatory body",
        "Logging level increases in production for compliance audit requirements",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Support">
      Contact HealthOS support at support@healthos24.com or +971 506802430 for assistance with KSA integration onboarding and API key procurement.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
