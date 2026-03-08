import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocRecruitment = () => (
  <DocPageWrapper pageNumber={6} totalPages={6} moduleTitle="HR & Payroll">
    <SectionTitle icon="🎯" title="Recruitment & Onboarding" subtitle="Job postings, applications, hiring pipeline" />
    <SubSection title="Recruitment Pipeline">
      <StepList steps={["Create job opening with requirements, grade, department","Publish to internal portal and external job boards","Applications flow into Kanban pipeline: Applied → Screened → Interview → Offered → Hired","Schedule interviews with calendar integration","Generate and send offer letters from templates","Convert accepted offer to employee record"]} />
    </SubSection>
    <SubSection title="Onboarding Checklist">
      <FeatureList items={["Automated onboarding task list per department","Document collection tracker (ID, visa, medical report)","IT asset assignment (laptop, badge, email account)","Orientation schedule with training modules","Probation period tracking with milestone reviews"]} />
    </SubSection>
    <SubSection title="Reports & Analytics">
      <MockupTable headers={["Report", "Description"]} rows={[["Headcount","Active employees by department, grade, nationality"],["Turnover","Monthly attrition rate with exit interview analysis"],["Attendance Summary","Late arrivals, absences, overtime by department"],["Payroll Cost","Total cost breakdown by component and department"],["Leave Balance","Organization-wide leave utilization report"]]} />
    </SubSection>
    <TipBox title="Exit Process">Resignation triggers automated checklist: clearance, final settlement, ESB calculation, and asset return.</TipBox>
  </DocPageWrapper>
);
