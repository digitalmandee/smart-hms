import { DocPageWrapper, SectionTitle, FeatureList, SubSection, TipBox, ScreenMockup, InfoCard } from "./DocPageWrapper";
import { LayoutDashboard, Clock, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

export const DocDashboard = () => (
  <DocPageWrapper pageNumber={3} totalPages={18}>
    <SectionTitle
      icon={<LayoutDashboard className="w-5 h-5" />}
      title="Dashboard Overview"
      subtitle="Your pharmacy command center with real-time KPIs and quick actions"
    />

    <ScreenMockup title="Pharmacy Dashboard">
      <div className="grid grid-cols-4 gap-2">
        <InfoCard icon={<Clock className="w-4 h-4" />} label="Pending Rx" value="12" />
        <InfoCard icon={<CheckCircle className="w-4 h-4" />} label="Dispensed Today" value="45" />
        <InfoCard icon={<AlertTriangle className="w-4 h-4" />} label="Low Stock Items" value="8" />
        <InfoCard icon={<Calendar className="w-4 h-4" />} label="Expiring Soon" value="3" />
      </div>
    </ScreenMockup>

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
