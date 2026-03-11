import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideDeposits = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={7} totalPages={totalPages}>
    <SectionTitle icon="💰" title="Patient Deposits Flow" subtitle="Advance Payment & Wallet System" />

    <SubSection title="Deposit Lifecycle">
      <div className="flex items-center gap-2 text-sm mb-3">
        {["Deposit", "→", "Applied", "→", "Refund (if balance)"].map((s, i) => (
          <span key={i} className={i % 2 === 0 ? "bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium" : "text-gray-400"}>
            {s}
          </span>
        ))}
      </div>
    </SubSection>

    <SubSection title="Deposit Accounting">
      <MockupTable
        headers={["Action", "Debit", "Credit", "Effect"]}
        rows={[
          ["Receive Deposit", "Cash / Bank", "Patient Deposits (2400)", "Liability increases"],
          ["Apply to Invoice", "Patient Deposits (2400)", "Accounts Receivable", "Liability decreases"],
          ["Refund Deposit", "Patient Deposits (2400)", "Cash / Bank", "Cash outflow"],
        ]}
      />
    </SubSection>

    <SubSection title="How It Works">
      <StepList steps={[
        "Patient pays advance deposit (e.g., IPD admission deposit of 50,000)",
        "Deposit recorded → auto GL: Debit Cash, Credit Patient Deposits liability",
        "During stay, services billed to invoices as usual",
        "At discharge, deposit applied against outstanding invoices",
        "Remaining balance refunded to patient (if any)",
        "All transactions tracked with running balance per patient",
      ]} />
    </SubSection>

    <SubSection title="Key Features">
      <FeatureList items={[
        "Per-patient running wallet balance visible on deposit page",
        "Deposit types: Admission, Surgery, General Advance",
        "Transaction history with deposit/application/refund breakdown",
        "Auto-journal posting on every deposit/refund action",
      ]} />
    </SubSection>

    <TipBox title="IPD Workflow">
      At admission, a minimum deposit amount is required. The admission form validates the deposit has been received before confirming the bed assignment.
    </TipBox>
  </DocPageWrapper>
);
