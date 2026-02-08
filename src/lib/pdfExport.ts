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

export interface DayEndSummaryPDFOptions {
  summary: {
    date: string;
    branchName?: string | null;
    invoices: {
      created: { invoiceNumber: string; patientName: string; totalAmount: number; paidAmount: number; status: string; createdByName: string | null; departments: string[] }[];
      totalCount: number;
      totalAmount: number;
      paidCount: number;
      paidAmount: number;
      pendingCount: number;
      pendingAmount: number;
      partialCount: number;
      byDepartment: { department: string; amount: number; count: number }[];
    };
    collections: {
      byMethod: { method: string; amount: number; count: number }[];
      byDepartment: { department: string; amount: number; count: number }[];
      totalCash: number;
      totalNonCash: number;
      grandTotal: number;
    };
    payouts: {
      doctorSettlements: {
        total: number;
        cashTotal: number;
        items: { doctorName: string; amount: number; settlementNumber: string; paymentMethod: string | null }[];
      };
      vendorPayments: {
        total: number;
        cashTotal: number;
        items: { vendorName: string; amount: number; paymentNumber: string; paymentMethod: string | null }[];
      };
      expenses: {
        total: number;
        items: { description: string; amount: number; category?: string | null; paidTo?: string | null; expenseNumber?: string }[];
      };
      totalPayouts: number;
      totalCashPayouts: number;
    };
    reconciliation: {
      totalCashCollected: number;
      cashPayouts: number;
      netCashToSubmit: number;
    };
    outstanding: {
      pendingInvoices: number;
      pendingAmount: number;
      creditGivenToday: number;
      creditRecoveredToday: number;
    };
  };
  organization?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

export function generateDayEndSummaryPDF(options: DayEndSummaryPDFOptions): void {
  const { summary, organization } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate PDF reports");
    return;
  }

  const currentDateTime = format(new Date(), "MMM dd, yyyy 'at' h:mm a");
  const reportDate = format(new Date(summary.date), "MMMM dd, yyyy");

  const logoHtml = organization?.logo_url
    ? `<img src="${organization.logo_url}" alt="Logo" style="height: 50px; margin-right: 15px;" />`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Day-End Summary - ${reportDate}</title>
  <style>
    @page {
      size: A4 portrait;
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
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 5px 0;
    }
    
    .report-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }
    
    .summary-card.collections { background: #ecfdf5; border-color: #10b981; }
    .summary-card.payouts { background: #fef2f2; border-color: #ef4444; }
    .summary-card.net { background: #eff6ff; border-color: #3b82f6; }
    .summary-card.outstanding { background: #faf5ff; border-color: #8b5cf6; }
    
    .summary-label {
      font-size: 9px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 16px;
      font-weight: 700;
    }
    
    .collections .summary-value { color: #059669; }
    .payouts .summary-value { color: #dc2626; }
    .net .summary-value { color: #2563eb; }
    .outstanding .summary-value { color: #7c3aed; }
    
    .section {
      margin: 20px 0;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    .data-table th {
      background: #f3f4f6;
      padding: 8px;
      text-align: left;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .data-table td {
      padding: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .data-table .text-right {
      text-align: right;
    }
    
    .data-table .total-row {
      background: #f9fafb;
      font-weight: 600;
    }
    
    .reconciliation-box {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .reconciliation-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #dbeafe;
    }
    
    .reconciliation-row:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 14px;
      padding-top: 10px;
      border-top: 2px solid #3b82f6;
      margin-top: 8px;
    }
    
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin-top: 60px;
      padding-top: 20px;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      border-bottom: 1px solid #1a1a1a;
      height: 40px;
      margin-bottom: 8px;
    }
    
    .signature-label {
      font-size: 10px;
      color: #6b7280;
    }
    
    .report-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #9ca3af;
    }
    
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
    
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
  
  <div class="report-container">
    <div class="report-header">
      <div class="org-info">
        ${logoHtml}
        <div>
          <h1 class="org-name">${organization?.name || "SmartHMS"}</h1>
          ${organization?.address ? `<p class="org-address">${organization.address}</p>` : ""}
          ${organization?.phone || organization?.email ? 
            `<p class="org-address">${[organization.phone, organization.email].filter(Boolean).join(" | ")}</p>` 
            : ""}
        </div>
      </div>
      
      <h2 class="report-title">Day-End Financial Summary</h2>
      <p class="report-subtitle">${reportDate}${summary.branchName ? ` • ${summary.branchName}` : ""} • Generated: ${currentDateTime}</p>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card" style="background: #eef2ff; border-color: #6366f1;">
        <div class="summary-label">Invoices Created</div>
        <div class="summary-value" style="color: #4f46e5;">${summary.invoices.totalCount}</div>
        <div style="font-size: 9px; color: #6b7280;">${formatCurrency(summary.invoices.totalAmount)}</div>
      </div>
      <div class="summary-card collections">
        <div class="summary-label">Total Collections</div>
        <div class="summary-value">${formatCurrency(summary.collections.grandTotal)}</div>
      </div>
      <div class="summary-card net">
        <div class="summary-label">Net Cash to Submit</div>
        <div class="summary-value">${formatCurrency(summary.reconciliation.netCashToSubmit)}</div>
      </div>
      <div class="summary-card outstanding">
        <div class="summary-label">Outstanding</div>
        <div class="summary-value">${formatCurrency(summary.outstanding.pendingAmount)}</div>
      </div>
    </div>
    
    <!-- Invoice Summary -->
    <div class="section">
      <h3 class="section-title">Invoice Summary</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
        <div style="padding: 8px; background: #f9fafb; border-radius: 6px; text-align: center;">
          <div style="font-size: 9px; color: #6b7280;">Created</div>
          <div style="font-size: 14px; font-weight: 600;">${summary.invoices.totalCount}</div>
          <div style="font-size: 9px; color: #6b7280;">${formatCurrency(summary.invoices.totalAmount)}</div>
        </div>
        <div style="padding: 8px; background: #ecfdf5; border-radius: 6px; text-align: center;">
          <div style="font-size: 9px; color: #059669;">Paid</div>
          <div style="font-size: 14px; font-weight: 600; color: #059669;">${summary.invoices.paidCount}</div>
          <div style="font-size: 9px; color: #059669;">${formatCurrency(summary.invoices.paidAmount)}</div>
        </div>
        <div style="padding: 8px; background: #fef3c7; border-radius: 6px; text-align: center;">
          <div style="font-size: 9px; color: #d97706;">Pending</div>
          <div style="font-size: 14px; font-weight: 600; color: #d97706;">${summary.invoices.pendingCount}</div>
          <div style="font-size: 9px; color: #d97706;">${formatCurrency(summary.invoices.pendingAmount)}</div>
        </div>
        <div style="padding: 8px; background: #dbeafe; border-radius: 6px; text-align: center;">
          <div style="font-size: 9px; color: #2563eb;">Partial</div>
          <div style="font-size: 14px; font-weight: 600; color: #2563eb;">${summary.invoices.partialCount}</div>
        </div>
      </div>
      
      <!-- By Department -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Department</th>
            <th class="text-right">Items</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summary.invoices.byDepartment.map(item => `
            <tr>
              <td>${item.department}</td>
              <td class="text-right">${item.count}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td>Total Invoiced</td>
            <td class="text-right">${summary.invoices.byDepartment.reduce((sum, i) => sum + i.count, 0)}</td>
            <td class="text-right">${formatCurrency(summary.invoices.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Collections by Method -->
    <div class="section">
      <h3 class="section-title">Collections by Payment Method</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Method</th>
            <th class="text-right">Count</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summary.collections.byMethod.map(item => `
            <tr>
              <td>${item.method}</td>
              <td class="text-right">${item.count}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td>Total</td>
            <td class="text-right">${summary.collections.byMethod.reduce((sum, i) => sum + i.count, 0)}</td>
            <td class="text-right">${formatCurrency(summary.collections.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Doctor Settlements -->
    ${summary.payouts.doctorSettlements.items.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Doctor Settlements (${summary.payouts.doctorSettlements.items.length})</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Settlement #</th>
            <th>Doctor</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summary.payouts.doctorSettlements.items.map(item => `
            <tr>
              <td>${item.settlementNumber}</td>
              <td>${item.doctorName}</td>
              <td>${item.paymentMethod || "Cash"}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="3">Total Doctor Settlements</td>
            <td class="text-right">${formatCurrency(summary.payouts.doctorSettlements.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ""}
    
    <!-- Vendor Payments -->
    ${summary.payouts.vendorPayments.items.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Vendor Payments (${summary.payouts.vendorPayments.items.length})</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Payment #</th>
            <th>Vendor</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summary.payouts.vendorPayments.items.map(item => `
            <tr>
              <td>${item.paymentNumber}</td>
              <td>${item.vendorName}</td>
              <td>${item.paymentMethod || "-"}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="3">Total Vendor Payments</td>
            <td class="text-right">${formatCurrency(summary.payouts.vendorPayments.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ""}
    
    <!-- Expenses -->
    ${summary.payouts.expenses.items.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Expenses/Petty Cash (${summary.payouts.expenses.items.length})</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Expense #</th>
            <th>Description</th>
            <th>Category</th>
            <th>Paid To</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summary.payouts.expenses.items.map(item => `
            <tr>
              <td>${item.expenseNumber || '-'}</td>
              <td>${item.description}</td>
              <td>${item.category || 'Other'}</td>
              <td>${item.paidTo || '-'}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="4">Total Expenses</td>
            <td class="text-right">${formatCurrency(summary.payouts.expenses.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ""}
    
    <!-- Cash Reconciliation -->
    <div class="reconciliation-box">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e40af;">Cash Reconciliation</h3>
      <div class="reconciliation-row">
        <span>Total Cash Collected</span>
        <span style="color: #059669;">+ ${formatCurrency(summary.reconciliation.totalCashCollected)}</span>
      </div>
      <div class="reconciliation-row">
        <span>Less: Doctor Settlements (Cash)</span>
        <span style="color: #dc2626;">- ${formatCurrency(summary.payouts.doctorSettlements.cashTotal)}</span>
      </div>
      <div class="reconciliation-row">
        <span>Less: Vendor Payments (Cash)</span>
        <span style="color: #dc2626;">- ${formatCurrency(summary.payouts.vendorPayments.cashTotal)}</span>
      </div>
      <div class="reconciliation-row">
        <span>Less: Expenses/Petty Cash</span>
        <span style="color: #dc2626;">- ${formatCurrency(summary.payouts.expenses.total)}</span>
      </div>
      <div class="reconciliation-row">
        <span>Net Cash to Submit</span>
        <span style="color: #2563eb;">= ${formatCurrency(summary.reconciliation.netCashToSubmit)}</span>
      </div>
    </div>
    
    <!-- Credit Tracking -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding: 12px; background: #f9fafb; border-radius: 8px;">
      <div>
        <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Credit Given Today</div>
        <div style="font-size: 14px; font-weight: 600; color: #dc2626;">${formatCurrency(summary.outstanding.creditGivenToday)}</div>
      </div>
      <div>
        <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Credit Recovered Today</div>
        <div style="font-size: 14px; font-weight: 600; color: #059669;">${formatCurrency(summary.outstanding.creditRecoveredToday)}</div>
      </div>
    </div>
    
    <!-- Signatures -->
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Prepared By (Cashier)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Verified By (Manager)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Received By (Accountant)</div>
      </div>
    </div>
    
    <div class="report-footer">
      <div>Outstanding: ${summary.outstanding.pendingInvoices} invoices (${formatCurrency(summary.outstanding.pendingAmount)})</div>
      <div>SmartHMS Day-End Report</div>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
