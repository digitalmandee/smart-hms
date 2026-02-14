import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";
import { Monitor } from "lucide-react";

export const DocPOSLayout = () => (
  <DocPageWrapper pageNumber={7} totalPages={18}>
    <SectionTitle
      icon={<Monitor className="w-5 h-5" />}
      title="POS Terminal — Layout & Product Search"
      subtitle="Full-screen retail point-of-sale with barcode scanning and category filters"
    />

    <SubSection title="Terminal Layout">
      <FeatureList items={[
        "Full-screen mode optimized for dedicated pharmacy counters",
        "Left Panel — Product search, category filters, and product grid",
        "Right Panel — Cart with line items, totals, and checkout controls",
        "Header bar shows session info, cashier name, and quick action buttons",
        "Responsive: adapts to tablet and desktop screen sizes",
      ]} />
    </SubSection>

    <SubSection title="Barcode Scanning">
      <FeatureList items={[
        "Dedicated barcode input field at the top of the product panel",
        "Scan any barcode/QR code — system matches against medicine barcode field",
        "Matched product auto-adds to cart with quantity 1",
        "Unrecognized barcodes show an alert for manual lookup",
        "Supports USB, Bluetooth, and camera-based barcode scanners",
      ]} />
    </SubSection>

    <SubSection title="Product Search & Categories">
      <FeatureList items={[
        "Type-ahead search by medicine name or generic name",
        "Category filter chips for quick narrowing (Analgesics, Antibiotics, etc.)",
        "Product cards show: Name, strength, available stock, selling price",
        "Click a product card to add it to the cart instantly",
        "Out-of-stock items are visually dimmed and cannot be added",
      ]} />
    </SubSection>

    <SubSection title="Keyboard Shortcuts">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["F2", "Focus search field"],
          ["F4", "Hold current transaction"],
          ["F12", "Proceed to checkout"],
          ["Esc", "Cancel / Close modal"],
          ["↑ / ↓", "Navigate product list"],
          ["Enter", "Add selected product"],
        ].map(([key, desc]) => (
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
