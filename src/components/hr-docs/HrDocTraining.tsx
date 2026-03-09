import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocTraining = () => (
  <DocPageWrapper pageNumber={11} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="🎓" title="Training & Development" subtitle="Clinical certifications, skills tracking, CME" />
    <SubSection title="Training Program Management">
      <StepList steps={[
        "HR creates training program: title, type, duration, department",
        "Assign mandatory training to employees by category or department",
        "Track attendance and completion with certificate upload",
        "Score/grade recording for competency-based assessments",
        "Auto-renewal reminders for recurring certifications (BLS, fire safety)",
      ]} />
    </SubSection>
    <SubSection title="Training Categories">
      <MockupTable headers={["Category", "Examples"]} rows={[
        ["Clinical Skills", "BLS, ACLS, PALS, infection control, medication safety"],
        ["Compliance", "HIPAA, patient privacy, data security, workplace safety"],
        ["Technical", "EHR system training, medical equipment operation"],
        ["Soft Skills", "Communication, leadership, conflict resolution"],
        ["Orientation", "New hire orientation, department-specific onboarding"],
      ]} />
    </SubSection>
    <SubSection title="CME (Continuing Medical Education)">
      <FeatureList items={[
        "CME credit tracking per doctor/nurse as per licensing requirements",
        "External conference and workshop attendance logging",
        "Certificate upload and verification by HR",
        "Annual CME compliance report for accreditation audits",
        "Budget tracking: training cost per employee and department",
      ]} />
    </SubSection>
    <TipBox title="Mandatory Training">System blocks access to clinical modules if mandatory safety training is overdue — ensures 100% compliance.</TipBox>
  </DocPageWrapper>
);
