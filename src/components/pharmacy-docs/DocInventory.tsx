import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";
import { Package } from "lucide-react";

export const DocInventory = () => (
  <DocPageWrapper pageNumber={5} totalPages={18}>
    <SectionTitle
      icon={<Package className="w-5 h-5" />}
      title="Inventory Management"
      subtitle="Batch-level stock tracking with expiry management and FIFO/FEFO logic"
    />

    <SubSection title="Stock Levels & Batch Tracking">
      <FeatureList items={[
        "Each medicine can have multiple batches with different batch numbers",
        "Every batch tracks: Quantity, Batch Number, Expiry Date, Unit Price, Selling Price",
        "Total stock is the sum of all batch quantities for each medicine",
        "Batches with zero quantity are retained for audit trail purposes",
      ]} />
    </SubSection>

    <SubSection title="Search & Filter">
      <FeatureList items={[
        "Search by medicine name across all inventory items",
        "Filter by Category dropdown to narrow down results",
        "Filter by Stock Status: All, Low Stock, Expiring Soon, Out of Stock",
        "Sortable columns for quick analysis of stock positions",
      ]} />
    </SubSection>

    <SubSection title="Inventory Adjustments">
      <FeatureList items={[
        "Manual stock corrections via the Adjustment modal",
        "Select medicine, batch, and enter corrected quantity",
        "Reason field required: Damaged, Expired, Count Correction, Other",
        "All adjustments logged in Stock Movements for audit compliance",
      ]} />
    </SubSection>

    <SubSection title="FIFO / FEFO Dispensing Logic">
      <FeatureList items={[
        "FEFO (First Expiry, First Out) is the default dispensing strategy",
        "System automatically selects the batch closest to expiry first",
        "Pharmacists can override batch selection during manual dispensing",
        "Prevents expired stock from remaining in active inventory",
      ]} />
    </SubSection>

    <TipBox title="Reorder Alerts">
      Set the reorder level on each medicine. When total stock drops below this threshold, the medicine appears in the Low Stock dashboard card and the Stock Alerts page.
    </TipBox>
  </DocPageWrapper>
);
