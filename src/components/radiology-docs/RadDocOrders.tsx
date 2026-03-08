import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const RadDocOrders = () => (
  <DocPageWrapper pageNumber={3} totalPages={5} moduleTitle="Radiology Module Guide">
    <SectionTitle icon="📡" title="Order Management & Scheduling" subtitle="From clinical request to imaging appointment and preparation" />
    <SubSection title="Order Sources">
      <FeatureList items={[
        "OPD — Doctor orders imaging from consultation screen",
        "IPD — Attending physician orders from ward rounds",
        "Emergency — STAT imaging with priority escalation",
        "External referral — Scanned request uploaded to system",
      ]} />
    </SubSection>
    <SubSection title="Imaging Workflow">
      <StepList steps={[
        "Order received → Appears in radiology worklist with priority",
        "Schedule appointment — Select modality, room, time slot",
        "Patient preparation instructions auto-sent (fasting, contrast, etc.)",
        "Technician performs imaging → Marks study as completed",
        "Images sent to PACS → Available for radiologist review",
        "Report assigned to radiologist for interpretation",
      ]} />
    </SubSection>
    <SubSection title="Modalities Supported">
      <MockupTable headers={["Modality", "Code", "Avg TAT"]} rows={[
        ["X-Ray", "CR/DX", "30 min"],
        ["Ultrasound", "US", "1 hour"],
        ["CT Scan", "CT", "2 hours"],
        ["MRI", "MR", "4 hours"],
        ["Mammography", "MG", "1 hour"],
        ["Fluoroscopy", "RF", "2 hours"],
      ]} />
    </SubSection>
    <TipBox title="Contrast Management">System tracks contrast agent administration — type, dose, lot number — and monitors for adverse reactions post-procedure.</TipBox>
  </DocPageWrapper>
);
