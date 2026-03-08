import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const WhDocOps = () => (
  <DocPageWrapper pageNumber={6} totalPages={7} moduleTitle="Warehouse Module Guide">
    <SectionTitle icon="🔧" title="Operations — Cycle Count, RTV, Barcode" subtitle="Inventory accuracy, vendor returns, and barcode infrastructure" />
    <SubSection title="Cycle Count">
      <StepList steps={[
        "Schedule cycle count — By zone, category, or ABC classification",
        "Generate count sheets → Assign to warehouse staff",
        "Staff counts physical inventory and records quantities",
        "System compares physical vs system count",
        "Variances flagged for investigation",
        "Approved adjustments posted to inventory with audit trail",
      ]} />
    </SubSection>
    <SubSection title="Return to Vendor (RTV)">
      <MockupTable headers={["Reason", "Process", "Document"]} rows={[
        ["Defective", "QC fail → Create RTV → Vendor pickup", "RTV Note"],
        ["Expired", "Near-expiry items per vendor agreement", "RTV Note"],
        ["Excess", "Over-ordered items returned", "Credit Note"],
        ["Recalled", "Manufacturer recall → Isolate + return", "Recall RTV"],
      ]} />
    </SubSection>
    <SubSection title="Barcode Infrastructure">
      <FeatureList items={[
        "Label printing — Items, bins, racks, zones all barcoded",
        "Supported formats: Code 128, Code 39, EAN-13, QR Code",
        "USB/Bluetooth scanner configuration via setup wizard",
        "Scan-to-action: Scan item → View details, stock levels, movements",
        "GS1 barcode parsing for pharmaceutical track-and-trace (Tatmeen)",
        "Batch label printing from GRN and pick list screens",
      ]} />
    </SubSection>
    <TipBox title="ABC Analysis">Auto-classify items as A (high value), B (medium), C (low) based on consumption. A-items get more frequent cycle counts.</TipBox>
  </DocPageWrapper>
);
