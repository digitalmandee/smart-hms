import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocAdmission = () => (
  <DocPageWrapper pageNumber={4} totalPages={9} moduleTitle="IPD Module Guide">
    <SectionTitle icon="🏥" title="Admission — Bed Selection & Form" subtitle="Complete admission workflow from OPD/ER to ward" />
    <SubSection title="Admission Channels">
      <FeatureList items={[
        "OPD referral — Doctor initiates admission from consultation",
        "Emergency admission — Quick admit from ER triage",
        "Direct admission — Planned surgery or scheduled procedures",
        "Transfer from another facility — External referral intake",
      ]} />
    </SubSection>
    <SubSection title="Bed Selection Process">
      <StepList steps={[
        "Select ward type — General, Semi-Private, Private, ICU, NICU, Isolation",
        "View bed availability dashboard — Color-coded occupancy map",
        "Filter by floor, wing, and bed features (oxygen, cardiac monitor)",
        "Select available bed → Auto-marks as occupied",
        "Override option for emergency cases on reserved beds",
      ]} />
    </SubSection>
    <SubSection title="Admission Form">
      <FeatureList items={[
        "Patient demographics — Auto-filled from patient registry",
        "Admitting doctor & attending doctor assignment",
        "Admission type: Elective, Emergency, Maternity, Surgical",
        "Chief complaint and diagnosis on admission (ICD-10)",
        "Insurance/corporate details with pre-authorization number",
        "Payment mode: Cash, Insurance, Corporate, Credit",
        "Deposit collection with receipt generation",
        "Estimated length of stay and cost calculation",
      ]} />
    </SubSection>
    <TipBox title="Auto Admission Number">Admission numbers are auto-generated per branch with format ADM-YYYY-NNNNN for unique tracking.</TipBox>
  </DocPageWrapper>
);
