import { DocPageWrapper, SectionTitle, SubSection, TipBox } from "./DocPageWrapper";

export const DocSettings = () => (
  <DocPageWrapper pageNumber={19} totalPages={19}>
    <SectionTitle
      icon="⚙️"
      title="Settings & Configuration"
      subtitle="Customize pharmacy operations, tax, receipts, alerts, and compliance controls"
    />

    <SubSection title="Tax & Pricing">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Default Tax Rate</td><td className="p-2 text-gray-500">Applied to all POS transactions (e.g., 17% GST)</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Receipt Configuration">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Receipt Header</td><td className="p-2 text-gray-500">Organization name, license, and NTN (top of receipt)</td></tr>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Receipt Footer</td><td className="p-2 text-gray-500">Thank you message, contact info, return policy</td></tr>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Auto-Print Receipt</td><td className="p-2 text-gray-500">Automatically print after each completed transaction</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Inventory Alerts">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Low Stock Threshold</td><td className="p-2 text-gray-500">Default minimum stock level triggering alerts</td></tr>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Expiry Alert Days</td><td className="p-2 text-gray-500">Days before expiry to show warnings (e.g., 90 days)</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="Operational Toggles">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50"><th className="text-left p-2 font-medium">Setting</th><th className="text-left p-2 font-medium">Description</th></tr></thead>
          <tbody>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Require Customer Name</td><td className="p-2 text-gray-500">Mandate patient/customer linking before checkout</td></tr>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Allow Held Transactions</td><td className="p-2 text-gray-500">Enable hold/recall feature in POS terminal</td></tr>
            <tr className="border-t border-gray-200"><td className="p-2 font-medium">Controlled Substance Rx</td><td className="p-2 text-gray-500">Require prescription for scheduled/controlled drugs</td></tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <TipBox title="Organization-Wide Settings">
      These settings apply to the entire pharmacy module. For store-specific configurations (e.g., different tax rates per branch), contact support for multi-tenant configuration.
    </TipBox>
  </DocPageWrapper>
);
