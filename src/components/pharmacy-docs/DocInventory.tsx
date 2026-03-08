import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, MockupTable } from "./DocPageWrapper";

export const DocInventory = () => (
  <DocPageWrapper pageNumber={6} totalPages={19}>
    <SectionTitle
      icon="📦"
      title="Inventory Management"
      subtitle="Batch-level stock tracking with expiry management and FIFO/FEFO logic"
    />

    <MockupTable
      headers={["Medicine", "Batch", "Qty", "Expiry", "Status"]}
      rows={[
        ["Paracetamol 500mg", "BT-2024-001", "150", "2026-03-15", "✅ OK"],
        ["Amoxicillin 250mg", "BT-2024-018", "12", "2025-06-30", "⚠️ Low"],
        ["Omeprazole 20mg", "BT-2024-042", "0", "2025-02-28", "❌ Out"],
        ["Cetirizine 10mg", "BT-2024-055", "95", "2025-04-10", "🔶 Expiring"],
      ]}
    />

    <SubSection title="Stock Levels & Batch Tracking">
      <FeatureList items={[
        "Each medicine can have multiple batches with different batch numbers",
        "Every batch tracks: Quantity, Batch Number, Expiry Date, Unit Price, Selling Price",
        "Total stock is the sum of all batch quantities for each medicine",
      ]} />
    </SubSection>

    <SubSection title="Search & Filter">
      <FeatureList items={[
        "Search by medicine name across all inventory items",
        "Filter by Category dropdown to narrow down results",
        "Filter by Stock Status: All, Low Stock, Expiring Soon, Out of Stock",
      ]} />
    </SubSection>

    <SubSection title="Inventory Adjustments">
      <FeatureList items={[
        "Manual stock corrections via the Adjustment modal",
        "Reason field required: Damaged, Expired, Count Correction, Other",
        "All adjustments logged in Stock Movements for audit compliance",
      ]} />
    </SubSection>

    <SubSection title="FIFO / FEFO Dispensing Logic">
      <FeatureList items={[
        "FEFO (First Expiry, First Out) is the default dispensing strategy",
        "System automatically selects the batch closest to expiry first",
        "Pharmacists can override batch selection during manual dispensing",
      ]} />
    </SubSection>

    <TipBox title="Reorder Alerts">
      Set the reorder level on each medicine. When total stock drops below this threshold, the medicine appears in the Low Stock dashboard card and the Stock Alerts page.
    </TipBox>
  </DocPageWrapper>
);
