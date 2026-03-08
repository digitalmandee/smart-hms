import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DialDocPatients = () => (
  <DocPageWrapper pageNumber={3} totalPages={6} moduleTitle="Dialysis Center">
    <SectionTitle icon="🧑‍⚕️" title="Patient Enrollment" subtitle="Registration, dry weight, access type & hepatitis status" />
    <SubSection title="Dialysis Patient Registration">
      <StepList steps={["Select existing patient from master registry","Set dialysis-specific fields: dry weight, access type, hepatitis status","Choose vascular access: AV Fistula, AV Graft, or Catheter","Record referring nephrologist and diagnosis (CKD stage)","Assign to schedule group (MWF or TTS)"]} />
    </SubSection>
    <SubSection title="Patient Card Details">
      <MockupTable headers={["Field", "Description"]} rows={[["Dry Weight","Target post-dialysis weight (kg)"],["Access Type","AV Fistula / AV Graft / Catheter"],["Hepatitis Status","HBsAg, HCV, HIV — determines isolation chair"],["Blood Group","For transfusion readiness"],["Dialysis Start Date","When patient began HD treatment"],["EPO Protocol","Erythropoietin dosing schedule"]]} />
    </SubSection>
    <SubSection title="Clinical Parameters">
      <FeatureList items={["Monthly lab tracking: Hb, urea, creatinine, K+, Ca++, phosphorus","Kt/V adequacy tracking with trend charts","Medication list synced with pharmacy module","Allergy and comorbidity alerts on session start","Insurance pre-authorization for recurring sessions"]} />
    </SubSection>
    <TipBox title="Hepatitis Isolation">HBsAg+ patients are auto-assigned to dedicated machines and chairs — system prevents cross-contamination.</TipBox>
  </DocPageWrapper>
);
