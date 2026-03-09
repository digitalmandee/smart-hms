import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocExpenses = () => (
  <DocPageWrapper pageNumber={10} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="💸" title="Expense Management" subtitle="Category-based expense recording with approval workflows and auto-journal posting" />
    <SubSection title="Expense Categories">
      <MockupTable headers={["Category", "Description", "Journal Entry"]} rows={[
        ["Petty Cash", "Small daily operational expenses", "DR Expense · CR Petty Cash"],
        ["Refund", "Patient refunds for overpayment or cancellation", "DR Refund Expense · CR Cash/Bank"],
        ["Staff Advance", "Salary advances to employees", "DR Advance Receivable · CR Cash"],
        ["Miscellaneous", "Other operational expenses not in above categories", "DR Misc Expense · CR Cash/AP"],
        ["Maintenance", "Equipment repair and facility maintenance", "DR Maintenance Expense · CR Cash/AP"],
        ["Utilities", "Electricity, water, internet, phone bills", "DR Utility Expense · CR Cash/Bank"],
      ]} />
    </SubSection>
    <SubSection title="Expense Recording Workflow">
      <StepList steps={[
        "Staff creates expense entry — selects category, enters amount, attaches receipt/document",
        "Expense linked to active billing session (if session-based) for daily closing reconciliation",
        "Auto-journal entry posted: Debit expense account, Credit cash or accounts payable",
        "Expense appears in daily closing wizard under 'Payouts' for net cash calculation",
        "Approval workflow triggered for expenses above configurable threshold",
        "Approved expenses reflected in P&L statement under respective expense categories",
      ]} />
    </SubSection>
    <SubSection title="Expense Features">
      <FeatureList items={[
        "Receipt attachment — Upload photos or scanned receipts for each expense",
        "Recurring expenses — Set up monthly recurring entries (rent, subscriptions)",
        "Department allocation — Assign expenses to specific departments for cost tracking",
        "Budget check — Warning when expense would exceed department budget allocation",
        "Approval levels — Configurable approval chain based on amount thresholds",
        "Expense reports — Monthly/quarterly summaries by category and department",
        "Tax deduction tracking — Mark expenses as tax-deductible with category codes",
        "Vendor linkage — Link expenses to vendor records for payables tracking",
      ]} />
    </SubSection>
    <TipBox title="Session Integration">Expenses recorded during an active billing session are automatically included in the daily closing cash reconciliation — ensuring accurate net cash calculation.</TipBox>
  </DocPageWrapper>
);
