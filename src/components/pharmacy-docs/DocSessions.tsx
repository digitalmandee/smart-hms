import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "./DocPageWrapper";
import { Clock } from "lucide-react";

export const DocSessions = () => (
  <DocPageWrapper pageNumber={10} totalPages={18}>
    <SectionTitle
      icon={<Clock className="w-5 h-5" />}
      title="POS Sessions & Transaction History"
      subtitle="Daily session management, transaction tracking, and receipt reprinting"
    />

    <SubSection title="Session Management">
      <StepList steps={[
        "Open a new session at the start of each shift with opening cash balance",
        "All POS transactions within the shift are linked to the active session",
        "Close session at end of shift — enter actual cash count for reconciliation",
        "System calculates expected vs. actual cash and flags discrepancies",
        "Session summary shows total sales, refunds, and payment method breakdown",
      ]} />
    </SubSection>

    <SubSection title="Transaction Listing">
      <FeatureList items={[
        "View all transactions with date/time, receipt number, and total amount",
        "Filter by Date Range to view specific periods",
        "Filter by Status: Completed, Refunded, Partially Refunded, Voided",
        "Filter by Payment Method: Cash, Card, Mobile Wallet, Credit",
        "Search by receipt number or patient name for quick lookup",
      ]} />
    </SubSection>

    <SubSection title="Transaction Detail View">
      <FeatureList items={[
        "Full itemized breakdown: medicine, quantity, unit price, line total",
        "Applied discounts and tax amounts per line and overall",
        "Payment details: method, amount received, change given",
        "Patient and cashier information",
        "Linked prescription reference (if applicable)",
        "Timestamp and session information",
      ]} />
    </SubSection>

    <SubSection title="Receipt Reprint">
      <FeatureList items={[
        "Reprint any historical receipt from the transaction detail page",
        "Receipt format matches the original with current header/footer settings",
        "Useful for patient insurance claims and record-keeping",
      ]} />
    </SubSection>

    <TipBox title="Daily Reconciliation">
      Close your POS session at the end of every shift. The cash difference report helps identify discrepancies early and maintains financial accountability.
    </TipBox>
  </DocPageWrapper>
);
