import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";

export const DocStockMovements = () => (
  <DocPageWrapper pageNumber={14} totalPages={19}>
    <SectionTitle
      icon="↔️"
      title="Stock Movements & Alerts"
      subtitle="Unified audit log of all inventory changes with configurable alert thresholds"
    />

    <SubSection title="Movement Types">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {[
          ["GRN", "Goods received from supplier"],
          ["Sale", "Retail POS transaction"],
          ["Dispense", "Clinical prescription dispensing"],
          ["Adjustment", "Manual stock correction"],
          ["Return", "Customer return restocking"],
          ["Transfer In", "Received from another store"],
          ["Transfer Out", "Sent to another store"],
          ["Expired", "Removed due to expiry"],
          ["Damaged", "Removed due to damage"],
          ["Opening", "Initial stock entry"],
        ].map(([type, desc]) => (
          <div key={type} className="flex items-start gap-2 py-1">
            <span className="font-medium text-emerald-700 w-24 shrink-0">{type}</span>
            <span className="text-gray-500">{desc}</span>
          </div>
        ))}
      </div>
    </SubSection>

    <SubSection title="Filtering & Search">
      <FeatureList items={[
        "Filter by movement type to isolate specific activity (e.g., only Returns)",
        "Date range picker for period-specific analysis",
        "Search by medicine name or batch number",
        "Each entry shows: Date, Medicine, Batch, Type, Quantity (+/-), User",
      ]} />
    </SubSection>

    <SubSection title="Stock Alerts">
      <FeatureList items={[
        "Low Stock Notifications — triggered when stock falls below reorder level",
        "Expiry Warnings — items approaching expiry within configured alert window",
        "Alerts page shows all active warnings with severity indicators",
        "Click any alert to navigate directly to the affected medicine's inventory",
      ]} />
    </SubSection>

    <SubSection title="Configurable Thresholds">
      <FeatureList items={[
        "Low Stock Threshold — default reorder level for new medicines (Settings)",
        "Expiry Alert Days — number of days before expiry to trigger warnings",
        "Both settings configurable in Pharmacy → Settings",
      ]} />
    </SubSection>

    <TipBox title="Compliance">
      The stock movements log serves as your regulatory audit trail. All entries are immutable and timestamped with the user who performed the action.
    </TipBox>
  </DocPageWrapper>
);
