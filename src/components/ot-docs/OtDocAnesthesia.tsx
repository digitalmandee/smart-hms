import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OtDocAnesthesia = () => (
  <DocPageWrapper pageNumber={5} totalPages={7} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="💉" title="Anesthesia Planning & Record" subtitle="Complete anesthesia documentation from induction to recovery" />
    <SubSection title="Anesthesia Types">
      <MockupTable headers={["Type", "Use Case", "Documentation"]} rows={[
        ["General", "Major surgery", "Induction, maintenance, intubation details"],
        ["Regional — Spinal", "Lower body", "Level, agent, dose"],
        ["Regional — Epidural", "Labor, post-op pain", "Catheter site, infusion rate"],
        ["Local", "Minor procedures", "Agent, volume, site"],
        ["Sedation", "Endoscopy, MRI", "Agent, depth monitoring"],
      ]} />
    </SubSection>
    <SubSection title="Anesthesia Record Contents">
      <FeatureList items={[
        "Pre-anesthesia assessment — Airway, allergies, medications, last meal",
        "Induction agents and doses with timestamp",
        "Intubation details — Grade, tube size, attempts, device type",
        "Maintenance — Agent, flow rates, muscle relaxants",
        "Vitals log — BP, HR, SpO2, EtCO2 at regular intervals",
        "Fluid balance — IV input, blood products, urine output",
        "Blood loss estimation with transfusion record",
        "Intra-op events — Complications, interventions, medications given",
        "Reversal agents and extubation time",
      ]} />
    </SubSection>
    <SubSection title="Post-Anesthesia">
      <FeatureList items={[
        "Recovery score (Aldrete) at 5-min intervals in PACU",
        "Pain assessment and analgesic plan",
        "Discharge criteria from PACU to ward",
        "Handover notes to ward nursing team",
      ]} />
    </SubSection>
    <TipBox title="Anesthesia Dashboard">Dedicated anesthesia dashboard shows today's cases, pending pre-assessments, and active PACU patients.</TipBox>
  </DocPageWrapper>
);
