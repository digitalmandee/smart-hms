import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DialDocSchedule = () => (
  <DocPageWrapper pageNumber={6} totalPages={6} module="Dialysis Center">
    <SectionTitle icon="📆" title="Scheduling & Reports" subtitle="MWF/TTS groups, capacity planning & analytics" />
    <SubSection title="Schedule Management">
      <FeatureList items={[
        "MWF (Mon-Wed-Fri) and TTS (Tue-Thu-Sat) schedule groups",
        "Multiple shifts per day: Morning, Afternoon, Evening",
        "Chair-based capacity view — visual calendar grid",
        "Drag-and-drop rescheduling with conflict detection",
        "Holiday and Ramadan schedule adjustments",
        "Waitlist management for new patients"
      ]} />
    </SubSection>
    <SubSection title="Capacity Dashboard">
      <MockupTable headers={["Metric", "Description"]} rows={[
        ["Total Chairs", "Available chairs per shift"],
        ["Utilization Rate", "Sessions completed / available slots"],
        ["No-Show Rate", "Missed sessions as % of scheduled"],
        ["Average Duration", "Mean session time in minutes"],
        ["Machine Uptime", "% of machines available vs maintenance"],
      ]} />
    </SubSection>
    <SubSection title="Reports & Analytics">
      <MockupTable headers={["Report", "Content"]} rows={[
        ["Session Summary", "Daily/weekly sessions by shift, chair, machine"],
        ["Patient Adequacy", "Kt/V trends, URR, target achievement"],
        ["Complications", "Frequency of hypotension, cramps, clotting"],
        ["Machine Usage", "Sessions per machine, disinfection compliance"],
        ["Financial", "Revenue per session, insurance claims status"],
      ]} />
    </SubSection>
    <TipBox title="Automated Reminders">Patients receive SMS/WhatsApp reminders 24 hours before scheduled sessions with pre-session instructions.</TipBox>
  </DocPageWrapper>
);
