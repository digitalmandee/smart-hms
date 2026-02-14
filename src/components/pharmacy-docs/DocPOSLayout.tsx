import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, ScreenMockup } from "./DocPageWrapper";

export const DocPOSLayout = () => (
  <DocPageWrapper pageNumber={7} totalPages={18}>
    <SectionTitle
      icon="🖥️"
      title="POS Terminal — Layout & Product Search"
      subtitle="Full-screen retail point-of-sale with barcode scanning and category filters"
    />

    <ScreenMockup title="POS Terminal — Split View">
      <div className="flex gap-2 text-[10px]">
        <div className="flex-1 border border-emerald-200 rounded p-2">
          <div className="bg-emerald-50 rounded px-2 py-1 mb-2 text-emerald-700 text-[9px]">🔍 Search medicines...</div>
          <div className="flex gap-1 mb-2 flex-wrap">
            {["All", "Analgesics", "Antibiotics", "Cardiac"].map(c => (
              <span key={c} className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-800 text-[8px]">{c}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[["Paracetamol 500mg", "2.50", "150"], ["Amoxicillin 250mg", "5.00", "80"], ["Omeprazole 20mg", "3.75", "200"], ["Cetirizine 10mg", "1.50", "95"]].map(([n,p,s]) => (
              <div key={n} className="border border-emerald-100 rounded p-1.5">
                <p className="font-semibold text-foreground truncate">{n}</p>
                <div className="flex justify-between text-muted-foreground"><span>{p}</span><span>Stk: {s}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[35%] border border-emerald-200 rounded p-2">
          <p className="font-semibold text-emerald-800 mb-1">🛒 Cart (2 items)</p>
          <div className="space-y-1 mb-2">
            <div className="flex justify-between"><span>Paracetamol x2</span><span>5.00</span></div>
            <div className="flex justify-between"><span>Omeprazole x1</span><span>3.75</span></div>
          </div>
          <div className="border-t border-emerald-200 pt-1 font-bold flex justify-between">
            <span>Total</span><span>8.75</span>
          </div>
          <div className="mt-2 bg-emerald-600 text-white text-center rounded py-1 text-[9px] font-semibold">Checkout (F12)</div>
        </div>
      </div>
    </ScreenMockup>

    <SubSection title="Barcode Scanning">
      <FeatureList items={[
        "Dedicated barcode input at the top — scan to auto-add to cart",
        "Supports USB, Bluetooth, and camera-based barcode scanners",
        "Unrecognized barcodes show an alert for manual lookup",
      ]} />
    </SubSection>

    <SubSection title="Keyboard Shortcuts">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[["F2", "Focus search"], ["F4", "Hold transaction"], ["F12", "Checkout"], ["Esc", "Cancel / Close"], ["↑ / ↓", "Navigate list"], ["Enter", "Add product"]].map(([key, desc]) => (
          <div key={key} className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono font-semibold">{key}</kbd>
            <span className="text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </SubSection>

    <TipBox title="Recent Products">
      The POS remembers your most frequently sold items and displays them in a 'Recent' tab for one-tap access during busy hours.
    </TipBox>
  </DocPageWrapper>
);
