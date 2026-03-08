import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocCharges = () => (
  <DocPageWrapper pageNumber={7} totalPages={8} moduleTitle="IPD Module Guide">
    <SectionTitle icon="💰" title="Room Charges & Consumables" subtitle="Automated daily charges, consumable tracking, and interim billing" />
    <SubSection title="Daily Room Charges">
      <MockupTable headers={["Charge Type", "Rate", "Frequency", "Auto"]} rows={[
        ["Room Rent", "Per bed type/day", "Daily midnight", "✅"],
        ["Nursing Fee", "Per ward type/day", "Daily midnight", "✅"],
        ["Doctor Visit", "Per round recorded", "Per event", "✅"],
        ["Oxygen Supply", "Per hour of use", "Per event", "Manual"],
        ["IV Fluids", "Per unit", "Per event", "Manual"],
      ]} />
    </SubSection>
    <SubSection title="Consumable Tracking">
      <FeatureList items={[
        "Nurse logs consumables used per patient per shift",
        "Auto-deduction from pharmacy/inventory stock",
        "Categories: Medications, IV supplies, wound care, surgical consumables",
        "Barcode scanning for quick item entry",
        "Running total visible to billing team in real-time",
      ]} />
    </SubSection>
    <SubSection title="Interim Billing">
      <FeatureList items={[
        "View running bill at any time during admission",
        "Interim invoice generation for long-stay patients",
        "Deposit tracking — Alert when charges approach deposit amount",
        "Insurance pre-auth limit monitoring with alerts",
        "Additional deposit request workflow with receipt",
      ]} />
    </SubSection>
    <TipBox title="Bed Charges Start">Room charges begin from bed_charges_start_at timestamp, which can differ from admission time (e.g., if patient was in ER before ward transfer).</TipBox>
  </DocPageWrapper>
);
