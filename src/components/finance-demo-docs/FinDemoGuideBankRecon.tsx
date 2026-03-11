import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideBankRecon = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={9} totalPages={totalPages}>
    <SectionTitle icon="🏦" title="Bank Reconciliation Flow" subtitle="CSV Import & Auto-Match Engine" />

    <SubSection title="Reconciliation Process">
      <StepList steps={[
        "Select bank account from the dropdown",
        "Upload bank statement CSV file (columns: date, description, debit, credit, balance)",
        "System auto-parses CSV and creates bank_transactions records",
        "Auto-match engine pairs statement rows with system transactions (by amount + date range)",
        "Matched items marked as 'reconciled' — unmatched items highlighted for manual review",
        "Manual reconciliation: click an unmatched statement row → link to a journal entry",
        "Final reconciliation summary shows: matched count, unmatched items, bank vs book balance",
      ]} />
    </SubSection>

    <SubSection title="Auto-Match Criteria">
      <FeatureList items={[
        "Amount match: exact match within ±0.01 tolerance",
        "Date match: within 3-day window (bank processing delay)",
        "Reference match: checks reference_number field for additional confidence",
        "Priority: exact amount + exact date > amount + date range > partial match",
      ]} />
    </SubSection>

    <SubSection title="Bank Account Management">
      <FeatureList items={[
        "Multiple bank accounts supported (current, savings, collection)",
        "Each bank account linked to a GL account for auto-posting",
        "Opening balance tracked with running balance updates",
        "SWIFT/IFSC codes for international transfers",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/bank-reconciliation. Select a bank account and use the CSV upload feature to demonstrate the auto-matching capability.
    </TipBox>
  </DocPageWrapper>
);
