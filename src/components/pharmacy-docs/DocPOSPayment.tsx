import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";
import { CreditCard } from "lucide-react";

export const DocPOSPayment = () => (
  <DocPageWrapper pageNumber={9} totalPages={18}>
    <SectionTitle
      icon={<CreditCard className="w-5 h-5" />}
      title="POS Terminal — Payment & Receipt"
      subtitle="Multi-method payments, split billing, credit sales, and receipt configuration"
    />

    <SubSection title="Payment Methods">
      <FeatureList items={[
        "Cash — Enter amount received, system calculates change",
        "Card — Record card payment with optional reference number",
        "Mobile Wallet — JazzCash, EasyPaisa, or other configured wallets",
        "Split Payment — Combine any two methods (e.g., partial cash + card)",
      ]} />
    </SubSection>

    <SubSection title="Cash Payment Features">
      <FeatureList items={[
        "'Exact' button sets received amount to exact total (no rounding)",
        "Quick denomination buttons: 100, 500, 1000, 5000 for rapid entry",
        "Change due calculated and displayed prominently",
        "Cash drawer opens automatically on payment confirmation (if configured)",
      ]} />
    </SubSection>

    <SubSection title="Credit / Pay Later">
      <FeatureList items={[
        "Enable 'Pay Later' for linked patients with due date setting",
        "Credit limit validation against patient's allowed outstanding balance",
        "Outstanding balance tracked in patient profile and billing reports",
        "'Post to Patient Profile' for IPD patients — charges added to admission bill",
      ]} />
    </SubSection>

    <SubSection title="Receipt Printing">
      <FeatureList items={[
        "Receipt preview shows before printing with full transaction details",
        "Configurable header: Organization name, license number, tax registration",
        "Configurable footer: Thank you message, contact info, return policy",
        "Auto-print option available in Settings for high-volume counters",
        "Receipt includes: Items, quantities, prices, discounts, tax, payment method, change",
        "Reprint available from Transaction History at any time",
      ]} />
    </SubSection>

    <TipBox title="Tax Handling">
      The default tax rate is configured in Pharmacy Settings and applied automatically to all POS transactions. Individual items can be marked as tax-exempt in the medicine catalog.
    </TipBox>
  </DocPageWrapper>
);
