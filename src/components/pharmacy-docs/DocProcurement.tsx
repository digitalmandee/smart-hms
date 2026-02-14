import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "./DocPageWrapper";

export const DocProcurement = () => (
  <DocPageWrapper pageNumber={15} totalPages={18}>
    <SectionTitle
      icon="📄"
      title="Procurement — PO & Suppliers"
      subtitle="End-to-end procurement lifecycle from vendor management to goods receipt"
    />

    <SubSection title="Supplier / Vendor Management">
      <FeatureList items={[
        "Maintain a vendor database with company name, contact, and payment terms",
        "Track supplier performance: delivery reliability, pricing consistency",
        "Assign preferred suppliers to specific medicine categories",
        "Supplier details auto-populate on Purchase Orders and GRN entries",
      ]} />
    </SubSection>

    <SubSection title="Purchase Order Lifecycle">
      <StepList steps={[
        "Create a new PO — select supplier, add medicine line items with quantities and rates",
        "Submit PO for approval (if approval workflow is enabled)",
        "Approved PO is sent to supplier (printable/downloadable format)",
        "Receive goods against the PO via GRN — partial deliveries supported",
        "PO auto-closes when all items are fully received",
        "Track PO status: Draft, Submitted, Approved, Partially Received, Completed, Cancelled",
      ]} />
    </SubSection>

    <SubSection title="GRN Processing & Invoice Matching">
      <FeatureList items={[
        "Create GRN linked to a Purchase Order for automated reconciliation",
        "3-way matching: PO quantity vs. GRN quantity vs. Supplier Invoice",
        "Discrepancy alerts for quantity or price mismatches",
        "Verified GRN auto-routes stock to the designated warehouse/store",
        "Accounts Payable entry created automatically for finance reconciliation",
      ]} />
    </SubSection>

    <SubSection title="Indent-to-PO Workflow">
      <FeatureList items={[
        "Sub-stores can raise indent/requisition requests for needed items",
        "Central procurement reviews indents and consolidates into Purchase Orders",
        "Indent status tracking: Requested, Approved, Ordered, Fulfilled",
        "Streamlines multi-store procurement and reduces duplicate ordering",
      ]} />
    </SubSection>

    <TipBox title="Reorder Automation">
      Use Low Stock alerts in combination with the procurement module. When a medicine hits its reorder level, quickly create a PO from the alert page with pre-filled quantities.
    </TipBox>
  </DocPageWrapper>
);
