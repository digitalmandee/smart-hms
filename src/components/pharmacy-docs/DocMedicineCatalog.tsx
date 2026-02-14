import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, StepList } from "./DocPageWrapper";

export const DocMedicineCatalog = () => (
  <DocPageWrapper pageNumber={4} totalPages={18}>
    <SectionTitle
      icon="💊"
      title="Medicine Catalog & Categories"
      subtitle="Central medicine database with full drug information management"
    />

    <SubSection title="Adding / Editing Medicines">
      <FeatureList items={[
        "Medicine Name — Brand or trade name (e.g., Panadol Extra)",
        "Generic Name — Scientific name (e.g., Paracetamol + Caffeine)",
        "Category — Assign to a category (Analgesics, Antibiotics, etc.)",
        "Dosage Form — Tablet, Capsule, Syrup, Injection, Cream, Drops, etc.",
        "Strength — Dosage strength (e.g., 500mg, 250mg/5ml)",
        "Barcode — Optional barcode number for POS scanning",
        "Reorder Level — Minimum stock threshold to trigger alerts",
        "Active/Inactive — Toggle visibility in POS and dispensing",
      ]} />
    </SubSection>

    <SubSection title="Category Management">
      <StepList steps={[
        "Navigate to Pharmacy → Categories from the sidebar",
        "Click 'Add Category' and enter a name (e.g., Cardiovascular)",
        "Categories appear as filter chips in the POS terminal and inventory pages",
        "Edit or reorganize categories anytime — medicines update automatically",
      ]} />
    </SubSection>

    <SubSection title="Search & Filtering">
      <FeatureList items={[
        "Real-time search by medicine name or generic name",
        "Filter by category using dropdown selector",
        "Results limited to active medicines within your organization",
        "Supports up to 50 results per query with pagination",
      ]} />
    </SubSection>

    <TipBox title="Bulk Import">
      For large catalogs, contact support for CSV bulk import of medicines with all fields pre-mapped to the system schema.
    </TipBox>
  </DocPageWrapper>
);
