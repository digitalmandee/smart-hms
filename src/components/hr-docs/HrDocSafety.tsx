import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocSafety = () => (
  <DocPageWrapper pageNumber={13} totalPages={14} moduleTitle="HR & Payroll">
    <SectionTitle icon="⚠️" title="Safety & Incidents" subtitle="Workplace safety, incident reporting, disciplinary actions" />
    <SubSection title="Safety Incident Reporting">
      <StepList steps={[
        "Employee or supervisor reports incident via digital form",
        "Capture: date, location, type (needle stick, slip/fall, exposure), severity",
        "Immediate notification to department head and safety officer",
        "Investigation initiated with root cause analysis",
        "Corrective action plan documented and tracked to completion",
      ]} />
    </SubSection>
    <SubSection title="Incident Categories">
      <MockupTable headers={["Category", "Examples"]} rows={[
        ["Occupational Injury", "Needle stick, sharps injury, chemical splash"],
        ["Workplace Accident", "Slip, trip, fall, equipment malfunction"],
        ["Patient Safety", "Medication error, wrong patient, procedural breach"],
        ["Environmental", "Fire, flood, hazardous material spill"],
        ["Violence/Harassment", "Verbal abuse, physical assault, harassment"],
      ]} />
    </SubSection>
    <SubSection title="Disciplinary Actions">
      <FeatureList items={[
        "Progressive discipline: verbal warning → written → suspension → termination",
        "Incident documentation with witness statements and evidence",
        "Appeal process with committee review and timeline tracking",
        "Integration with HR letters for warning/termination notices",
        "Confidential records accessible only to HR and management",
      ]} />
    </SubSection>
    <TipBox title="OSHA Compliance">All workplace incidents are logged per OSHA standards — annual summary report generated for regulatory submission.</TipBox>
  </DocPageWrapper>
);
