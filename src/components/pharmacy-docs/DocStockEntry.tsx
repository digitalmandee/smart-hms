import { DocPageWrapper, SectionTitle, StepList, SubSection, TipBox, FeatureList } from "./DocPageWrapper";

export const DocStockEntry = () => (
  <DocPageWrapper pageNumber={6} totalPages={18}>
    <SectionTitle
      icon="📥"
      title="Stock Entry (GRN)"
      subtitle="Goods Received Note — record incoming stock with batch and pricing details"
    />

    <SubSection title="Creating a Stock Entry">
      <StepList steps={[
        "Navigate to Pharmacy → Add Stock from the sidebar or dashboard quick action",
        "Select the Medicine from the searchable dropdown",
        "Enter Batch Number (e.g., BN-2024-001) for traceability",
        "Set Expiry Date — required for FEFO dispensing logic",
        "Enter Quantity received from the supplier",
        "Enter Unit Price (purchase cost) and Selling Price (retail price)",
        "Optionally assign a Supplier from the vendor list",
        "Optionally link to an existing Purchase Order (PO)",
        "Click 'Save' to add stock to inventory immediately",
      ]} />
    </SubSection>

    <SubSection title="Supplier Assignment">
      <FeatureList items={[
        "Select from pre-configured supplier/vendor list",
        "Supplier details (name, contact, payment terms) auto-populate",
        "Links stock entry to supplier for procurement reporting",
        "Enables Accounts Payable tracking when integrated with Finance module",
      ]} />
    </SubSection>

    <SubSection title="Purchase Order Linking">
      <FeatureList items={[
        "Link GRN to an existing Purchase Order for order fulfillment tracking",
        "PO quantities update automatically upon GRN confirmation",
        "Partial deliveries supported — PO remains open until fully received",
        "Invoice matching available for 3-way verification (PO → GRN → Invoice)",
      ]} />
    </SubSection>

    <TipBox title="Stock Movement Record">
      Every GRN automatically creates a 'GRN' type entry in the Stock Movements log with full batch, quantity, and price details for complete audit trail.
    </TipBox>
  </DocPageWrapper>
);
