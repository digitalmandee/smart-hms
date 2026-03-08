import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocCoa = () => (
  <DocPageWrapper pageNumber={4} totalPages={7} moduleTitle="Finance Module Guide">
    <SectionTitle icon="📂" title="Chart of Accounts — 4-Level Hierarchy" subtitle="Structured account tree with account types, sub-accounts, and balances" />
    <SubSection title="Account Type Categories">
      <MockupTable headers={["Category", "Normal Balance", "Examples"]} rows={[
        ["Assets", "Debit", "Cash, Bank, Accounts Receivable, Inventory"],
        ["Liabilities", "Credit", "Accounts Payable, Loans, Accrued Expenses"],
        ["Equity", "Credit", "Owner's Equity, Retained Earnings"],
        ["Revenue", "Credit", "Service Revenue, Pharmacy Sales, Lab Revenue"],
        ["Expenses", "Debit", "Salaries, Rent, Utilities, Medical Supplies"],
      ]} />
    </SubSection>
    <SubSection title="Account Hierarchy">
      <MockupTable headers={["Level", "Example", "Type"]} rows={[
        ["1 — Category", "1000 — Assets", "Header"],
        ["2 — Group", "1100 — Current Assets", "Header"],
        ["3 — Sub-Group", "1110 — Cash & Bank", "Header"],
        ["4 — Ledger", "1111 — Petty Cash", "Posting Account"],
      ]} />
    </SubSection>
    <SubSection title="Account Features">
      <FeatureList items={[
        "System accounts — Auto-created for core operations (AR, AP, Revenue, COGS)",
        "Branch-level accounts — Separate ledgers per branch if needed",
        "Opening balance setup with date for initial migration",
        "Active/inactive toggle — Deactivate obsolete accounts",
        "Account drill-down — Click any account to see all journal entries",
        "Real-time current balance calculation from journal entries",
      ]} />
    </SubSection>
    <TipBox title="Auto-Setup">On organization creation, the system auto-seeds 50+ standard accounts covering healthcare operations — ready to use immediately.</TipBox>
  </DocPageWrapper>
);
