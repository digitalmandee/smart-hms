import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocEmployee = () => (
  <DocPageWrapper pageNumber={3} totalPages={6} moduleTitle="HR & Payroll">
    <SectionTitle icon="👤" title="Employee Management" subtitle="Profiles, departments & org chart" />
    <SubSection title="Employee Registration">
      <StepList steps={["Navigate to HR → Employees → Add Employee","Fill personal info: name, DOB, national ID, contact","Set employment details: department, designation, grade, joining date","Upload documents: ID copy, contract, certificates","Assign reporting manager and branch"]} />
    </SubSection>
    <SubSection title="Department Hierarchy">
      <FeatureList items={["Visual department tree with drag-and-drop reorganization","Department head assignment with auto-delegation rules","Cost center mapping for each department","Sub-department nesting up to 5 levels","Headcount tracking with budget vs actual"]} />
    </SubSection>
    <SubSection title="Employee Profile Tabs">
      <MockupTable headers={["Tab", "Contents"]} rows={[["Personal","Bio, emergency contacts, bank details"],["Employment","Department, designation, grade history"],["Documents","Uploaded contracts, IDs, certificates"],["Salary","Current package, allowances, deductions"],["Leave","Balance, history, upcoming requests"]]} />
    </SubSection>
    <TipBox title="Bulk Import">Upload CSV of employees for mass onboarding — system validates duplicates by national ID.</TipBox>
  </DocPageWrapper>
);
