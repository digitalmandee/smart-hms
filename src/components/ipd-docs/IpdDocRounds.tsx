import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocRounds = () => (
  <DocPageWrapper pageNumber={6} totalPages={9} moduleTitle="IPD Module Guide">
    <SectionTitle icon="📋" title="Daily Rounds & Vitals" subtitle="Structured doctor rounds with vitals trending and progress notes" />
    <SubSection title="Round Workflow">
      <StepList steps={[
        "Doctor opens ward patient list → Sorted by bed number",
        "Select patient → View admission details, active orders, latest vitals",
        "Record round notes — Subjective complaints, examination findings",
        "Update diagnosis — Add or modify ICD-10 codes",
        "Place new orders — Medications, lab tests, imaging, consultations",
        "Set plan — Continue current treatment, modify, or initiate discharge",
        "Save round → Auto-timestamped with doctor name and notes",
      ]} />
    </SubSection>
    <SubSection title="Vitals Monitoring">
      <FeatureList items={[
        "Nurse records vitals at configurable intervals (Q4H, Q6H, Q8H)",
        "Parameters: BP, pulse, temperature, SpO2, respiratory rate, pain score",
        "Trend charts — Line graphs showing vitals over admission duration",
        "Abnormal value alerts — Red highlights for out-of-range readings",
        "I/O charting — Intake (IV fluids, oral) vs Output (urine, drain) tracking",
        "GCS scoring for neuro patients with automated trend",
      ]} />
    </SubSection>
    <SubSection title="Progress Notes">
      <FeatureList items={[
        "Chronological record of all rounds with timestamp and author",
        "Multi-disciplinary notes — Doctor, nurse, dietitian, physiotherapist",
        "Handover notes for shift changes with priority flags",
      ]} />
    </SubSection>
    <TipBox title="Mobile Rounds">Doctors can conduct rounds from tablet or mobile using the PWA — full EMR access with touch-optimized interface.</TipBox>
  </DocPageWrapper>
);
