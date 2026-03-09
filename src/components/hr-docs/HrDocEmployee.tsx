import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocEmployee = () => (
  <DocPageWrapper pageNumber={4} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="👤" title="Employee Management" subtitle="Profiles, departments & org chart" />
    <SubSection title="Employee Registration">
      <StepList steps={["Navigate to HR → Employees → Add Employee","Fill personal info: name, DOB, national ID, contact","Set employment details: department, designation, grade, joining date","Upload documents: ID copy, contract, certificates with expiry dates","Assign reporting manager, branch, and employee category (Doctor/Nurse/Admin)"]} />
    </SubSection>
    <SubSection title="Department Hierarchy">
      <FeatureList items={["Visual department tree with drag-and-drop reorganization","Department head assignment with auto-delegation rules","Cost center mapping for each department","Sub-department nesting up to 5 levels","Headcount tracking with budget vs actual"]} />
    </SubSection>
    <SubSection title="Employee Profile Tabs">
      <MockupTable headers={["Tab", "Contents"]} rows={[["Personal","Bio, emergency contacts, bank details, nationality"],["Employment","Department, designation, grade history, transfers"],["Documents","Uploaded contracts, IDs, certificates with expiry tracking"],["Doctor Details","License #, specialization, consultation fee, compensation plan"],["Salary","Current package, allowances, deductions, payslips"],["Leave","Balance, history, upcoming requests, encashment"]]} />
    </SubSection>
    <TipBox title="Employee Categories">Employees are categorized as Doctor, Nurse, Paramedical, Support Staff, or Admin — each category triggers specific fields and compliance requirements.</TipBox>
  </DocPageWrapper>
);
