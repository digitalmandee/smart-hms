import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox, ScreenMockup } from "./DocPageWrapper";

export const DocReturns = () => (
  <DocPageWrapper pageNumber={12} totalPages={18}>
    <SectionTitle
      icon="🔄"
      title="Returns & Refunds"
      subtitle="Process partial or full returns with automatic inventory restocking"
    />

    <ScreenMockup title="Return Processing">
      <div className="text-[10px] space-y-2">
        <div className="flex items-center gap-2 bg-emerald-50 rounded p-1.5 border border-emerald-200">
          <span className="text-gray-500">Receipt #:</span>
          <span className="font-bold">POS-20260214-0042</span>
          <span className="ml-auto px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[8px]">Found</span>
        </div>
        <div className="space-y-1">
          {[["☑ Paracetamol 500mg", "x2", "5.00"], ["☐ Omeprazole 20mg", "x1", "3.75"]].map(([n, q, p]) => (
            <div key={n} className="flex justify-between items-center px-1">
              <span>{n}</span><span className="text-gray-500">{q}</span><span className="font-semibold">{p}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center pt-1">
          <span className="px-2 py-1 border border-emerald-300 rounded bg-emerald-50 font-semibold">💵 Cash Refund</span>
          <span className="px-2 py-1 border border-emerald-200 rounded text-gray-500">💳 Patient Credit</span>
        </div>
      </div>
    </ScreenMockup>

    <SubSection title="Return Steps">
      <StepList steps={[
        "Search original transaction by receipt number",
        "Select items to return (partial or full) with quantity and reason",
        "Choose refund method: Cash Refund or Patient Credit",
        "Confirm — inventory restocked, stock movement logged",
      ]} />
    </SubSection>

    <SubSection title="Automatic Inventory Restocking">
      <FeatureList items={[
        "Returned items added back to inventory with original batch info",
        "Stock movement entry created with type 'Return' for audit trail",
        "FEFO integrity maintained — returned batches retain original expiry",
      ]} />
    </SubSection>

    <SubSection title="Returns Tracking">
      <FeatureList items={[
        "Each return assigned unique number: RET-XXXX",
        "Returns list with filters: date range, status, refund method",
        "Linked to original transaction for complete traceability",
      ]} />
    </SubSection>

    <TipBox title="Return Policy">
      Configure your return window and conditions in the receipt footer settings. The system does not enforce a return window — this is left to your pharmacy's operational policy.
    </TipBox>
  </DocPageWrapper>
);
