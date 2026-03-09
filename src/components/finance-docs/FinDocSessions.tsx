import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocSessions = () => (
  <DocPageWrapper pageNumber={8} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="🖥️" title="Billing Sessions — Counter-Based Cash Management" subtitle="Session-gated payment collection with concurrency control and audit trails" />
    <SubSection title="Session Lifecycle">
      <StepList steps={[
        "Staff opens a billing session — selects counter type and enters opening cash balance",
        "System auto-detects current shift (Morning / Evening / Night) based on time",
        "Only ONE open session allowed per user and per counter — enforced by database constraints",
        "All payments collected during the session are linked to the session ID",
        "Staff closes session — enters closing cash, system calculates expected vs actual",
        "Variance (overage/shortage) is recorded and flagged for review",
        "Closed sessions become immutable audit records",
      ]} />
    </SubSection>
    <SubSection title="Counter Types">
      <MockupTable headers={["Counter", "Purpose", "Typical Location"]} rows={[
        ["Reception", "OPD consultation fees, appointment payments", "Front desk"],
        ["OPD", "Outpatient procedure charges, follow-up fees", "OPD billing window"],
        ["IPD", "Inpatient deposits, discharge settlements", "IPD billing counter"],
        ["Pharmacy", "POS medication sales, prescription billing", "Pharmacy counter"],
        ["ER", "Emergency registration fees, urgent care charges", "Emergency department"],
      ]} />
    </SubSection>
    <SubSection title="Session Features">
      <FeatureList items={[
        "Concurrency guard — Database-level partial unique index prevents duplicate open sessions",
        "Stale session warning — Banner alerts if a session from a previous day is still open",
        "Session statistics — Total collections, transaction count, payment method breakdown",
        "Shift-based grouping — Sessions grouped by morning, evening, and night shifts",
        "User-wise cash summary — Aggregated by user + counter + shift composite key",
        "Department breakdown — Collections split by OPD, Lab, Pharmacy, IPD within each session",
        "Historical tracking — Full session history with date range filters and export",
      ]} />
    </SubSection>
    <TipBox title="Session Security">Payment collection is completely blocked unless the cashier has an active open session — ensuring every transaction is accountable.</TipBox>
  </DocPageWrapper>
);
