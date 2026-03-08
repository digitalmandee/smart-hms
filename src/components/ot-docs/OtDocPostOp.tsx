import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OtDocPostOp = () => (
  <DocPageWrapper pageNumber={7} totalPages={7} moduleTitle="Surgery / OT Module Guide">
    <SectionTitle icon="🏥" title="PACU & Post-Op Recovery" subtitle="Post-anesthesia care unit monitoring and ward transfer" />
    <SubSection title="PACU Workflow">
      <StepList steps={[
        "Patient transferred from OT to PACU with anesthesia handover",
        "Continuous monitoring — Vitals every 5 minutes initially",
        "Aldrete recovery scoring at regular intervals",
        "Pain management — Analgesic protocol per surgeon orders",
        "Airway management and oxygen support as needed",
        "PONV (nausea/vomiting) assessment and treatment",
        "Discharge from PACU when Aldrete score ≥ 9",
        "Handover to ward nurse with post-op orders",
      ]} />
    </SubSection>
    <SubSection title="Post-Op Orders">
      <FeatureList items={[
        "Medications — Antibiotics, analgesics, anticoagulants, fluids",
        "Diet progression — NPO → Clear fluids → Soft → Regular",
        "Activity level — Bed rest, ambulate with assistance, full activity",
        "Wound care — Dressing changes, drain management",
        "Monitoring — Vitals frequency, drain output, I/O chart",
        "Lab work — Post-op CBC, electrolytes, specific tests",
        "DVT prophylaxis — Compression stockings, mobilization, anticoagulants",
      ]} />
    </SubSection>
    <SubSection title="Complication Monitoring">
      <FeatureList items={[
        "Surgical site infection (SSI) surveillance with daily wound assessment",
        "Post-op bleeding alerts based on drain output thresholds",
        "Fever protocol — Blood cultures, wound swab if temp > 38.5°C",
        "VTE screening — DVT symptoms checked during daily rounds",
        "All complications auto-reported to quality dashboard",
      ]} />
    </SubSection>
    <TipBox title="Surgery Report">Complete surgical report (pre-op assessment + operative notes + PACU record) available as downloadable PDF for patient records and insurance claims.</TipBox>
  </DocPageWrapper>
);
