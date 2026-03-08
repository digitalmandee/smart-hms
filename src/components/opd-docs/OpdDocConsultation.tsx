import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocConsultation = () => (
  <DocPageWrapper pageNumber={5} totalPages={8} moduleTitle="OPD Module Guide">
    <SectionTitle icon="🩺" title="Consultation — Vitals & SOAP Notes" subtitle="Doctor consultation workflow with structured clinical documentation" />
    <SubSection title="Vitals Recording">
      <MockupTable headers={["Parameter", "Unit", "Normal Range"]} rows={[
        ["Blood Pressure", "mmHg", "120/80"],
        ["Temperature", "°C", "36.1–37.2"],
        ["Pulse Rate", "bpm", "60–100"],
        ["SpO2", "%", "95–100"],
        ["Weight", "kg", "—"],
        ["Height", "cm", "—"],
        ["BMI", "kg/m²", "18.5–24.9"],
        ["Blood Sugar", "mg/dL", "70–100 (fasting)"],
      ]} />
    </SubSection>
    <SubSection title="SOAP Notes">
      <FeatureList items={[
        "Subjective — Chief complaint, history of present illness (free text or templates)",
        "Objective — Physical examination findings, vitals summary",
        "Assessment — ICD-10 diagnosis codes with search, primary + secondary",
        "Plan — Treatment plan, medications, lab orders, follow-up instructions",
      ]} />
    </SubSection>
    <SubSection title="Clinical Actions">
      <StepList steps={[
        "Select patient from queue → Consultation page opens with patient history",
        "Record vitals → Auto-calculated BMI, abnormal value highlighting",
        "Write SOAP notes → Use templates or free-text with voice dictation",
        "Place orders → Lab tests, imaging, prescriptions from single screen",
        "Complete consultation → Patient moves to checkout queue",
      ]} />
    </SubSection>
    <TipBox title="AI Assist">Use the AI assistant to auto-suggest diagnoses based on symptoms and generate structured SOAP notes from clinical conversation.</TipBox>
  </DocPageWrapper>
);
