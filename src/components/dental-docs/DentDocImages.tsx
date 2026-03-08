import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DentDocImages = () => (
  <DocPageWrapper pageNumber={6} totalPages={6} module="Dental Module">
    <SectionTitle icon="📸" title="Dental Imaging" subtitle="X-rays, OPG, CBCT upload and annotation" />
    <SubSection title="Image Types Supported">
      <MockupTable headers={["Type", "Use Case", "Format"]} rows={[
        ["Periapical", "Single tooth detail", "DICOM / JPEG"],
        ["Bitewing", "Interproximal caries detection", "DICOM / JPEG"],
        ["OPG (Panoramic)", "Full mouth overview", "DICOM / JPEG"],
        ["CBCT (3D)", "Implant planning, impactions", "DICOM"],
        ["Intraoral Photo", "Clinical documentation", "JPEG / PNG"],
        ["Cephalometric", "Orthodontic analysis", "DICOM / JPEG"],
      ]} />
    </SubSection>
    <SubSection title="Image Workflow">
      <StepList steps={[
        "Capture or import image from dental imaging device",
        "Upload to patient record — auto-linked to visit date",
        "Associate image with specific tooth/teeth",
        "Annotate: draw arrows, circles, measurements on image",
        "Compare side-by-side with previous images (before/after)",
        "Include in treatment plan documentation or referral letter"
      ]} />
    </SubSection>
    <SubSection title="Advanced Features">
      <FeatureList items={[
        "DICOM viewer with contrast, brightness, zoom controls",
        "Measurement tools: linear distance, angle measurement",
        "Image series: group multiple views per session",
        "AI-assisted caries detection overlay (optional module)",
        "Secure sharing with referral dentists via encrypted link"
      ]} />
    </SubSection>
    <TipBox title="Storage">All dental images stored in HIPAA-compliant cloud storage with automatic backup and 10-year retention policy.</TipBox>
  </DocPageWrapper>
);
