import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocJournals = () => (
  <DocPageWrapper pageNumber={5} totalPages={7} moduleTitle="Finance Module Guide">
    <SectionTitle icon="📒" title="Journal Entries & Auto-Triggers" subtitle="Double-entry bookkeeping with automated journal posting from all modules" />
    <SubSection title="Auto-Generated Journals">
      <MockupTable headers={["Trigger Event", "Debit", "Credit", "Status"]} rows={[
        ["Invoice Created", "Accounts Receivable", "Service Revenue", "✅ Active"],
        ["Payment Received", "Cash / Bank", "Accounts Receivable", "✅ Active"],
        ["POS Sale", "Cash / Bank", "Pharmacy Revenue", "✅ Active"],
        ["Payroll Processed", "Salary Expense", "Cash / Bank", "✅ Active"],
        ["Expense Recorded", "Expense Account", "Cash / AP", "✅ Active"],
        ["Vendor Payment", "Accounts Payable", "Cash / Bank", "✅ Active"],
        ["Stock Write-off", "Write-off Expense", "Inventory", "✅ Active"],
        ["Donation Received", "Cash / Bank", "Donation Revenue", "✅ Active"],
        ["Shipping Charge", "Shipping Expense", "Cash / AP", "✅ Active"],
      ]} />
    </SubSection>
    <SubSection title="Manual Journal Entry">
      <FeatureList items={[
        "Create manual adjusting entries for non-routine transactions",
        "Multi-line entries — Unlimited debit/credit lines per entry",
        "Entry must balance — System rejects unbalanced journals",
        "Reference number and description fields for audit trail",
        "Attachment support — Upload supporting documents",
        "Reversal entries — One-click reversal of posted entries",
        "Draft → Posted → Reversed lifecycle with status tracking",
      ]} />
    </SubSection>
    <SubSection title="Audit Trail">
      <FeatureList items={[
        "Every journal entry records: Created by, Date, Time, Source module",
        "Source reference links back to originating transaction (invoice, payment, etc.)",
        "Immutable — Posted entries cannot be edited, only reversed",
        "Exportable audit log for external auditors",
      ]} />
    </SubSection>
    <TipBox title="9 Auto-Triggers">All 9 revenue/expense channels auto-post to the general ledger — zero manual bookkeeping for routine operations.</TipBox>
  </DocPageWrapper>
);
