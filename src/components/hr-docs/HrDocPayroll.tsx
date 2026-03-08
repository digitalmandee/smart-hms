import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocPayroll = () => (
  <DocPageWrapper pageNumber={5} totalPages={6} moduleTitle="HR & Payroll">
    <SectionTitle icon="💰" title="Payroll Processing" subtitle="Salary structure, runs, tax & compliance" />
    <SubSection title="Salary Structure">
      <FeatureList items={["Configurable salary components: basic, HRA, transport, medical","Percentage-based or fixed-amount allowances","Auto-calculation of GOSI (Saudi social insurance)","End-of-service benefit (ESB) accrual per Saudi labor law","Multi-currency support for expat employees"]} />
    </SubSection>
    <SubSection title="Payroll Run Workflow">
      <StepList steps={["HR initiates monthly payroll run for selected period","System auto-fetches attendance, overtime, deductions","Review salary breakdown per employee with drill-down","Approve payroll — generates journal entries in Finance","Generate bank transfer file (WPS format for KSA)","Distribute digital payslips via employee portal"]} />
    </SubSection>
    <SubSection title="Deduction Types">
      <MockupTable headers={["Type", "Calculation", "Mandatory"]} rows={[["GOSI Employee","9.75% of basic","Yes (KSA)"],["GOSI Employer","11.75% of basic","Yes (KSA)"],["Loan EMI","Fixed monthly deduction","If applicable"],["Absence","Per-day pro-rata deduction","Auto"],["Tax (Expat)","Per contract terms","If applicable"]]} />
    </SubSection>
    <TipBox title="Payroll Lock">Once approved, payroll is locked — corrections require a supplementary run with full audit trail.</TipBox>
  </DocPageWrapper>
);
