import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocReports = () => (
  <DocPageWrapper pageNumber={14} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="📊" title="Reports & Analytics" subtitle="HR dashboards, KPIs, and management reports" />
    <SubSection title="HR Dashboard KPIs">
      <MockupTable headers={["KPI", "Description"]} rows={[
        ["Total Headcount", "Active employees by department, branch, nationality"],
        ["Turnover Rate", "Monthly/quarterly attrition with trend analysis"],
        ["Attendance Rate", "Organization-wide on-time, late, absent percentages"],
        ["Leave Utilization", "Leave balance consumption by type and department"],
        ["Payroll Cost", "Total compensation breakdown by component"],
        ["Open Positions", "Active job openings with time-to-fill metrics"],
        ["License Compliance", "Percentage of employees with valid, non-expired licenses"],
      ]} />
    </SubSection>
    <SubSection title="Standard Reports">
      <FeatureList items={[
        "Employee directory with advanced filtering and export to Excel/PDF",
        "Monthly attendance summary: late count, overtime hours, absent days",
        "Payroll register: gross, deductions, net pay per employee",
        "GOSI contribution report for social insurance submissions",
        "WPS bank transfer file generation (KSA compliance)",
        "Leave balance report: accrued, used, remaining per employee",
        "Contract expiry report: upcoming renewals by month",
        "Training compliance: completion rates by department",
      ]} />
    </SubSection>
    <SubSection title="Analytics & Trends">
      <FeatureList items={[
        "Headcount trend: monthly growth/decline over 12 months",
        "Department-wise cost analysis with budget variance",
        "Overtime trend analysis with cost impact projection",
        "Exit analysis: top reasons, department patterns, tenure at exit",
        "Doctor earnings summary: revenue per doctor with hospital share",
      ]} />
    </SubSection>
    <TipBox title="Scheduled Reports">Configure auto-generated reports delivered via email — daily attendance summary, weekly payroll preview, monthly HR dashboard.</TipBox>
  </DocPageWrapper>
);
