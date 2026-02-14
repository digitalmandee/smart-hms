import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "./DocPageWrapper";

export const DocDispensing = () => (
  <DocPageWrapper pageNumber={11} totalPages={18}>
    <SectionTitle
      icon="📋"
      title="Prescription Queue & Dispensing"
      subtitle="Real-time clinical prescription queue with batch-level dispensing workflow"
    />

    <SubSection title="Prescription Queue">
      <FeatureList items={[
        "Real-time feed of prescriptions from OPD and IPD consultations",
        "Each entry shows: Patient name, MR#, Doctor, Medication count, Time",
        "Priority flagging for urgent prescriptions (e.g., emergency medications)",
        "Status indicators: Pending, In Progress, Dispensed, Partially Dispensed",
        "Auto-refresh to capture new prescriptions without manual reload",
      ]} />
    </SubSection>

    <SubSection title="Dispensing Workflow">
      <StepList steps={[
        "Select a prescription from the queue to open the dispensing view",
        "Review all prescribed medications with dosage instructions",
        "For each medicine, select the appropriate batch (FEFO recommended)",
        "Verify quantities against the prescription — system warns on mismatches",
        "Confirm dispensing to deduct stock from selected batches",
        "Optionally send to POS for billing (retail) or post to patient profile (IPD)",
      ]} />
    </SubSection>

    <SubSection title="Batch Selection">
      <FeatureList items={[
        "Batch selector shows: Batch number, Available quantity, Expiry date",
        "FEFO sorting — earliest expiry batches appear first",
        "Expired batches are highlighted in red and blocked from selection",
        "Split dispensing across multiple batches if single batch insufficient",
      ]} />
    </SubSection>

    <SubSection title="Prescription History">
      <FeatureList items={[
        "Complete log of all dispensed prescriptions with timestamps",
        "Filter by patient, doctor, date range, or dispensing status",
        "View which batches were used for each dispensed item",
        "Audit trail for regulatory compliance and controlled substances",
      ]} />
    </SubSection>

    <TipBox title="Controlled Substances">
      Enable 'Controlled Substance Prescription Requirement' in Settings to mandate a valid prescription before dispensing scheduled drugs through the POS.
    </TipBox>
  </DocPageWrapper>
);
