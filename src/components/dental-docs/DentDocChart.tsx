import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DentDocChart = () => (
  <DocPageWrapper pageNumber={4} totalPages={8} moduleTitle="Dental Module">
    <SectionTitle icon="🦷" title="3D Tooth Chart & Conditions" subtitle="Interactive FDI charting with per-surface condition mapping" />
    <SubSection title="Interactive Tooth Chart">
      <FeatureList items={["Full 3D interactive dental chart with adult (32) and pediatric (20) views","FDI two-digit notation (ISO 3950) — teeth numbered 11-48 (adult)","Click any tooth to expand 5-surface detail view","Color-coded conditions: red (decay), blue (restoration), gray (missing)","Supernumerary and impacted tooth annotations","Periodontal pocket depth recording per tooth"]} />
    </SubSection>
    <SubSection title="Surface Mapping">
      <MockupTable headers={["Surface", "Code", "Description"]} rows={[["Mesial","M","Surface facing midline"],["Distal","D","Surface away from midline"],["Buccal","B","Cheek-facing surface"],["Lingual","L","Tongue-facing surface"],["Occlusal","O","Biting surface (posteriors)"],["Incisal","I","Cutting edge (anteriors)"]]} />
    </SubSection>
    <SubSection title="Recording Conditions">
      <StepList steps={["Select tooth from chart (e.g., tooth 36)","Choose condition: Caries, Fracture, Missing, Restoration, Crown, etc.","Select affected surfaces (e.g., MOD — Mesial, Occlusal, Distal)","Add severity and notes if needed","Condition auto-renders on chart with appropriate color/icon"]} />
    </SubSection>
    <TipBox title="History Tracking">Every condition change is versioned — view tooth history timeline to track progression.</TipBox>
  </DocPageWrapper>
);
