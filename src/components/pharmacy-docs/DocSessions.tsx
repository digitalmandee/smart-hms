import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox, ScreenMockup } from "./DocPageWrapper";

export const DocSessions = () => (
  <DocPageWrapper pageNumber={10} totalPages={18}>
    <SectionTitle
      icon="⏱️"
      title="POS Sessions & Transaction History"
      subtitle="Daily session management, transaction tracking, and receipt reprinting"
    />

    <ScreenMockup title="Session Summary">
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="text-center border border-emerald-200 rounded p-2 bg-emerald-50/50">
          <p className="text-gray-500">Total Sales</p>
          <p className="text-sm font-bold text-emerald-700">24,580</p>
        </div>
        <div className="text-center border border-emerald-200 rounded p-2 bg-emerald-50/50">
          <p className="text-gray-500">Transactions</p>
          <p className="text-sm font-bold text-gray-900">38</p>
        </div>
        <div className="text-center border border-emerald-200 rounded p-2 bg-emerald-50/50">
          <p className="text-gray-500">Cash Diff.</p>
          <p className="text-sm font-bold text-green-600">0.00 ✓</p>
        </div>
      </div>
    </ScreenMockup>

    <SubSection title="Session Management">
      <StepList steps={[
        "Open a new session at the start of each shift with opening cash balance",
        "All POS transactions within the shift are linked to the active session",
        "Close session at end of shift — enter actual cash count for reconciliation",
        "System calculates expected vs. actual cash and flags discrepancies",
      ]} />
    </SubSection>

    <SubSection title="Transaction Listing">
      <FeatureList items={[
        "View all transactions with date/time, receipt number, and total amount",
        "Filter by Date Range, Status, and Payment Method",
        "Search by receipt number or patient name for quick lookup",
      ]} />
    </SubSection>

    <SubSection title="Transaction Detail View">
      <FeatureList items={[
        "Full itemized breakdown: medicine, quantity, unit price, line total",
        "Applied discounts, tax amounts, payment details, and change given",
        "Patient and cashier info, linked prescription reference",
      ]} />
    </SubSection>

    <SubSection title="Receipt Reprint">
      <FeatureList items={[
        "Reprint any historical receipt from the transaction detail page",
        "Useful for patient insurance claims and record-keeping",
      ]} />
    </SubSection>

    <TipBox title="Daily Reconciliation">
      Close your POS session at the end of every shift. The cash difference report helps identify discrepancies early and maintains financial accountability.
    </TipBox>
  </DocPageWrapper>
);
