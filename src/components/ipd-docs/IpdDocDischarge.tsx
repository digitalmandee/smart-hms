import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocDischarge = () => (
  <DocPageWrapper pageNumber={8} totalPages={8} moduleTitle="IPD Module Guide">
    <SectionTitle icon="🚪" title="Discharge Workflow & Summary" subtitle="Clinical discharge, final billing, and post-discharge follow-up" />
    <SubSection title="Discharge Process">
      <StepList steps={[
        "Doctor initiates discharge → Sets discharge type (Normal, DAMA, Transfer, Death)",
        "Complete discharge summary — Diagnosis, treatment given, condition at discharge",
        "Add discharge medications with dosage instructions",
        "Set follow-up date and instructions",
        "Nurse confirms all pending medications/tests are completed",
        "Billing reviews final charges → Generates discharge invoice",
        "Patient/family settles payment → Receipt issued",
        "Bed released → Auto-queued to housekeeping",
      ]} />
    </SubSection>
    <SubSection title="Discharge Summary Contents">
      <FeatureList items={[
        "Patient demographics and admission details",
        "Diagnosis on admission vs discharge diagnosis (ICD-10)",
        "Summary of treatment and procedures performed",
        "Investigation results summary (key lab/imaging findings)",
        "Condition at discharge — Improved, Unchanged, Deteriorated",
        "Discharge medications with dosage and duration",
        "Follow-up instructions and next appointment date",
        "Treating doctor signature and hospital stamp",
      ]} />
    </SubSection>
    <SubSection title="Post-Discharge">
      <FeatureList items={[
        "Printable discharge summary with hospital letterhead",
        "SMS/email notification to patient with follow-up reminder",
        "Discharge invoice auto-posted to finance journal (AR)",
        "Insurance claim auto-generated for insured patients",
      ]} />
    </SubSection>
    <TipBox title="DAMA Discharge">Against Medical Advice discharges require patient/guardian acknowledgment form and auto-flag for risk management review.</TipBox>
  </DocPageWrapper>
);
