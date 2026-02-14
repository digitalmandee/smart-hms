import { DocPageWrapper, SectionTitle, SubSection, TipBox } from "./DocPageWrapper";
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

    <SubSection title="Export & Print">
      <div className="text-sm text-foreground space-y-1">
        <p>• <strong>CSV Download</strong> — Export any report data as CSV for Excel/Google Sheets analysis</p>
        <p>• <strong>Print</strong> — Browser-optimized print layout with headers and page breaks</p>
        <p>• <strong>No data caps</strong> — All rows exported without truncation</p>
        <p>• <strong>Client-side pagination</strong> — 25 rows per page in the UI for readability</p>
      </div>
    </SubSection>

    <TipBox title="Drill-Down Architecture">
      The Reports Hub uses a card-based layout. Click any report card to drill into the detail view with charts, filters, and exportable data tables.
    </TipBox>
  </DocPageWrapper>
);
