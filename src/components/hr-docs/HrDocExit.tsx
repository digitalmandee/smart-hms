import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocExit = () => (
  <DocPageWrapper pageNumber={12} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="🚪" title="Exit Management" subtitle="Resignation, clearance, settlement & exit interviews" />
    <SubSection title="Resignation Workflow">
      <StepList steps={[
        "Employee submits resignation via self-service portal",
        "Manager receives notification → approves or requests meeting",
        "HR validates notice period per contract (30/60/90 days)",
        "System calculates last working day and pending leave balance",
        "Resignation accepted → triggers automated clearance checklist",
      ]} />
    </SubSection>
    <SubSection title="Clearance Process">
      <MockupTable headers={["Department", "Clearance Items"]} rows={[
        ["IT", "Laptop, badge, email deactivation, system access revoked"],
        ["Finance", "Pending advances, loan recovery, final expense claims"],
        ["HR", "ID card, uniforms, locker keys, company property"],
        ["Department Head", "Knowledge transfer, handover completion, project status"],
        ["Administration", "Parking card, library books, facility access"],
      ]} />
    </SubSection>
    <SubSection title="Final Settlement">
      <FeatureList items={[
        "Auto-calculation of End-of-Service Benefit (ESB) per Saudi labor law",
        "Pending salary, overtime, and leave encashment computation",
        "Loan/advance recovery deduction from final amount",
        "GOSI de-registration notification generation",
        "Settlement letter and experience letter auto-generated",
      ]} />
    </SubSection>
    <SubSection title="Exit Interview">
      <FeatureList items={[
        "Structured questionnaire: work environment, management, growth",
        "Confidential feedback captured with sentiment analysis",
        "Aggregate exit data for turnover trend reporting",
        "Actionable insights dashboard for HR leadership",
      ]} />
    </SubSection>
    <TipBox title="Rehire Flag">Employees who leave on good terms are flagged as 'eligible for rehire' — speeds up future recruitment.</TipBox>
  </DocPageWrapper>
);
