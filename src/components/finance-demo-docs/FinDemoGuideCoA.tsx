import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideCoA = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={3} totalPages={totalPages}>
    <SectionTitle icon="📊" title="Chart of Accounts Flow" subtitle="4-Level Account Hierarchy System" />

    <SubSection title="Account Hierarchy Levels">
      <MockupTable
        headers={["Level", "Type", "Example", "Postable?"]}
        rows={[
          ["Level 1", "Category Header", "Assets", "No"],
          ["Level 2", "Group Header", "Current Assets", "No"],
          ["Level 3", "Sub-Group Header", "Cash & Bank", "No"],
          ["Level 4", "Posting Account", "Cash in Hand (1000)", "Yes ✅"],
        ]}
      />
    </SubSection>

    <SubSection title="Account Categories">
      <FeatureList items={[
        "Assets — Cash, Bank, Receivables, Inventory, Fixed Assets, Prepaid",
        "Liabilities — Payables, Accruals, Tax Liabilities, Patient Deposits",
        "Equity — Owner's Capital, Retained Earnings",
        "Revenue — OPD, IPD, Emergency, Lab, Pharmacy, Ancillary",
        "Expenses — Salaries, Clinical, Operating, Administrative, Depreciation",
      ]} />
    </SubSection>

    <SubSection title="How It Works">
      <FeatureList items={[
        "Only Level 4 accounts accept journal postings — enforced by check_posting_account trigger",
        "Header accounts (Levels 1-3) aggregate child balances for reporting",
        "System accounts (auto-created by triggers) are protected from deletion",
        "Each account links to an account_type for correct debit/credit normal behavior",
        "Balance Sheet = Assets - (Liabilities + Equity) must equal zero",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/chart-of-accounts to see the full tree view with expand/collapse. Click any Level 4 account to view its ledger history.
    </TipBox>
  </DocPageWrapper>
);
