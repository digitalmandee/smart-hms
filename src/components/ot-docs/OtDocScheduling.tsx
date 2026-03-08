import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OtDocScheduling = () => (
  <DocPageWrapper pageNumber={4} totalPages={8} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="📅" title="Surgery Request & Scheduling" subtitle="From surgery request to OT slot allocation and team assignment" />
    <SubSection title="Request Workflow">
      <StepList steps={[
        "Surgeon submits surgery request from IPD or OPD consultation",
        "Request includes: Patient, procedure, urgency, preferred date/time",
        "OT coordinator reviews request and checks room availability",
        "Assign OT room, anesthetist, and nursing team",
        "Confirm schedule → Notify all team members",
      ]} />
    </SubSection>
    <SubSection title="OT Schedule Board">
      <MockupTable headers={["Time", "OT Room", "Patient", "Procedure", "Surgeon", "Status"]} rows={[
        ["08:00–10:00", "OT-1", "Ahmed K.", "Appendectomy", "Dr. Hassan", "✅ Completed"],
        ["10:30–12:00", "OT-1", "Fatima S.", "Cholecystectomy", "Dr. Noor", "🔵 In Progress"],
        ["08:00–11:00", "OT-2", "Omar M.", "Total Knee Replace.", "Dr. Khalid", "🔵 In Progress"],
        ["13:00–14:00", "OT-2", "Sara A.", "Hernia Repair", "Dr. Hassan", "⏳ Scheduled"],
      ]} />
    </SubSection>
    <SubSection title="Urgency Classification">
      <FeatureList items={[
        "Elective — Planned surgery, scheduled days/weeks in advance",
        "Urgent — Within 24 hours, requires priority scheduling",
        "Emergency — Immediate, bumps existing schedule if needed",
        "Emergency cases auto-alert all available OT teams via notification",
      ]} />
    </SubSection>
    <TipBox title="Conflict Detection">System auto-detects scheduling conflicts — same room, same surgeon, or same patient — and alerts the coordinator.</TipBox>
  </DocPageWrapper>
);
