import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const WhDocReceiving = () => (
  <DocPageWrapper pageNumber={4} totalPages={7} moduleTitle="Warehouse Module Guide">
    <SectionTitle icon="📦" title="Receiving — GRN, QC & Put-Away" subtitle="Goods receipt, quality inspection, and bin assignment workflow" />
    <SubSection title="GRN (Goods Received Note)">
      <StepList steps={[
        "PO created by procurement → Vendor ships goods",
        "Warehouse receives delivery at dock → Log in Gate Register",
        "Create GRN against PO — Scan items, verify quantities",
        "Record batch numbers, expiry dates, serial numbers",
        "Photo documentation of delivery condition",
        "GRN approved → Stock added to inventory",
      ]} />
    </SubSection>
    <SubSection title="Quality Control">
      <MockupTable headers={["QC Action", "Result", "Next Step"]} rows={[
        ["Pass", "✅ Accepted", "Move to put-away queue"],
        ["Fail", "❌ Rejected", "Create RTV (Return to Vendor)"],
        ["Quarantine", "🟡 Hold", "Pending further inspection"],
      ]} />
    </SubSection>
    <SubSection title="Put-Away">
      <FeatureList items={[
        "System suggests optimal bin location based on item category",
        "Barcode scan to confirm bin placement",
        "Zone/Aisle/Rack/Bin hierarchy for precise location",
        "FEFO/FIFO placement rules for expiry management",
        "Put-away task list for warehouse staff with mobile scanning",
        "Confirmation scan at destination bin completes the task",
      ]} />
    </SubSection>
    <TipBox title="Dock Scheduling">Schedule vendor deliveries at specific dock doors and time slots to prevent congestion and optimize receiving capacity.</TipBox>
  </DocPageWrapper>
);
