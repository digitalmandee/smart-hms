import { DocPageWrapper, SectionTitle, ProcessFlow } from "@/components/shared-docs/DocPageWrapper";

export const RadDocFlow = () => (
  <DocPageWrapper pageNumber={3} totalPages={6} moduleTitle="Radiology Module Guide">
    <SectionTitle icon="🔄" title="Radiology Process Flow" subtitle="Imaging order-to-report workflow" />
    <ProcessFlow steps={[
      { icon: "📋", title: "Imaging Order", desc: "Doctor places imaging order (X-Ray, CT, MRI, Ultrasound) from EMR. Includes clinical indication, contrast requirement, and urgency." },
      { icon: "📅", title: "Scheduling", desc: "Radiology coordinator schedules slot based on modality availability. Patient receives appointment SMS with preparation instructions." },
      { icon: "🏥", title: "Patient Preparation", desc: "Technician verifies patient identity, checks contraindications (pregnancy, metal implants, allergies to contrast). Consent obtained." },
      { icon: "📡", title: "Scan Execution", desc: "Radiographer performs the scan following standard protocol. DICOM images captured and auto-uploaded to PACS server." },
      { icon: "🖥️", title: "Image Upload to PACS", desc: "Images stored in PACS with patient metadata. Available for viewing across all departments. Prior studies linked for comparison." },
      { icon: "👨‍⚕️", title: "Radiologist Reporting", desc: "Radiologist reviews images on diagnostic workstation. Uses structured templates for reporting. Findings, impressions, and recommendations documented." },
      { icon: "📄", title: "Report to Referring Doctor", desc: "Finalized report with key images appears in ordering doctor's EMR. Critical findings trigger immediate notification alert." },
    ]} />
  </DocPageWrapper>
);
