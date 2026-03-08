import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const FinDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={7} moduleTitle="Finance Module Guide">
    <SectionTitle icon="🔄" title="Finance Process Flow" subtitle="Revenue cycle and accounting workflow" />
    <ProcessFlow steps={[
      { icon: "🏥", title: "Service Delivery", desc: "Patient receives service (consultation, lab, pharmacy, procedure). Charges auto-captured from each department module." },
      { icon: "🧾", title: "Invoice Generation", desc: "System consolidates all charges into a single invoice. Insurance eligibility checked. ZATCA e-invoice generated for KSA." },
      { icon: "💳", title: "Payment Collection", desc: "Cashier collects payment via cash, card, bank transfer, or insurance. Split payments and partial payments supported." },
      { icon: "📒", title: "Journal Entry", desc: "Auto-generated double-entry journal posted: Debit Cash/Bank, Credit Revenue accounts. Mapped to 4-level chart of accounts." },
      { icon: "🔒", title: "Daily Closing", desc: "End-of-day cash reconciliation. Day-close report generated. Cashier variance tracked. All transactions locked for the period." },
      { icon: "📊", title: "Monthly P&L & Reports", desc: "Automated Profit & Loss, Balance Sheet, and Cash Flow statements. Department-wise and branch-wise breakdowns available." },
      { icon: "✅", title: "Bank Reconciliation", desc: "Bank statement imported and matched against system transactions. Unmatched items flagged for investigation and adjustment." },
    ]} />
  </DocPageWrapper>
);
