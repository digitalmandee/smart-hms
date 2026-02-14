import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, ScreenMockup } from "./DocPageWrapper";

export const DocPOSPayment = () => (
  <DocPageWrapper pageNumber={9} totalPages={18}>
    <SectionTitle
      icon="💳"
      title="POS Terminal — Payment & Receipt"
      subtitle="Multi-method payments, split billing, credit sales, and receipt configuration"
    />

    <ScreenMockup title="Payment Modal">
      <div className="text-[10px] space-y-2">
        <div className="text-center border-b border-emerald-200 pb-2">
          <p className="text-gray-500">Total Due</p>
          <p className="text-xl font-bold text-emerald-700">1,250.00</p>
        </div>
        <div className="flex gap-1.5 justify-center">
          {["💵 Cash", "💳 Card", "📱 Wallet"].map(m => (
            <span key={m} className="px-3 py-1.5 border border-emerald-300 rounded-md bg-emerald-50 font-semibold text-emerald-800">{m}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-emerald-50/50 rounded p-2 border border-emerald-200">
          <span className="text-gray-500">Cash Received:</span>
          <span className="font-bold flex-1">1,500.00</span>
          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-semibold">Exact</span>
        </div>
        <div className="flex justify-between px-2 font-semibold">
          <span>Change Due:</span>
          <span className="text-emerald-700">250.00</span>
        </div>
      </div>
    </ScreenMockup>

    <SubSection title="Payment Methods">
      <FeatureList items={[
        "Cash — Enter amount received, system calculates change",
        "Card — Record card payment with optional reference number",
        "Mobile Wallet — JazzCash, EasyPaisa, or other configured wallets",
        "Split Payment — Combine any two methods (e.g., partial cash + card)",
      ]} />
    </SubSection>

    <SubSection title="Credit / Pay Later">
      <FeatureList items={[
        "Enable 'Pay Later' for linked patients with due date setting",
        "Credit limit validation against patient's allowed outstanding balance",
        "'Post to Patient Profile' for IPD patients — charges added to admission bill",
      ]} />
    </SubSection>

    <SubSection title="Receipt Printing">
      <FeatureList items={[
        "Receipt preview with configurable header/footer",
        "Auto-print option for high-volume counters",
        "Reprint available from Transaction History at any time",
      ]} />
    </SubSection>

    <TipBox title="Tax Handling">
      The default tax rate is configured in Pharmacy Settings and applied automatically. Individual items can be marked as tax-exempt in the medicine catalog.
    </TipBox>
  </DocPageWrapper>
);
