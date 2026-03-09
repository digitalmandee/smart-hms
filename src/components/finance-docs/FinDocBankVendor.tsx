import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocBankVendor = () => (
  <DocPageWrapper pageNumber={14} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="🏦" title="Bank Accounts & Vendor Payments" subtitle="Bank account management, vendor payment workflows, and bank reconciliation" />
    <SubSection title="Bank Account Management">
      <MockupTable headers={["Field", "Description", "Required"]} rows={[
        ["Bank Name", "Name of the banking institution", "Yes"],
        ["Account Number", "Bank account number", "Yes"],
        ["Account Type", "Current, Savings, or Fixed Deposit", "Yes"],
        ["IBAN / SWIFT", "International banking identifiers", "Optional"],
        ["Linked GL Account", "Maps to Chart of Accounts (e.g., 1112 — Bank Account)", "Yes"],
        ["Opening Balance", "Starting balance for reconciliation baseline", "Yes"],
        ["Default Account", "Primary account for auto-payment routing", "Optional"],
      ]} />
    </SubSection>
    <SubSection title="Vendor Payment Workflow">
      <StepList steps={[
        "Purchase Order raised by department → approved by finance",
        "Goods/services received → GRN (Goods Received Note) created in warehouse",
        "Vendor invoice recorded → matched against PO and GRN (3-way match)",
        "Payment scheduled based on vendor payment terms (Net 30, Net 60, etc.)",
        "Payment approved → Auto-journal: DR Accounts Payable · CR Bank/Cash",
        "Payment reference (cheque #, transfer ID) recorded for reconciliation",
        "Vendor balance updated — reflected in AP aging report",
      ]} />
    </SubSection>
    <SubSection title="Bank Reconciliation">
      <FeatureList items={[
        "Import bank statement — Upload CSV or manually enter transactions",
        "Auto-matching — System matches bank transactions to journal entries by amount and date",
        "Manual matching — Drag-and-drop unmatched items for manual reconciliation",
        "Reconciliation status — Matched, Unmatched, Partially Matched indicators",
        "Adjusted balance calculation — Book balance ± adjustments = Bank balance",
        "Reconciliation report — Printable summary of matched and outstanding items",
        "Historical reconciliations — View past reconciliation records by period",
      ]} />
    </SubSection>
    <SubSection title="Payment Methods">
      <FeatureList items={[
        "Bank transfer — Direct transfer with reference tracking",
        "Cheque payment — Cheque number, date, and clearance tracking",
        "Cash payment — Linked to billing session for daily closing",
        "Standing orders — Recurring vendor payments auto-scheduled",
        "Multi-currency support — Record payments in vendor's currency with exchange rate",
      ]} />
    </SubSection>
    <TipBox title="3-Way Matching">The system enforces PO → GRN → Invoice matching before vendor payment approval — preventing payment for undelivered or unauthorized goods.</TipBox>
  </DocPageWrapper>
);
