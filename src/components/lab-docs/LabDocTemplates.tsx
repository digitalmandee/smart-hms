import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const LabDocTemplates = () => (
  <DocPageWrapper pageNumber={5} totalPages={5} moduleTitle="Laboratory Module Guide">
    <SectionTitle icon="📝" title="Test Catalog & Templates" subtitle="Configurable test definitions with parameters, ranges, and categories" />
    <SubSection title="Test Template Structure">
      <MockupTable headers={["Field", "Example", "Description"]} rows={[
        ["Test Name", "Complete Blood Count", "Display name"],
        ["Category", "Hematology", "Department grouping"],
        ["LOINC Code", "58410-2", "Standard coding"],
        ["Specimen", "EDTA Blood", "Collection type"],
        ["TAT (hours)", "4", "Expected turnaround"],
        ["Price", "SAR 85", "Billing amount"],
      ]} />
    </SubSection>
    <SubSection title="Parameters & Ranges">
      <MockupTable headers={["Parameter", "Unit", "Male Range", "Female Range"]} rows={[
        ["Hemoglobin", "g/dL", "13.0–17.0", "12.0–15.5"],
        ["WBC", "×10³/µL", "4.5–11.0", "4.5–11.0"],
        ["Platelets", "×10³/µL", "150–400", "150–400"],
        ["RBC", "×10⁶/µL", "4.5–5.5", "4.0–5.0"],
        ["Hematocrit", "%", "38–50", "36–44"],
      ]} />
    </SubSection>
    <SubSection title="Catalog Features">
      <FeatureList items={[
        "Test panels — Group multiple tests (e.g., CBC = 5 parameters)",
        "Age-specific reference ranges (Pediatric, Adult, Geriatric)",
        "Gender-specific ranges with auto-detection from patient profile",
        "Custom formula fields — Calculated values (e.g., eGFR, MELD score)",
        "Category-based organization with color coding",
        "Active/inactive toggle to control test availability",
        "Bulk import/export via CSV for large catalogs",
      ]} />
    </SubSection>
    <TipBox title="QC Management">Configure Levey-Jennings charts and Westgard rules per analyzer for daily QC tracking and compliance.</TipBox>
  </DocPageWrapper>
);
