import { DocPageWrapper, SectionTitle, SubSection, TipBox, ScreenMockup } from "./DocPageWrapper";
import { BarChart3 } from "lucide-react";

const ReportCategory = ({ title, color, reports }: { title: string; color: string; reports: string[] }) => (
  <div className="mb-3">
    <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color }}>{title} ({reports.length})</h4>
    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-foreground">
      {reports.map((r, i) => (
        <div key={i} className="flex items-center gap-1.5 py-0.5">
          <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {r}
        </div>
      ))}
    </div>
  </div>
);

export const DocReports = () => (
  <DocPageWrapper pageNumber={16} totalPages={18}>
    <SectionTitle
      icon={<BarChart3 className="w-5 h-5" />}
      title="Reports Hub — 29 Reports"
      subtitle="Comprehensive analytics across sales, inventory, finance, procurement, and operations"
    />

    <ScreenMockup title="Reports Hub — Card Grid">
      <div className="grid grid-cols-4 gap-1.5 text-[9px]">
        {[
          ["📊", "Daily Sales", "Sales"],
          ["📦", "Stock Valuation", "Inventory"],
          ["💰", "Profit Margin", "Financial"],
          ["👤", "Cashier Perf.", "Operations"],
        ].map(([icon, name, cat]) => (
          <div key={name} className="border border-emerald-200 rounded p-2 text-center bg-emerald-50/50">
            <span className="text-base">{icon}</span>
            <p className="font-semibold text-foreground mt-0.5">{name}</p>
            <p className="text-muted-foreground">{cat}</p>
          </div>
        ))}
      </div>
    </ScreenMockup>

    <ReportCategory title="Sales Reports" color="#059669" reports={[
      "Daily Sales Summary", "Hourly Sales Analysis", "Sales by Category",
      "Payment Method Breakdown", "Discount Analysis", "Monthly Comparison",
      "Top Selling Products", "Customer-wise Sales", "Transaction Log",
      "Refund Rate Analysis", "Average Basket Size",
    ]} />

    <ReportCategory title="Inventory Reports" color="#2563eb" reports={[
      "Stock Valuation", "Expiry Report", "Low Stock / Reorder",
      "Dead Stock Analysis", "Stock Movements Log", "Batch-wise Stock",
      "Category Distribution", "Stock Aging Report", "Inventory Turnover",
    ]} />

    <ReportCategory title="Financial Reports" color="#7c3aed" reports={[
      "Profit Margin Analysis", "Returns & Refunds Summary",
      "Credit Sales Outstanding", "Daily Cash Summary", "Tax Collection Report",
    ]} />

    <ReportCategory title="Procurement Reports" color="#dc2626" reports={[
      "Supplier Purchase Summary", "PO Status Pipeline",
    ]} />

    <ReportCategory title="Operational Reports" color="#d97706" reports={[
      "Cashier Performance", "Peak Hours Heatmap",
    ]} />

    <TipBox title="Drill-Down Architecture">
      The Reports Hub uses a card-based layout. Click any report card to drill into the detail view with charts, filters, and exportable data tables.
    </TipBox>
  </DocPageWrapper>
);
