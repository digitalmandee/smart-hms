import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "./DocPageWrapper";
import { RotateCcw } from "lucide-react";

export const DocReturns = () => (
  <DocPageWrapper pageNumber={12} totalPages={18}>
    <SectionTitle
      icon={<RotateCcw className="w-5 h-5" />}
      title="Returns & Refunds"
      subtitle="Process partial or full returns with automatic inventory restocking"
    />

    <SubSection title="Initiating a Return">
      <StepList steps={[
        "Navigate to Pharmacy → Returns from the sidebar",
        "Search for the original transaction by receipt number",
        "System displays the full transaction with all line items",
        "Select individual items to return (partial) or select all (full return)",
        "Enter the return quantity for each selected item",
        "Provide a return reason: Defective, Wrong Item, Patient Request, Expired, Other",
        "Choose refund method: Cash Refund or Patient Credit",
        "Confirm the return to process",
      ]} />
    </SubSection>

    <SubSection title="Refund Methods">
      <FeatureList items={[
        "Cash Refund — Immediate cash refund recorded against the POS session",
        "Patient Credit — Amount credited to the patient's profile balance",
        "Credit can be used to offset future purchases or billing charges",
        "Refund amount calculated based on the original selling price",
      ]} />
    </SubSection>

    <SubSection title="Automatic Inventory Restocking">
      <FeatureList items={[
        "Returned items are automatically added back to inventory",
        "Original batch information is preserved for accurate stock tracking",
        "Stock movement entry created with type 'Return' for audit trail",
        "FEFO integrity maintained — returned batches retain original expiry dates",
      ]} />
    </SubSection>

    <SubSection title="Returns Tracking">
      <FeatureList items={[
        "Each return assigned a unique number: RET-XXXX",
        "Returns list with filters: date range, status, refund method",
        "Linked to original transaction for complete traceability",
        "Return receipt available for patient and pharmacy records",
      ]} />
    </SubSection>

    <TipBox title="Return Policy">
      Configure your return window and conditions in the receipt footer settings. The system does not enforce a return window — this is left to your pharmacy's operational policy.
    </TipBox>
  </DocPageWrapper>
);
