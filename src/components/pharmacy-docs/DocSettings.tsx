import { DocPageWrapper, SectionTitle, SubSection, TipBox } from "./DocPageWrapper";

export const DocSettings = () => (
  <DocPageWrapper pageNumber={18} totalPages={18}>
    <SectionTitle
      icon="⚙️"
      title="Settings & Configuration"
      subtitle="Customize pharmacy operations, tax, receipts, alerts, and compliance controls"
    />

    <SubSection title="Tax & Pricing">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="p-2 font-medium">Default Tax Rate</td><td className="p-2 text-muted-foreground">Applied to all POS transactions (e.g., 17% GST)</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Receipt Configuration">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="p-2 font-medium">Receipt Header</td><td className="p-2 text-muted-foreground">Organization name, license, and NTN (top of receipt)</td></tr>
            <tr className="border-t border-border"><td className="p-2 font-medium">Receipt Footer</td><td className="p-2 text-muted-foreground">Thank you message, contact info, return policy</td></tr>
            <tr className="border-t border-border"><td className="p-2 font-medium">Auto-Print Receipt</td><td className="p-2 text-muted-foreground">Automatically print after each completed transaction</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Inventory Alerts">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="p-2 font-medium">Low Stock Threshold</td><td className="p-2 text-muted-foreground">Default minimum stock level triggering alerts</td></tr>
            <tr className="border-t border-border"><td className="p-2 font-medium">Expiry Alert Days</td><td className="p-2 text-muted-foreground">Days before expiry to show warnings (e.g., 90 days)</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Operational Toggles">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="p-2 font-medium">Require Customer Name</td><td className="p-2 text-muted-foreground">Mandate patient/customer linking before checkout</td></tr>
            <tr className="border-t border-border"><td className="p-2 font-medium">Allow Held Transactions</td><td className="p-2 text-muted-foreground">Enable hold/recall feature in POS terminal</td></tr>
            <tr className="border-t border-border"><td className="p-2 font-medium">Controlled Substance Rx</td><td className="p-2 text-muted-foreground">Require prescription for scheduled/controlled drugs</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <TipBox title="Organization-Wide Settings">
      These settings apply to the entire pharmacy module. For store-specific configurations (e.g., different tax rates per branch), contact support for multi-tenant configuration.
    </TipBox>
  </DocPageWrapper>
);
