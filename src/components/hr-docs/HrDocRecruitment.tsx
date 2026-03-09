import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocRecruitment = () => (
  <DocPageWrapper pageNumber={8} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="🎯" title="Recruitment & Onboarding" subtitle="Job postings, applications, hiring pipeline, onboarding" />
    <SubSection title="Recruitment Pipeline">
      <StepList steps={["Create job opening with requirements, grade, department, salary band","Publish to internal portal and external job boards","Applications flow into Kanban pipeline: Applied → Screened → Interview → Offered → Hired","Schedule interviews with calendar integration and panel assignment","Generate and send offer letters from bilingual templates","Convert accepted offer to employee record with pre-filled data"]} />
    </SubSection>
    <SubSection title="Onboarding Checklist">
      <MockupTable headers={["Phase", "Tasks"]} rows={[["Pre-Joining","Offer acceptance, background check, document collection"],["Day 1","Employee ID, biometric enrollment, system credentials, welcome kit"],["Week 1","Department orientation, safety training, policy acknowledgment"],["Month 1","Buddy assignment, role-specific training, first performance check"],["Probation End","90/180-day review, confirmation or extension decision"]]} />
    </SubSection>
    <SubSection title="Onboarding for Clinical Staff">
      <FeatureList items={["Medical license verification before clinical access is granted","Mandatory BLS/ACLS certification check for patient-facing roles","Credentialing committee review for doctors and specialists","Privileging: define scope of clinical practice per doctor","Integration with compliance module for automated tracking"]} />
    </SubSection>
    <TipBox title="Automated Conversion">When a candidate is marked as 'Hired', the system auto-creates an employee record with all application data pre-filled.</TipBox>
  </DocPageWrapper>
);
