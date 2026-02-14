import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, ScreenMockup } from "./DocPageWrapper";

export const DocWarehouse = () => (
  <DocPageWrapper pageNumber={14} totalPages={18}>
    <SectionTitle
      icon="🏭"
      title="Warehouse Management"
      subtitle="Multi-store inventory isolation with inter-store transfer workflows"
    />

    <ScreenMockup title="Inter-Store Transfer Workflow">
      <div className="flex items-center justify-between text-[9px] px-2">
        {[
          ["📋", "Request", "Draft"],
          ["✅", "Approve", "Approved"],
          ["📦", "Dispatch", "In Transit"],
          ["🏪", "Receive", "Completed"],
        ].map(([icon, label, status], i) => (
          <div key={label} className="flex items-center gap-0">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-base mx-auto">{icon}</div>
              <p className="font-bold text-gray-900 mt-1">{label}</p>
              <p className="text-gray-500">{status}</p>
            </div>
            {i < 3 && <div className="w-8 h-0.5 bg-emerald-300 mx-1 mt-[-12px]" />}
          </div>
        ))}
      </div>
    </ScreenMockup>

    <SubSection title="Creating & Managing Warehouses">
      <FeatureList items={[
        "Create multiple warehouses: Main Pharmacy, Cold Storage, Sub-Store, etc.",
        "Each warehouse has: Name, Code, Location, Manager, Contact info",
        "Warehouse-specific inventory — stock is isolated per store",
        "Activate/deactivate warehouses without losing historical data",
      ]} />
    </SubSection>

    <SubSection title="Transfer Tracking">
      <FeatureList items={[
        "Each transfer assigned unique number: TRF-YYYYMMDD-XXXX",
        "Full lifecycle tracking with status indicators at each stage",
        "Batch and expiry information preserved across transfers",
        "Stock movements created for both source (Out) and destination (In)",
      ]} />
    </SubSection>

    <SubSection title="Store-Aware Inventory">
      <FeatureList items={[
        "All inventory pages support store filtering via the global Store Selector",
        "POS terminal operates within the context of the assigned store",
        "Reports can be run per-store or aggregated across all stores",
      ]} />
    </SubSection>

    <TipBox title="Independent Pharmacy">
      Even standalone pharmacies benefit from warehouses — create separate stores for 'Front Counter' and 'Back Storage' to track where physical stock is located.
    </TipBox>
  </DocPageWrapper>
);
