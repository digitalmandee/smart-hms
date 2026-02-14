import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox } from "./DocPageWrapper";
import { LayoutDashboard } from "lucide-react";

export const DocDashboard = () => (
  <DocPageWrapper pageNumber={3} totalPages={18}>
    <SectionTitle
      icon={<LayoutDashboard className="w-5 h-5" />}
      title="Dashboard Overview"
      subtitle="Your pharmacy command center with real-time KPIs and quick actions"
    />

    <SubSection title="KPI Cards">
      <FeatureList items={[
        "Pending Prescriptions — Count of OPD/IPD prescriptions awaiting dispensing",
        "Dispensed Today — Total prescriptions fulfilled in the current session",
        "Low Stock Items — Medicines below configured reorder threshold",
        "Expiring Soon — Items approaching expiry within configured alert window",
      ]} />
    </SubSection>

    <SubSection title="Quick Actions">
      <FeatureList items={[
        "Medicine Catalog — Jump directly to browse and manage medicines",
        "Add Stock — Open stock entry (GRN) form to receive inventory",
        "View Inventory — Access full inventory list with batch details",
        "Open POS — Launch the point-of-sale terminal for retail sales",
      ]} />
    </SubSection>

    <SubSection title="Daily Sales Summary">
      <FeatureList items={[
        "Total revenue for the current day from POS transactions",
        "Transaction count and average basket size",
        "Breakdown by payment method (Cash, Card, Mobile Wallet)",
        "Comparison with previous day performance",
      ]} />
    </SubSection>

    <SubSection title="Prescription Queue Preview">
      <FeatureList items={[
        "Shows the most recent pending prescriptions from OPD/IPD",
        "Patient name, doctor, medication count, and priority indicator",
        "Click to navigate directly to the full prescription queue",
      ]} />
    </SubSection>

    <TipBox title="Responsive Design">
      On mobile devices, KPI cards stack vertically and the quick actions collapse into an expandable menu for easy one-handed operation.
    </TipBox>
  </DocPageWrapper>
);
