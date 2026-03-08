import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const RadDocPacs = () => (
  <DocPageWrapper pageNumber={6} totalPages={6} moduleTitle="Radiology Module Guide">
    <SectionTitle icon="🖥️" title="PACS Integration & Image Viewing" subtitle="DICOM image management, multi-frame viewing, and archive" />
    <SubSection title="PACS Architecture">
      <MockupTable headers={["Component", "Protocol", "Function"]} rows={[
        ["Modality → PACS", "DICOM C-STORE", "Send images from scanner"],
        ["PACS → Viewer", "WADO-RS", "Web-based image retrieval"],
        ["HIS → PACS", "HL7/DICOM MWL", "Worklist synchronization"],
        ["PACS → Archive", "DICOM C-MOVE", "Long-term storage"],
      ]} />
    </SubSection>
    <SubSection title="Viewer Features">
      <FeatureList items={[
        "Web-based DICOM viewer — No plugin or software installation",
        "Window/Level adjustment for contrast optimization",
        "Zoom, pan, rotate, and flip tools",
        "Measurement tools — Length, angle, area, ROI",
        "MPR (Multi-Planar Reconstruction) for CT/MRI",
        "Series comparison — Side-by-side prior study viewing",
        "3D volume rendering for CT datasets",
        "Key image flagging for report reference",
      ]} />
    </SubSection>
    <SubSection title="Archive & Storage">
      <FeatureList items={[
        "Automated study routing rules based on modality/body part",
        "Short-term cache (PACS) + long-term archive (cloud/NAS)",
        "Study lifecycle management — Auto-archive after configurable period",
        "Patient-centric image history across all modalities",
        "CD/DVD burning for patient image export",
        "Integration with Supabase storage for cloud-based DICOM archive",
      ]} />
    </SubSection>
    <TipBox title="PACS Setup Guide">Use the built-in PACS Setup Guide page to configure DICOM AE titles, ports, and connectivity testing for your modalities.</TipBox>
  </DocPageWrapper>
);
