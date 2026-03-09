import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocArAp = () => (
  <DocPageWrapper pageNumber={11} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="📋" title="Accounts Receivable & Accounts Payable" subtitle="Aging analysis, payment tracking, and vendor management for complete cash flow visibility" />
    <SubSection title="Accounts Receivable (AR)">
      <MockupTable headers={["Aging Bucket", "Description", "Action"]} rows={[
        ["Current (0-30 days)", "Recently invoiced, within payment terms", "Monitor"],
        ["31-60 days", "Past initial due date, first follow-up", "Send reminder"],
        ["61-90 days", "Significantly overdue, escalation required", "Collection call"],
        ["90+ days", "High risk of bad debt, legal/write-off consideration", "Write-off review"],
      ]} />
    </SubSection>
    <SubSection title="AR Features">
      <FeatureList items={[
        "Patient receivables — Outstanding balances from partially paid invoices",
        "Insurance receivables — Approved claims awaiting insurer payment",
        "Corporate receivables — Credit accounts for corporate/government clients",
        "Aging report with drill-down — Click any bucket to see individual invoices",
        "Payment reminders — Auto-generate reminder letters/SMS for overdue accounts",
        "Bad debt write-off — Workflow with approval and journal entry (DR Bad Debt · CR AR)",
        "Payment plan setup — Split overdue balance into installment schedule",
      ]} />
    </SubSection>
    <SubSection title="Accounts Payable (AP)">
      <FeatureList items={[
        "Vendor invoices — Auto-created from Goods Received Notes (GRN) in warehouse",
        "AP aging — Track payables by vendor with 30/60/90 day buckets",
        "Payment scheduling — Plan vendor payments based on cash flow and due dates",
        "Partial payments — Pay vendor invoices in installments with running balance",
        "Vendor statement reconciliation — Match vendor statements with system records",
        "Purchase order to payment lifecycle — PO → GRN → Vendor Invoice → Payment",
        "Early payment discount tracking — Record and apply vendor discount terms",
      ]} />
    </SubSection>
    <SubSection title="AP Journal Entries">
      <MockupTable headers={["Event", "Debit", "Credit"]} rows={[
        ["GRN Received", "Inventory / Expense", "Accounts Payable"],
        ["Vendor Payment", "Accounts Payable", "Cash / Bank"],
        ["Payment Discount", "Accounts Payable", "Discount Revenue"],
        ["Debit Note", "Accounts Payable", "Purchase Returns"],
      ]} />
    </SubSection>
    <TipBox title="Cash Flow Impact">AR and AP aging reports feed directly into the Cash Flow Statement — giving management real-time visibility into expected inflows and required outflows.</TipBox>
  </DocPageWrapper>
);
