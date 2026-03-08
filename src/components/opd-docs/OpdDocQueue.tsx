import { DocPageWrapper, SectionTitle, FeatureList, SubSection, ScreenMockup, InfoCard, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocQueue = () => (
  <DocPageWrapper pageNumber={5} totalPages={9} moduleTitle="OPD Module Guide">
    <SectionTitle icon="📟" title="Token Queue & Priority" subtitle="Real-time queue management with TV display and kiosk integration" />
    <ScreenMockup title="Queue Display — Department View">
      <div className="grid grid-cols-4 gap-2">
        <InfoCard icon="🔢" label="Now Serving" value="T-042" />
        <InfoCard icon="⏳" label="Waiting" value="8" />
        <InfoCard icon="✅" label="Completed" value="34" />
        <InfoCard icon="⏱" label="Avg Wait" value="12 min" />
      </div>
    </ScreenMockup>
    <SubSection title="Queue Management">
      <FeatureList items={[
        "Auto-token assignment on check-in — sequential per department per day",
        "Doctor calls next patient → Token number displayed on TV screen",
        "Multi-department queue display on wall-mounted screens",
        "Sound alert + voice announcement when token is called",
        "Skip, recall, and transfer tokens between queues",
      ]} />
    </SubSection>
    <SubSection title="Display Configuration">
      <FeatureList items={[
        "Public URL for TV displays — no login required",
        "Configure per-branch, per-department, or combined view",
        "Multi-language display (English, Arabic, Urdu)",
        "Custom branding — logo, colors, scrolling announcements",
        "Emergency banner overlay for critical notifications",
      ]} />
    </SubSection>
    <TipBox title="Kiosk Integration">Self-service kiosks can print token receipts with QR code. Patients scan QR to track their position in queue on mobile.</TipBox>
  </DocPageWrapper>
);
