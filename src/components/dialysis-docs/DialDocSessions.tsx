import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DialDocSessions = () => (
  <DocPageWrapper pageNumber={4} totalPages={6} module="Dialysis Center">
    <SectionTitle icon="💉" title="Session Workflow" subtitle="Pre-dialysis → intra-dialysis monitoring → post-dialysis" />
    <SubSection title="Pre-Dialysis">
      <StepList steps={[
        "Nurse selects patient from today's schedule",
        "Record pre-weight, sitting/standing BP, temperature, pulse",
        "Verify vascular access — inspect for signs of infection",
        "Set target UF (ultrafiltration) based on weight gain",
        "Assign machine and chair — system shows availability",
        "Confirm dialyzer type and blood flow rate"
      ]} />
    </SubSection>
    <SubSection title="Intra-Dialysis Monitoring">
      <FeatureList items={[
        "Vitals recorded every 30 minutes: BP, pulse, UF rate",
        "Real-time vitals chart with trend visualization",
        "BP alert: automatic flag if systolic drops below threshold",
        "Heparin dose tracking with timed administration",
        "Complications log: cramps, hypotension, nausea, clotting",
        "Nurse notes with timestamped entries"
      ]} />
    </SubSection>
    <SubSection title="Post-Dialysis">
      <MockupTable headers={["Step", "Detail"]} rows={[
        ["Post-Weight", "Record weight — system calculates actual UF"],
        ["Post-Vitals", "Standing and sitting BP, temperature"],
        ["Access Care", "Hemostasis time, bandaging notes"],
        ["Session Summary", "Duration, actual UF, complications, Kt/V"],
        ["Next Session", "Confirm or reschedule next appointment"],
      ]} />
    </SubSection>
    <TipBox title="Emergency Protocol">If BP drops critically, system triggers emergency alert with one-click access to emergency medication orders.</TipBox>
  </DocPageWrapper>
);
