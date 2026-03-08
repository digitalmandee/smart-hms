import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox } from "./DocPageWrapper";

export const DocReportsPage2 = () => (
  <DocPageWrapper pageNumber={18} totalPages={19}>
    <SectionTitle
      icon="📊"
      title="Reports Hub — Detail Views"
      subtitle="Key report features, visualizations, and analytical capabilities"
    />

    <SubSection title="Sales Analytics">
      <FeatureList items={[
        "Daily Sales — Revenue trend chart with day-over-day comparison",
        "Hourly Analysis — Identify peak and off-peak selling hours",
        "Category Breakdown — Pie chart showing revenue share by medicine category",
        "Payment Methods — Distribution across Cash, Card, Wallet, and Credit",
        "Monthly Comparison — Side-by-side revenue comparison for trend analysis",
      ]} />
    </SubSection>

    <SubSection title="Inventory Analytics">
      <FeatureList items={[
        "Stock Valuation — Total inventory value at cost and selling price",
        "Expiry Report — Countdown view grouped by expiry month with value at risk",
        "Dead Stock — Items with zero movement in the selected period",
        "Inventory Turnover — Ratio of cost of goods sold to average inventory",
        "Stock Aging — Categorize stock by age: 0-30, 31-60, 61-90, 90+ days",
      ]} />
    </SubSection>

    <SubSection title="Financial Analytics">
      <FeatureList items={[
        "Profit Margin — Gross margin analysis per medicine and category",
        "Credit Sales — Outstanding amounts with aging buckets and patient details",
        "Daily Cash Summary — Expected vs. actual cash with variance tracking",
        "Tax Collection — Tax collected breakdown for regulatory filing",
      ]} />
    </SubSection>

    <SubSection title="Operational Analytics">
      <FeatureList items={[
        "Cashier Performance — Revenue per cashier, transaction count, average sale",
        "Peak Hours Heatmap — Visual grid showing busiest hours across the week",
        "Helps optimize staffing schedules and break times",
      ]} />
    </SubSection>

    <SubSection title="Visualization Standards">
      <FeatureList items={[
        "Professional monochrome aesthetic for corporate healthcare environments",
        "Trend charts use Recharts library with responsive sizing",
        "Tables implement client-side pagination (25 rows/page)",
        "All visualizations respect dark mode and light mode themes",
      ]} />
    </SubSection>

    <TipBox title="Store-Level Reporting">
      Run any report for a specific warehouse or across all stores. Use the global Store Selector to filter before generating reports.
    </TipBox>
  </DocPageWrapper>
);
