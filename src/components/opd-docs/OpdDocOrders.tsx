import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocOrders = () => (
  <DocPageWrapper pageNumber={6} totalPages={8} moduleTitle="OPD Module Guide">
    <SectionTitle icon="📋" title="Orders — Lab, Imaging & Referrals" subtitle="Integrated order management from consultation to results" />
    <SubSection title="Lab Orders">
      <FeatureList items={[
        "Search test catalog by name or LOINC code",
        "Order panels (CBC, LFT, RFT) or individual tests",
        "Specimen type auto-populated from test template",
        "Priority: Routine, Urgent, STAT",
        "Results auto-linked to patient EMR once validated",
      ]} />
    </SubSection>
    <SubSection title="Imaging Orders">
      <FeatureList items={[
        "Order X-ray, CT, MRI, Ultrasound, and other modalities",
        "Clinical indication and body region fields",
        "Scheduling integration — slot picker from radiology calendar",
        "PACS viewer integration for report and image access",
      ]} />
    </SubSection>
    <SubSection title="Referrals">
      <MockupTable headers={["Type", "Destination", "Priority"]} rows={[
        ["Internal", "Another OPD department", "Routine/Urgent"],
        ["IPD Admission", "Ward/bed selection", "Urgent"],
        ["Emergency", "ER department", "STAT"],
        ["External", "Outside facility", "Routine"],
      ]} />
    </SubSection>
    <TipBox title="Order Tracking">All orders are tracked in the Orders page with real-time status updates: Ordered → In Progress → Completed → Reviewed.</TipBox>
  </DocPageWrapper>
);
