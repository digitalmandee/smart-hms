import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const LabDocResults = () => (
  <DocPageWrapper pageNumber={4} totalPages={5} moduleTitle="Laboratory Module Guide">
    <SectionTitle icon="📊" title="Result Entry & Validation" subtitle="Two-tier validation with abnormal flagging and critical value alerts" />
    <SubSection title="Result Entry">
      <StepList steps={[
        "Technician selects order from queue → Result entry form opens",
        "Enter values per parameter — Numeric, text, or selection",
        "System auto-flags abnormal values against reference ranges",
        "Critical values trigger immediate notification to ordering doctor",
        "Attach machine printout or image if needed",
        "Submit for validation → Moves to pathologist queue",
      ]} />
    </SubSection>
    <SubSection title="Validation Workflow">
      <MockupTable headers={["Stage", "Role", "Action"]} rows={[
        ["Entry", "Lab Technician", "Enter raw results"],
        ["Technical Review", "Senior Tech", "Verify QC, delta check"],
        ["Medical Validation", "Pathologist", "Clinical review, approve/reject"],
        ["Release", "System", "Auto-publish to EMR + notify doctor"],
      ]} />
    </SubSection>
    <SubSection title="Report Features">
      <FeatureList items={[
        "Auto-generated lab report with hospital letterhead",
        "Reference ranges displayed alongside results",
        "Abnormal values highlighted in red with H/L flags",
        "Historical comparison — Previous results trend graph",
        "Pathologist digital signature on validated reports",
        "Public lab report portal — Patient accesses via QR code",
        "PDF download and SMS/email delivery options",
      ]} />
    </SubSection>
    <TipBox title="Delta Check">System compares current results with previous values. Significant changes (e.g., Hb drop {'>'} 2g/dL) trigger delta check alerts.</TipBox>
  </DocPageWrapper>
);
