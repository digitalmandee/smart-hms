import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DentDocTreatment = () => (
  <DocPageWrapper pageNumber={5} totalPages={7} moduleTitle="Dental Module">
    <SectionTitle icon="📋" title="Treatment Plans" subtitle="Multi-visit treatment planning with cost estimation" />
    <SubSection title="Creating a Treatment Plan">
      <StepList steps={["From patient chart, click 'New Treatment Plan'","Select teeth and conditions requiring treatment","Choose procedures for each tooth","System auto-calculates cost per procedure and total","Set priority order and group into visits","Present plan to patient with printable estimate"]} />
    </SubSection>
    <SubSection title="Plan Management">
      <FeatureList items={["Multiple active plans per patient (e.g., Phase 1: urgent, Phase 2: cosmetic)","Status tracking: Planned → In Progress → Completed","Insurance pre-authorization integration per procedure","Patient consent capture with digital signature","Auto-link completed procedures to billing"]} />
    </SubSection>
    <SubSection title="Treatment Plan Summary">
      <MockupTable headers={["Tooth", "Procedure", "Surfaces", "Cost", "Status"]} rows={[["36","Composite Filling","MOD","SAR 350","Completed"],["46","Root Canal + Crown","All","SAR 3,200","In Progress"],["11","Veneer","Labial","SAR 2,500","Planned"],["24","Extraction","—","SAR 200","Planned"]]} />
    </SubSection>
    <TipBox title="Smart Suggestions">Based on charted conditions, system suggests recommended procedures with evidence-based protocols.</TipBox>
  </DocPageWrapper>
);
