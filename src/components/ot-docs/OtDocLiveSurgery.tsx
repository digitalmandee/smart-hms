import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OtDocLiveSurgery = () => (
  <DocPageWrapper pageNumber={7} totalPages={8} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="🔬" title="Live Surgery — Monitoring & Instruments" subtitle="Intra-operative tracking, instrument counts, and consumable logging" />
    <SubSection title="Live Surgery Dashboard">
      <FeatureList items={[
        "Real-time surgery timer — Incision to close tracking",
        "Team members on screen — Surgeon, assistant, anesthetist, nurses",
        "Vitals feed from anesthesia monitoring",
        "Instrument count status — Pre/post procedure verification",
        "Consumable logging with barcode scanning",
        "Specimen collection and labeling",
      ]} />
    </SubSection>
    <SubSection title="Instrument Count">
      <StepList steps={[
        "Pre-op count — Scrub nurse counts all instruments, sponges, needles",
        "Record count in system with instrument set template",
        "Additional items opened during surgery logged separately",
        "Final count before closure — Must match pre-op count",
        "Discrepancy alert — Mandatory X-ray before closure if count doesn't match",
      ]} />
    </SubSection>
    <SubSection title="Operative Notes">
      <MockupTable headers={["Section", "Content"]} rows={[
        ["Procedure", "Name and CPT/ACHI code"],
        ["Incision", "Type, site, time"],
        ["Findings", "Intra-operative findings"],
        ["Technique", "Step-by-step surgical technique"],
        ["Specimens", "Tissue sent for pathology"],
        ["Complications", "Any intra-op complications"],
        ["Closure", "Closure technique, drains placed"],
        ["Estimated Blood Loss", "In milliliters"],
      ]} />
    </SubSection>
    <TipBox title="Surgical Consumables">All consumables used during surgery are auto-charged to the patient's IPD bill and deducted from inventory.</TipBox>
  </DocPageWrapper>
);
