import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocLettersContracts = () => (
  <DocPageWrapper pageNumber={10} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="📄" title="HR Letters & Contracts" subtitle="Templated letters, contract lifecycle, renewals" />
    <SubSection title="HR Letter Templates">
      <MockupTable headers={["Letter Type", "Use Case"]} rows={[
        ["Offer Letter", "Generated after candidate accepts — includes salary, benefits, joining date"],
        ["Experience Letter", "Issued on resignation/termination with service period details"],
        ["NOC (No Objection)", "For visa transfer, part-time work, or external training"],
        ["Salary Certificate", "Bank-formatted certificate for loan/visa applications"],
        ["Warning Letter", "Disciplinary action documentation with incident details"],
        ["Termination Letter", "Final notice with settlement details and last working day"],
      ]} />
    </SubSection>
    <SubSection title="Letter Generation Workflow">
      <StepList steps={[
        "Select employee → choose letter type from template library",
        "System auto-fills: employee name, ID, department, salary, dates",
        "HR reviews and edits content in rich-text editor",
        "Generate PDF with organization letterhead and digital signature",
        "Letter stored in employee document history with audit trail",
      ]} />
    </SubSection>
    <SubSection title="Contract Management">
      <FeatureList items={[
        "Employment contract creation with configurable clauses",
        "Probation period tracking: 90/180 days with milestone reviews",
        "Contract renewal alerts: 60 days before expiry",
        "Amendment tracking: salary revisions, role changes, transfers",
        "Digital acceptance workflow with e-signature support",
      ]} />
    </SubSection>
    <TipBox title="Bilingual Support">All letters can be generated in English and Arabic — required for KSA labor law compliance.</TipBox>
  </DocPageWrapper>
);
