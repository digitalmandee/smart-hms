import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const WhDocPicking = () => (
  <DocPageWrapper pageNumber={5} totalPages={7} moduleTitle="Warehouse Module Guide">
    <SectionTitle icon="📋" title="Picking, Packing & Shipping" subtitle="Order fulfillment from pick list generation to dispatch" />
    <SubSection title="Picking Workflow">
      <StepList steps={[
        "Warehouse order received → System generates pick list",
        "Pick list sorted by zone for optimal walking path",
        "Picker scans bin barcode → Confirms correct location",
        "Scans item barcode → Confirms correct item and quantity",
        "Partial picks handled — Backorder for unavailable items",
        "Pick completed → Moves to packing station",
      ]} />
    </SubSection>
    <SubSection title="Packing & Shipping">
      <MockupTable headers={["Step", "Action", "Document"]} rows={[
        ["Pack", "Items packed into shipping containers", "Packing Slip"],
        ["Label", "Shipping labels generated with barcode", "Shipping Label"],
        ["Weigh", "Package weighed for carrier rate", "Weight Log"],
        ["Dispatch", "Handed to carrier at dock", "Delivery Note"],
        ["Track", "Tracking number linked to order", "Shipment Record"],
      ]} />
    </SubSection>
    <SubSection title="Picking Strategies">
      <FeatureList items={[
        "Single Order Pick — One order at a time (small volume)",
        "Batch Pick — Multiple orders combined for efficiency",
        "Zone Pick — Pickers assigned to specific warehouse zones",
        "Wave Pick — Timed releases of pick lists for workflow control",
        "Priority picking for STAT/urgent orders",
        "Mobile scanner app for hands-free picking with barcode validation",
      ]} />
    </SubSection>
    <TipBox title="Dispatch Dashboard">Real-time dispatch board shows outgoing shipments, carrier assignments, and delivery status with tracking links.</TipBox>
  </DocPageWrapper>
);
