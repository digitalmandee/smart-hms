import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const LabDocOrders = () => (
  <DocPageWrapper pageNumber={4} totalPages={6} moduleTitle="Laboratory Module Guide">
    <SectionTitle icon="🧪" title="Order Reception & Sample Collection" subtitle="From doctor order to specimen accessioning and barcode labeling" />
    <SubSection title="Order Sources">
      <FeatureList items={[
        "OPD consultation — Doctor places lab order during visit",
        "IPD rounds — Attending physician orders from ward",
        "Emergency — STAT orders with priority flag",
        "Direct walk-in — Patient brings external lab request",
        "Recurring orders — Auto-generated for dialysis/chronic patients",
      ]} />
    </SubSection>
    <SubSection title="Sample Collection Workflow">
      <StepList steps={[
        "Lab receives order → Appears in Lab Queue with patient details",
        "Print barcode labels — Unique label per specimen tube",
        "Collect specimen — Record collector name, time, site",
        "Verify patient identity — Scan wristband or confirm MRN",
        "Accession sample — Mark as received in system",
        "Transport to analyzer or manual bench",
      ]} />
    </SubSection>
    <SubSection title="Order Priority">
      <MockupTable headers={["Priority", "TAT Target", "Color Code"]} rows={[
        ["Routine", "24 hours", "🔵 Blue"],
        ["Urgent", "4 hours", "🟡 Yellow"],
        ["STAT", "1 hour", "🔴 Red"],
        ["Pre-Op", "Same day", "🟠 Orange"],
      ]} />
    </SubSection>
    <TipBox title="Analyzer Integration">Configure LIS-analyzer interfaces (HL7/ASTM) to auto-receive results from connected lab equipment.</TipBox>
  </DocPageWrapper>
);
