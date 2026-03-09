import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocPayroll = () => (
  <DocPageWrapper pageNumber={7} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="💰" title="Payroll Processing" subtitle="Salary structure, runs, tax, doctor wallet" />
    <SubSection title="Salary Structure">
      <FeatureList items={["Configurable salary components: basic, HRA, transport, medical","Percentage-based or fixed-amount allowances","Auto-calculation of GOSI (Saudi social insurance)","End-of-service benefit (ESB) accrual per Saudi labor law","Multi-currency support for expat employees"]} />
    </SubSection>
    <SubSection title="Payroll Run Workflow">
      <StepList steps={["HR initiates monthly payroll run for selected period","System auto-fetches attendance, overtime, deductions","Review salary breakdown per employee with drill-down","Approve payroll — generates journal entries in Finance module","Generate bank transfer file (WPS format for KSA)","Distribute digital payslips via employee self-service portal"]} />
    </SubSection>
    <SubSection title="Doctor Wallet Integration">
      <MockupTable headers={["Feature", "Detail"]} rows={[["Auto-Credit","Earnings auto-created when consultation/surgery invoice is paid"],["Share Calculation","Based on compensation plan: e.g., 50% of Rs. 2000 = Rs. 1000"],["Settlement","HR reviews pending balance → approves → bank transfer"],["Audit Trail","Every earning linked to invoice, patient, and payment record"],["Dashboard","Pending balance, settled amount, monthly trend per doctor"]]} />
    </SubSection>
    <TipBox title="Payroll Lock">Once approved, payroll is locked — corrections require a supplementary run with full audit trail.</TipBox>
  </DocPageWrapper>
);
