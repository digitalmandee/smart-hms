import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocPrescriptions = () => (
  <DocPageWrapper pageNumber={7} totalPages={8} moduleTitle="OPD Module Guide">
    <SectionTitle icon="💊" title="Prescriptions & Dispensing" subtitle="E-prescriptions with pharmacy queue integration and Wasfaty compliance" />
    <SubSection title="Prescribing Workflow">
      <StepList steps={[
        "Doctor searches medicine catalog by name or generic name",
        "Select dosage form, strength, and route of administration",
        "Set frequency (e.g., TID), duration (e.g., 7 days), and quantity",
        "Add special instructions (with meals, before sleep, etc.)",
        "Review drug interactions and allergy alerts before confirming",
        "Submit prescription → Auto-queued in pharmacy module",
      ]} />
    </SubSection>
    <SubSection title="Prescription Details">
      <MockupTable headers={["Medicine", "Dose", "Frequency", "Duration", "Qty"]} rows={[
        ["Amoxicillin 500mg", "1 cap", "TID", "7 days", "21"],
        ["Paracetamol 500mg", "2 tab", "PRN", "5 days", "10"],
        ["Omeprazole 20mg", "1 cap", "OD (AC)", "14 days", "14"],
      ]} />
    </SubSection>
    <SubSection title="Safety Checks">
      <FeatureList items={[
        "Drug-allergy cross-check against patient allergy records",
        "Drug-drug interaction alerts with severity levels",
        "Duplicate therapy detection for same drug class",
        "Dose range validation for pediatric and elderly patients",
        "Wasfaty e-prescription compliance for KSA facilities",
      ]} />
    </SubSection>
    <TipBox title="Wasfaty Integration">For KSA facilities, prescriptions can be submitted to the Wasfaty national e-prescription platform with one click.</TipBox>
  </DocPageWrapper>
);
