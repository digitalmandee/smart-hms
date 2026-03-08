import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocAppointment = () => (
  <DocPageWrapper pageNumber={3} totalPages={8} moduleTitle="OPD Module Guide">
    <SectionTitle icon="📅" title="Appointment Booking & Check-In" subtitle="Schedule, walk-in, and kiosk-based patient registration" />
    <SubSection title="Booking Channels">
      <FeatureList items={[
        "Receptionist booking — Select patient, doctor, date/time, department",
        "Walk-in registration — Quick form with auto-token assignment",
        "Self-service kiosk — Patient scans ID or enters MRN, selects department",
        "Online booking — Patient portal with available slot visibility",
      ]} />
    </SubSection>
    <SubSection title="Check-In Workflow">
      <StepList steps={[
        "Patient arrives → Receptionist searches by MRN, name, or phone",
        "Verify appointment → Confirm date, doctor, payment status",
        "Record vitals at check-in — BP, temperature, weight, height, SpO2",
        "Assign token number → Auto-generated per department queue",
        "Patient moves to waiting area → Queue display shows token status",
      ]} />
    </SubSection>
    <SubSection title="Priority & Triage">
      <FeatureList items={[
        "Priority levels: Normal, Urgent, VIP, Emergency",
        "Urgent/Emergency patients bypass regular queue",
        "VIP flag for corporate or insurance-prioritized patients",
        "Queue reordering available for admin/nurse roles",
      ]} />
    </SubSection>
    <TipBox title="Kiosk Mode">Configure self-service kiosks per branch with department filters, language selection (EN/AR/UR), and receipt printing.</TipBox>
  </DocPageWrapper>
);
