import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const IpdDocNursing = () => (
  <DocPageWrapper pageNumber={7} totalPages={9} moduleTitle="IPD Module Guide">
    <SectionTitle icon="👩‍⚕️" title="Nursing Station & Medication Chart" subtitle="Medication administration, care plans, and nursing documentation" />
    <SubSection title="Medication Chart">
      <MockupTable headers={["Time", "Medicine", "Dose", "Route", "Status"]} rows={[
        ["08:00", "Ceftriaxone 1g", "1 vial", "IV", "✅ Given"],
        ["08:00", "Pantoprazole 40mg", "1 tab", "Oral", "✅ Given"],
        ["14:00", "Paracetamol 500mg", "2 tab", "Oral", "⏳ Due"],
        ["20:00", "Ceftriaxone 1g", "1 vial", "IV", "🕐 Scheduled"],
        ["22:00", "Tramadol 50mg", "1 tab", "Oral (PRN)", "—"],
      ]} />
    </SubSection>
    <SubSection title="Medication Administration">
      <FeatureList items={[
        "Color-coded MAR (Medication Administration Record) — Due, Given, Missed, Held",
        "Nurse marks each dose with timestamp and signature",
        "PRN medications tracked with reason for administration",
        "Allergy alerts displayed prominently on medication chart",
        "Pharmacy dispense link — Request re-supply when stock runs low",
      ]} />
    </SubSection>
    <SubSection title="Nursing Notes & Care Plans">
      <FeatureList items={[
        "Structured nursing assessment templates (head-to-toe, focused)",
        "Care plan builder with nursing diagnoses and interventions",
        "Wound care documentation with measurements and photos",
        "Fall risk assessment (Morse scale) with auto-precaution orders",
        "Pain assessment using numeric/FLACC/Wong-Baker scales",
        "Shift handover report with critical alerts highlighted",
      ]} />
    </SubSection>
    <TipBox title="Barcode Verification">Scan patient wristband + medication barcode to verify right patient, right drug, right dose before administration.</TipBox>
  </DocPageWrapper>
);
