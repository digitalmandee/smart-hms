import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OtDocPreOp = () => (
  <DocPageWrapper pageNumber={5} totalPages={8} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="📝" title="Pre-Op Assessment & Consent" subtitle="Pre-operative evaluation, risk assessment, and informed consent" />
    <SubSection title="Pre-Op Checklist">
      <StepList steps={[
        "Verify patient identity — Name, MRN, wristband",
        "Review pre-op investigations — Blood work, ECG, chest X-ray",
        "Confirm fasting status (NPO) — Minimum 6 hours for solids",
        "Allergy and medication review — Stop anticoagulants if needed",
        "Anesthesia pre-assessment — Airway, cardiac, risk scoring",
        "Mark surgical site — Surgeon marks laterality",
        "Informed consent — Procedure, risks, alternatives explained",
        "Blood product availability — Cross-match if required",
      ]} />
    </SubSection>
    <SubSection title="Risk Assessment">
      <FeatureList items={[
        "ASA Physical Status Classification (I–VI)",
        "Mallampati airway score for intubation difficulty",
        "Cardiac risk index (Goldman/Lee) for cardiac events",
        "DVT risk assessment with prophylaxis protocol",
        "Surgical site infection risk with antibiotic prophylaxis",
      ]} />
    </SubSection>
    <SubSection title="Consent Documentation">
      <FeatureList items={[
        "Digital consent forms with patient/guardian signature capture",
        "Multi-language consent templates (English, Arabic, Urdu)",
        "Procedure-specific risk disclosures auto-populated",
        "Witness signature and timestamp recorded",
        "Consent form linked to surgery record permanently",
      ]} />
    </SubSection>
    <TipBox title="WHO Surgical Safety Checklist">The system enforces the WHO 3-phase checklist: Sign In (before anesthesia), Time Out (before incision), Sign Out (before leaving OT).</TipBox>
  </DocPageWrapper>
);
