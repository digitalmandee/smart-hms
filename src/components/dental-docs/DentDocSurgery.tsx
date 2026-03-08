import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DentDocSurgery = () => (
  <DocPageWrapper pageNumber={7} totalPages={8} moduleTitle="Dental Module">
    <SectionTitle icon="🔪" title="Oral Surgery" subtitle="Extractions, implants, bone grafting & maxillofacial procedures" />
    <SubSection title="Surgery Types">
      <MockupTable headers={["Procedure", "CDT Range", "Anesthesia", "Avg. Duration"]} rows={[["Simple Extraction","D7140","Local","20 min"],["Surgical Extraction","D7210-D7220","Local / Sedation","45 min"],["Implant Placement","D6010","Local + Sedation","60-90 min"],["Bone Grafting","D7953","Local","30-45 min"],["Apicoectomy","D3410-D3426","Local","45 min"],["Biopsy (Soft Tissue)","D7286","Local","15-20 min"],["Impacted Wisdom Tooth","D7230-D7240","Local + Sedation","45-60 min"]]} />
    </SubSection>
    <SubSection title="Pre-Surgical Checklist">
      <StepList steps={["Review medical history — bleeding disorders, anticoagulants, bisphosphonates","Order pre-op imaging: OPG panoramic or CBCT 3D scan","Verify proximity to vital structures (nerve canals, sinuses)","Obtain informed consent with procedure risks explained","Plan anesthesia: local infiltration, nerve block, or IV sedation","Prescribe prophylactic antibiotics if indicated (e.g., implant cases)"]} />
    </SubSection>
    <SubSection title="Surgical Workflow">
      <StepList steps={["Administer local anesthesia — confirm adequate numbness","Make incision and raise mucoperiosteal flap if needed","Execute procedure: extract tooth / place implant / graft bone","Achieve hemostasis — control bleeding with pressure or sutures","Close wound with appropriate suture material (resorbable/non-resorbable)","Document procedure details, materials used, and post-op instructions"]} />
    </SubSection>
    <SubSection title="Post-Surgical Follow-Up">
      <FeatureList items={["Suture removal scheduled at 7-10 days post-op","Healing assessment with intraoral photo documentation","Implant osseointegration monitoring: 3-6 month follow-up","Dry socket and infection screening protocol","Complex maxillofacial cases referred to OT module for GA procedures"]} />
    </SubSection>
    <TipBox title="OT Integration">For cases requiring general anesthesia (impacted third molars, maxillofacial trauma), the dental module links directly to the Surgery/OT module for scheduling, anesthesia records, and post-op recovery tracking.</TipBox>
  </DocPageWrapper>
);
