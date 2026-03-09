import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocDoctorNurse = () => (
  <DocPageWrapper pageNumber={5} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="🩺" title="Doctor & Nurse Management" subtitle="Clinical staff onboarding, compensation & wallet" />
    <SubSection title="Doctor Onboarding Flow">
      <StepList steps={[
        "Add Employee → select category 'Doctor' → Doctor Details tab appears",
        "Enter medical license number, issuing authority, expiry date",
        "Select specialization, qualification, consultation fee",
        "Upload required documents: degree, license copy, malpractice insurance",
        "Set compensation plan: consultation share %, surgery share %, fixed salary",
        "System auto-tracks license expiry — alerts 90/60/30 days before expiration",
      ]} />
    </SubSection>
    <SubSection title="Compensation Plans">
      <MockupTable headers={["Component", "Description"]} rows={[
        ["Consultation Share", "Percentage of OPD consultation fee earned by doctor (e.g. 50%)"],
        ["Surgery Share", "Percentage of surgery charges credited to surgeon wallet"],
        ["Fixed Salary", "Monthly base salary independent of patient volume"],
        ["Bonus/Incentive", "Performance-based bonus calculated quarterly"],
        ["On-Call Allowance", "Per-shift allowance for on-call duty coverage"],
      ]} />
    </SubSection>
    <SubSection title="Doctor Wallet & Earnings">
      <FeatureList items={[
        "Auto-credited when consultation invoice is paid (via database trigger)",
        "Earnings breakdown: consultation, surgery, procedures, on-call",
        "Settlement process: HR reviews → approves → bank transfer generated",
        "Full audit trail: every earning linked to invoice and patient",
        "Dashboard view: pending balance, settled amount, monthly trend",
      ]} />
    </SubSection>
    <SubSection title="Nurse & Paramedical Staff">
      <FeatureList items={[
        "Nurse categories: Staff Nurse, Head Nurse, Charge Nurse, Specialist",
        "License tracking: nursing license, BLS/ACLS certification",
        "Ward assignment and rotation scheduling",
        "Paramedical: lab technicians, radiology techs, pharmacists, physiotherapists",
        "Visiting doctor management with session-based scheduling",
      ]} />
    </SubSection>
    <TipBox title="License Compliance">When a doctor's medical license expires, the system automatically restricts appointment booking until the license is renewed and verified.</TipBox>
  </DocPageWrapper>
);
