import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocTatmeen = () => (
  <KsaDocPageWrapper pageNumber={7} totalPages={12}>
    <KsaSectionTitle icon="📦" title="Tatmeen / RSD — Drug Track & Trace" subtitle="SFDA Rashid (RSD) system for pharmaceutical supply chain visibility" />

    <KsaSubSection title="GS1 DataMatrix Scanning">
      <KsaStepList steps={[
        "Scan GS1 DataMatrix barcode on drug packaging using camera or scanner",
        "HealthOS parses GTIN (01), Serial (21), Batch (10), and Expiry (17)",
        "Parsed data is validated against SFDA product database",
        "EPCIS event generated — Receiving, Dispensing, or Return",
        "Event submitted to Tatmeen API for supply chain recording",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="EPCIS Event Types">
      <KsaMockupTable
        headers={["Event", "Trigger", "EPCIS Type"]}
        rows={[
          ["Receiving", "Stock entry / GRN", "ObjectEvent (ADD)"],
          ["Dispensing", "POS sale or Rx dispense", "ObjectEvent (DELETE)"],
          ["Return to Supplier", "Return note created", "ObjectEvent (DELETE)"],
          ["Transfer", "Inter-branch transfer", "ObjectEvent (OBSERVE)"],
          ["Destruction", "Expired drug disposal", "ObjectEvent (DELETE)"],
        ]}
      />
    </KsaSubSection>

    <KsaSubSection title="Compliance Requirements">
      <KsaFeatureList items={[
        "All prescription drugs must be scanned at point of dispensing",
        "Serial number verification prevents counterfeit medication entry",
        "Recall alerts — automatic flagging of recalled batches in inventory",
        "Audit trail — complete chain of custody from manufacturer to patient",
        "Monthly reconciliation reports for SFDA compliance review",
      ]} />
    </KsaSubSection>

    <KsaTipBox title="Batch Scanner">
      The TatmeenScanButton supports rapid batch scanning — scan multiple items continuously, and HealthOS queues EPCIS events for bulk submission.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
