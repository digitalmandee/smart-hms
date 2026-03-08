import { DocPageWrapper, SectionTitle, FeatureList, SubSection, ScreenMockup, InfoCard, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const WhDocKpi = () => (
  <DocPageWrapper pageNumber={7} totalPages={7} moduleTitle="Warehouse Module Guide">
    <SectionTitle icon="📊" title="KPI Dashboard & Reports" subtitle="Operational metrics, performance tracking, and executive reporting" />
    <ScreenMockup title="Warehouse KPI Dashboard">
      <div className="grid grid-cols-4 gap-2">
        <InfoCard icon="📥" label="Receiving Efficiency" value="94%" />
        <InfoCard icon="📦" label="Put-Away Rate" value="87%" />
        <InfoCard icon="📋" label="Pick Accuracy" value="99.2%" />
        <InfoCard icon="🚚" label="On-Time Dispatch" value="96%" />
      </div>
    </ScreenMockup>
    <SubSection title="Key Performance Indicators">
      <MockupTable headers={["KPI", "Formula", "Target"]} rows={[
        ["Receiving Efficiency", "GRNs processed / GRNs received", "≥ 95%"],
        ["Put-Away Rate", "Items shelved within 4h / Total received", "≥ 90%"],
        ["Pick Accuracy", "Correct picks / Total picks", "≥ 99%"],
        ["Order Fill Rate", "Complete orders / Total orders", "≥ 98%"],
        ["Inventory Accuracy", "Matched counts / Total counts", "≥ 99%"],
        ["On-Time Dispatch", "Shipped on time / Total shipments", "≥ 95%"],
      ]} />
    </SubSection>
    <SubSection title="Available Reports">
      <FeatureList items={[
        "Stock Valuation Report — Current value by category/location",
        "Stock Movement Report — All ins/outs with source tracking",
        "Expiry Report — Items expiring in 30/60/90 days",
        "Dead Stock Report — No movement in configurable period",
        "Fast/Slow Moving Analysis — Consumption velocity ranking",
        "Vendor Performance — Delivery accuracy, lead time, quality",
        "Picking & Shipping Report — Daily throughput metrics",
        "Executive Dashboard — Multi-warehouse comparison view",
      ]} />
    </SubSection>
    <TipBox title="Shift Handover">End-of-shift handover report auto-generated with pending tasks, open issues, and KPI summary for incoming shift.</TipBox>
  </DocPageWrapper>
);
