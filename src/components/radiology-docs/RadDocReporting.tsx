import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const RadDocReporting = () => (
  <DocPageWrapper pageNumber={5} totalPages={6} moduleTitle="Radiology Module Guide">
    <SectionTitle icon="📝" title="Report Writing & Templates" subtitle="Structured radiology reporting with templates and voice dictation" />
    <SubSection title="Reporting Workflow">
      <StepList steps={[
        "Radiologist selects study from reporting worklist",
        "View images in integrated PACS viewer",
        "Select report template or start from scratch",
        "Write findings using structured sections — Technique, Findings, Impression",
        "Add key measurements and annotations",
        "Submit for verification or directly sign off",
        "Report auto-published to ordering doctor's EMR",
      ]} />
    </SubSection>
    <SubSection title="Report Templates">
      <FeatureList items={[
        "Pre-built templates per modality and body region",
        "Customizable templates with placeholders and macros",
        "Normal study templates for rapid reporting",
        "Critical finding templates with auto-notification triggers",
        "Structured reporting following ACR/BIRADS/TIRADS standards",
      ]} />
    </SubSection>
    <SubSection title="Report Features">
      <FeatureList items={[
        "Two-tier verification — Resident draft → Consultant approval",
        "Addendum support for supplementary findings",
        "Report comparison with prior studies",
        "Digital radiologist signature with credentials",
        "Auto-generated PDF with hospital letterhead",
        "Critical value alert — Auto-page ordering doctor for urgent findings",
        "BIRADS/TIRADS/PIRADS scoring with recommendation engine",
      ]} />
    </SubSection>
    <TipBox title="Voice Dictation">Radiologists can dictate reports using voice input with real-time speech-to-text, significantly reducing reporting time.</TipBox>
  </DocPageWrapper>
);
