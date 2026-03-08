import { DocPageWrapper, SectionTitle, SubSection, FeatureList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";
export const DentDocProcedures = () => (
  <DocPageWrapper pageNumber={6} totalPages={7} moduleTitle="Dental Module">
    <SectionTitle icon="🔧" title="Procedures & Pricing" subtitle="CDT catalog, procedure templates & fee schedules" />
    <SubSection title="Procedure Catalog">
      <FeatureList items={["Full CDT (Current Dental Terminology) code library","Custom procedure templates with default materials","Category grouping: Preventive, Restorative, Endodontic, Prosthodontic, Surgical, Orthodontic","Per-procedure time estimate for scheduling","Material and consumable linking for auto-deduction from inventory"]} />
    </SubSection>
    <SubSection title="Common Procedures">
      <MockupTable headers={["CDT Code", "Procedure", "Category", "Avg. Time"]} rows={[["D0120","Periodic Oral Evaluation","Diagnostic","15 min"],["D0220","Periapical X-Ray","Diagnostic","5 min"],["D1110","Prophylaxis (Cleaning)","Preventive","30 min"],["D2391","Composite — 1 surface","Restorative","30 min"],["D3310","Root Canal — Anterior","Endodontic","60 min"],["D7140","Simple Extraction","Surgical","20 min"],["D2740","Porcelain Crown","Prosthodontic","60 min"]]} />
    </SubSection>
    <SubSection title="Fee Schedule Management">
      <FeatureList items={["Multiple fee schedules: Standard, Insurance A, Insurance B, VIP","Bulk price update by percentage or fixed amount","Insurance company-specific contracted rates","Package deals: Cleaning + X-Ray + Consultation bundle","Discount rules by patient category or promotion"]} />
    </SubSection>
    <TipBox title="NPHIES Integration">Dental procedures map to NPHIES classification for seamless insurance claim submission in KSA.</TipBox>
  </DocPageWrapper>
);
