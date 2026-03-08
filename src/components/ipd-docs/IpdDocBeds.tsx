import { DocPageWrapper, SectionTitle, FeatureList, SubSection, ScreenMockup, InfoCard, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocBeds = () => (
  <DocPageWrapper pageNumber={5} totalPages={9} moduleTitle="IPD Module Guide">
    <SectionTitle icon="🛏️" title="Bed Management & Transfers" subtitle="Real-time bed occupancy, transfers, and housekeeping integration" />
    <ScreenMockup title="Bed Dashboard">
      <div className="grid grid-cols-4 gap-2">
        <InfoCard icon="🟢" label="Available" value="24" />
        <InfoCard icon="🔴" label="Occupied" value="56" />
        <InfoCard icon="🟡" label="Reserved" value="4" />
        <InfoCard icon="🔧" label="Maintenance" value="2" />
      </div>
    </ScreenMockup>
    <SubSection title="Bed Status Lifecycle">
      <MockupTable headers={["Status", "Color", "Description"]} rows={[
        ["Available", "🟢 Green", "Clean and ready for new patient"],
        ["Occupied", "🔴 Red", "Patient currently admitted"],
        ["Reserved", "🟡 Yellow", "Held for scheduled admission"],
        ["Discharge Pending", "🟠 Orange", "Patient approved for discharge"],
        ["Housekeeping", "🟣 Purple", "Being cleaned/sanitized"],
        ["Maintenance", "⚫ Gray", "Out of service for repair"],
      ]} />
    </SubSection>
    <SubSection title="Bed Transfer">
      <FeatureList items={[
        "Doctor or nurse initiates transfer request with reason",
        "Select destination ward and available bed",
        "Transfer logged with timestamp, from/to ward, ordered by, transferred by",
        "Previous bed auto-released to housekeeping queue",
        "Patient chart and medication orders follow automatically",
      ]} />
    </SubSection>
    <TipBox title="Housekeeping Queue">When a patient is discharged or transferred, the vacated bed auto-enters the housekeeping queue for cleaning before becoming available.</TipBox>
  </DocPageWrapper>
);
