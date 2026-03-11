import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideCreditNotes = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={6} totalPages={totalPages}>
    <SectionTitle icon="📄" title="Credit Note Flow" subtitle="ZATCA-Compliant Adjustments (Types 381/383)" />

    <SubSection title="When to Issue">
      <FeatureList items={[
        "Patient refund — service not rendered or partial cancellation",
        "Billing error correction — wrong amount charged",
        "Insurance adjustment — approved amount less than billed",
        "Goods return — pharmacy or consumable returns",
      ]} />
    </SubSection>

    <SubSection title="ZATCA Note Types">
      <MockupTable
        headers={["Type Code", "Name", "Use Case"]}
        rows={[
          ["381", "Credit Note", "Reduces amount owed (refund/discount)"],
          ["383", "Debit Note", "Increases amount owed (additional charges)"],
        ]}
      />
    </SubSection>

    <SubSection title="Credit Note Lifecycle">
      <StepList steps={[
        "Create credit/debit note with amount, reason, and optional invoice reference",
        "Note created in 'Draft' status — no financial impact yet",
        "Supervisor reviews and approves the note",
        "On approval → auto journal posting: Debit Revenue, Credit AR (for credit notes)",
        "For debit notes: Debit AR, Credit Revenue",
        "Patient balance updated, visible in deposit/wallet system",
      ]} />
    </SubSection>

    <TipBox title="Approval Workflow">
      Credit notes require approval before GL posting to prevent unauthorized refunds. The approval field tracks who approved and when.
    </TipBox>
  </DocPageWrapper>
);
