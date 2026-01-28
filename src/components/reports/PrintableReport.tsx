import React from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";

export interface PrintableColumn {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  format?: (value: any) => string;
}

export interface PrintableReportProps {
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  filters?: { label: string; value: string }[];
  data: Record<string, any>[];
  columns: PrintableColumn[];
  summaryRow?: Record<string, any>;
  organization?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ title, subtitle, dateRange, filters, data, columns, summaryRow, organization }, ref) => {
    const currentDateTime = format(new Date(), "MMM dd, yyyy 'at' h:mm a");
    const dateRangeText = dateRange
      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
      : "";

    const formatValue = (value: any, column: PrintableColumn): string => {
      if (value === null || value === undefined) return "-";
      if (column.format) return column.format(value);
      if (typeof value === "number") {
        if (column.key.includes("amount") || column.key.includes("revenue") || column.key.includes("price")) {
          return formatCurrency(value);
        }
        return value.toLocaleString();
      }
      return String(value);
    };

    const getAlignClass = (align?: "left" | "center" | "right"): string => {
      switch (align) {
        case "center": return "text-center";
        case "right": return "text-right";
        default: return "text-left";
      }
    };

    return (
      <div ref={ref} className="bg-white p-8 print:p-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Header */}
        <div className="border-b-2 border-primary pb-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {organization?.logo_url && (
              <img src={organization.logo_url} alt="Logo" className="h-12" />
            )}
            <div>
              <h1 className="text-xl font-bold text-primary">
                {organization?.name || "SmartHMS"}
              </h1>
              {organization?.address && (
                <p className="text-xs text-muted-foreground">{organization.address}</p>
              )}
              {(organization?.phone || organization?.email) && (
                <p className="text-xs text-muted-foreground">
                  {[organization.phone, organization.email].filter(Boolean).join(" | ")}
                </p>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}

          <div className="flex flex-wrap gap-6 mt-3 text-xs text-muted-foreground">
            {dateRangeText && (
              <div>
                <span className="font-semibold text-foreground">Period:</span> {dateRangeText}
              </div>
            )}
            <div>
              <span className="font-semibold text-foreground">Generated:</span> {currentDateTime}
            </div>
            {filters && filters.length > 0 && (
              <div>
                <span className="font-semibold text-foreground">Filters:</span>{" "}
                {filters.map(f => `${f.label}: ${f.value}`).join(" | ")}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-2 font-semibold uppercase text-xs ${getAlignClass(col.align)}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-2 border-b border-border ${getAlignClass(col.align)}`}
                  >
                    {formatValue(row[col.key], col)}
                  </td>
                ))}
              </tr>
            ))}
            {summaryRow && (
              <tr className="bg-primary text-primary-foreground font-semibold">
                {columns.map((col) => (
                  <td key={col.key} className={`p-2 ${getAlignClass(col.align)}`}>
                    {formatValue(summaryRow[col.key], col)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
          <div>Total Records: {data.length}</div>
          <div>SmartHMS Report System</div>
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = "PrintableReport";
