import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "./DocPageWrapper";
import { Warehouse } from "lucide-react";

export const DocWarehouse = () => (
  <DocPageWrapper pageNumber={14} totalPages={18}>
    <SectionTitle
      icon={<Warehouse className="w-5 h-5" />}
      title="Warehouse Management"
      subtitle="Multi-store inventory isolation with inter-store transfer workflows"
    />

    <SubSection title="Creating & Managing Warehouses">
      <FeatureList items={[
        "Create multiple warehouses: Main Pharmacy, Cold Storage, Sub-Store, etc.",
        "Each warehouse has: Name, Code, Location, Manager, Contact info",
        "Assign a Store Manager who gets auto-filtered dashboard access",
        "Activate/deactivate warehouses without losing historical data",
        "Warehouse-specific inventory — stock is isolated per store",
      ]} />
    </SubSection>

    <SubSection title="Inter-Store Transfer Workflow">
      <StepList steps={[
        "Request — Source store creates a transfer request (Draft status)",
        "Approve — Destination store manager reviews and approves the request",
        "Dispatch — Source store picks, packs, and dispatches items (stock deducted via FIFO)",
        "Receive — Destination store confirms receipt (stock added to destination)",
      ]} />
    </SubSection>

    <SubSection title="Transfer Tracking">
      <FeatureList items={[
        "Each transfer assigned unique number: TRF-YYYYMMDD-XXXX",
        "Full lifecycle tracking with status indicators at each stage",
        "Batch and expiry information preserved across transfers",
        "Transfer history with filters: date, status, source/destination store",
        "Stock movement entries created for both source (Transfer Out) and destination (Transfer In)",
      ]} />
    </SubSection>

    <SubSection title="Store-Aware Inventory">
      <FeatureList items={[
        "All inventory pages support store filtering via the global Store Selector",
        "POS terminal operates within the context of the assigned store",
        "Reports can be run per-store or aggregated across all stores",
        "GRN/Stock entries are tagged to the receiving store",
      ]} />
    </SubSection>

    <TipBox title="Independent Pharmacy">
      Even standalone pharmacies benefit from warehouses — create separate stores for 'Front Counter' and 'Back Storage' to track where physical stock is located.
    </TipBox>
  </DocPageWrapper>
);
