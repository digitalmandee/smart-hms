/**
 * Professional PDF Export Utility
 * Generates print-ready reports with organization branding
 */

import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

export interface PDFColumn {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  format?: (value: any) => string;
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  filters?: { label: string; value: string }[];
  data: Record<string, any>[];
  columns: PDFColumn[];
  summaryRow?: Record<string, any>;
  orientation?: "portrait" | "landscape";
  organization?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

function formatValue(value: any, column: PDFColumn): string {
  if (value === null || value === undefined) return "-";
  if (column.format) return column.format(value);
  if (typeof value === "number") {
    // Check if it looks like currency
    if (column.key.includes("amount") || column.key.includes("revenue") || column.key.includes("price")) {
      return formatCurrency(value);
    }
    return value.toLocaleString();
  }
  return String(value);
}

function getAlignClass(align?: "left" | "center" | "right"): string {
  switch (align) {
    case "center": return "text-align: center;";
    case "right": return "text-align: right;";
    default: return "text-align: left;";
  }
}

export function generatePDFReport(options: PDFExportOptions): void {
  const {
    title,
    subtitle,
    dateRange,
    filters,
    data,
    columns,
    summaryRow,
    orientation = "portrait",
    organization,
  } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate PDF reports");
    return;
  }

  const currentDateTime = format(new Date(), "MMM dd, yyyy 'at' h:mm a");
  const dateRangeText = dateRange
    ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
    : "";
  const filterText = filters?.map(f => `${f.label}: ${f.value}`).join(" | ") || "";

  const logoHtml = organization?.logo_url
    ? `<img src="${organization.logo_url}" alt="Logo" style="height: 50px; margin-right: 15px;" />`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - Report</title>
  <style>
    @page {
      size: ${orientation === "landscape" ? "A4 landscape" : "A4 portrait"};
      margin: 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      line-height: 1.4;
      margin: 0;
      padding: 0;
    }
    
    .report-container {
      max-width: 100%;
    }
    
    /* Header */
    .report-header {
      border-bottom: 2px solid #1e40af;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .org-info {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .org-details {
      flex: 1;
    }
    
    .org-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e40af;
      margin: 0;
    }
    
    .org-address {
      font-size: 10px;
      color: #6b7280;
      margin: 3px 0 0 0;
    }
    
    .report-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 5px 0;
    }
    
    .report-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
    
    .report-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 10px;
      color: #6b7280;
      margin-top: 10px;
    }
    
    .meta-item {
      display: flex;
      gap: 5px;
    }
    
    .meta-label {
      font-weight: 600;
      color: #374151;
    }
    
    /* Table */
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    
    .report-table thead {
      background-color: #1e40af;
      color: white;
    }
    
    .report-table th {
      padding: 10px 8px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    
    .report-table td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .report-table tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    .report-table tbody tr:hover {
      background-color: #f3f4f6;
    }
    
    .summary-row {
      background-color: #1e40af !important;
      color: white !important;
      font-weight: 600;
    }
    
    .summary-row td {
      border-bottom: none;
      padding: 10px 8px;
    }
    
    /* Footer */
    .report-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #9ca3af;
    }
    
    /* Print styles */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .report-table thead {
        display: table-header-group;
      }
      
      .report-table tr {
        page-break-inside: avoid;
      }
      
      .no-print {
        display: none !important;
      }
    }
    
    /* Print button */
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    
    .print-button:hover {
      background: #1e3a8a;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
  
  <div class="report-container">
    <div class="report-header">
      <div class="org-info">
        ${logoHtml}
        <div class="org-details">
          <h1 class="org-name">${organization?.name || "SmartHMS"}</h1>
          ${organization?.address ? `<p class="org-address">${organization.address}</p>` : ""}
          ${organization?.phone || organization?.email ? 
            `<p class="org-address">${[organization.phone, organization.email].filter(Boolean).join(" | ")}</p>` 
            : ""}
        </div>
      </div>
      
      <h2 class="report-title">${title}</h2>
      ${subtitle ? `<p class="report-subtitle">${subtitle}</p>` : ""}
      
      <div class="report-meta">
        ${dateRangeText ? `<div class="meta-item"><span class="meta-label">Period:</span> ${dateRangeText}</div>` : ""}
        <div class="meta-item"><span class="meta-label">Generated:</span> ${currentDateTime}</div>
        ${filterText ? `<div class="meta-item"><span class="meta-label">Filters:</span> ${filterText}</div>` : ""}
      </div>
    </div>
    
    <table class="report-table">
      <thead>
        <tr>
          ${columns.map(col => `<th style="${getAlignClass(col.align)} ${col.width ? `width: ${col.width};` : ""}">${col.header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${columns.map(col => `<td style="${getAlignClass(col.align)}">${formatValue(row[col.key], col)}</td>`).join("")}
          </tr>
        `).join("")}
        ${summaryRow ? `
          <tr class="summary-row">
            ${columns.map(col => `<td style="${getAlignClass(col.align)}">${formatValue(summaryRow[col.key], col)}</td>`).join("")}
          </tr>
        ` : ""}
      </tbody>
    </table>
    
    <div class="report-footer">
      <div>Total Records: ${data.length}</div>
      <div>SmartHMS Report System</div>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateSimplePDF(title: string, content: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate PDF reports");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
  </style>
</head>
<body>
  ${content}
  <script>window.print();</script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
