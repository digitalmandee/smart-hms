import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const HrDocAttendance = () => (
  <DocPageWrapper pageNumber={4} totalPages={6} moduleTitle="HR & Payroll">
    <SectionTitle icon="📅" title="Attendance & Leave" subtitle="Roster management, biometric, leave workflows" />
    <SubSection title="Attendance Tracking">
      <FeatureList items={["Biometric device integration (fingerprint, face recognition)","Mobile check-in with GPS geofencing","Automatic late/early-leave calculation based on shift","Overtime tracking with configurable thresholds","Half-day and split-shift support"]} />
    </SubSection>
    <SubSection title="Shift & Roster Management">
      <MockupTable headers={["Feature", "Detail"]} rows={[["Shift Templates","Morning, Evening, Night, Rotating"],["Roster Builder","Drag-drop weekly/monthly roster creation"],["On-Call","On-call duty assignment with auto-compensation"],["Swap Requests","Employee-initiated shift swap with approval"],["Holiday Calendar","Organization-wide + branch-specific holidays"]]} />
    </SubSection>
    <SubSection title="Leave Management">
      <StepList steps={["Employee submits leave request with type, dates, reason","Manager receives notification and reviews request","System validates against leave balance and policies","Approved leaves auto-deducted from balance","Cancellation requests follow reverse approval flow"]} />
    </SubSection>
    <TipBox title="Attendance Corrections">Employees can request corrections for missed punches — requires manager approval with audit trail.</TipBox>
  </DocPageWrapper>
);
