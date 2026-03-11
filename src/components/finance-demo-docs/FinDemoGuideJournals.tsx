import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideJournals = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={4} totalPages={totalPages}>
    <SectionTitle icon="📝" title="Journal Entry Flow" subtitle="Manual & Automated GL Posting" />

    <SubSection title="Manual Entry Lifecycle">
      <div className="flex items-center gap-2 text-sm mb-3">
        {["Draft", "→", "Posted", "→", "Reversed (optional)"].map((s, i) => (
          <span key={i} className={i % 2 === 0 ? "bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium" : "text-gray-400"}>
            {s}
          </span>
        ))}
      </div>
      <FeatureList items={[
        "All entries must balance (Total Debits = Total Credits) — validated before posting",
        "Only Level 4 posting accounts accepted — header accounts blocked by trigger",
        "Posted entries update account balances in real-time via update_account_balance trigger",
        "Reversed entries create a mirror entry and mark original as reversed",
      ]} />
    </SubSection>

    <SubSection title="9 Auto-Posting Triggers">
      <MockupTable
        headers={["Event", "Debit Account", "Credit Account"]}
        rows={[
          ["Invoice Created", "Accounts Receivable", "Revenue"],
          ["Payment Received", "Cash / Bank", "Accounts Receivable"],
          ["Expense Recorded", "Expense Category", "Cash / Bank"],
          ["Payroll Processed", "Salaries & Wages", "Cash / Bank"],
          ["POS Sale", "Cash", "Pharmacy Revenue"],
          ["Vendor Payment", "Accounts Payable", "Cash / Bank"],
          ["Stock Write-off", "Inventory Write-off", "Inventory Asset"],
          ["Donation Received", "Cash / Bank", "Donation Revenue"],
          ["Shipment Dispatched", "Shipping Expense", "Cash / Bank"],
        ]}
      />
    </SubSection>

    <TipBox title="Key Validation Rules">
      Every auto-trigger uses get_or_create_default_account() to ensure required accounts exist. If a Level 4 posting account is missing, it's auto-created under the correct category.
    </TipBox>
  </DocPageWrapper>
);
