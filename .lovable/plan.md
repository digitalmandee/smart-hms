
# Reports System Audit & Enhancement Plan

## Executive Summary

After thoroughly analyzing the HMS reports system, I've identified the following status:

### Reports Using Real Data (Good)
| Report | Data Source | Filters | Export |
|--------|-------------|---------|--------|
| Department Revenue | `invoice_items` + `service_types` | Date, Branch | CSV only |
| Shift-wise Collection | `payments` table | Date, Branch, Shift | CSV only |
| Billing Reports | `useDailyCollections`, `useAgingReport` hooks | Date range | None |
| Lab Reports | `lab_orders` + `lab_order_items` | Date, Branch, Status | CSV |
| HR Reports | `useHRReports.ts` hooks (real employee/attendance data) | Year | None |
| Payroll Reports | `usePayrollRuns`, `useEmployeeSalaries` hooks | Year | None |
| Executive Dashboard | `useExecutiveSummary` (real multi-table aggregation) | Period | None |

### Reports with Hardcoded/Mock Data (Issues)
| Report | Issue | Location |
|--------|-------|----------|
| Pharmacy Reports | Payment breakdown is hardcoded mock data | `PharmacyReportsPage.tsx` lines 78-83 |
| Pharmacy Reports | Top selling medicines is hardcoded | `PharmacyReportsPage.tsx` lines 86-92 |
| IPD Reports | Reports are placeholder cards only - no actual data | `IPDReportsPage.tsx` |

### PDF Export Gaps (Critical)
| Issue | Current State |
|-------|---------------|
| No PDF Export | Only CSV + Print available via `ReportExportButton` |
| Print = window.print() | Basic browser print, no professional formatting |
| No branded PDF header | Missing organization logo/details |
| No report metadata | Missing date range, filters applied, generated timestamp |

---

## Phase 1: Fix Hardcoded Data Issues

### 1.1 Fix Pharmacy Reports (PharmacyReportsPage.tsx)

**Current Problem:**
```typescript
// Lines 78-83 - HARDCODED
const paymentBreakdown = [
  { name: "Cash", value: 65, color: "#22c55e" },
  { name: "Card", value: 20, color: "#3b82f6" },
  // ...
];

// Lines 86-92 - HARDCODED
const topMedicines = [
  { name: "Panadol 500mg", quantity: 245, revenue: 4900 },
  // ...
];
```

**Fix Required:**
- Create `usePharmacyReports.ts` hook with:
  - `usePaymentMethodBreakdown(dateFrom, dateTo)` - aggregate from `pharmacy_pos_transactions` joined with `payment_methods`
  - `useTopSellingMedicines(dateFrom, dateTo, limit)` - aggregate from `pharmacy_pos_transaction_items` grouped by medicine

### 1.2 Fix IPD Reports (IPDReportsPage.tsx)

**Current Problem:**
- Only shows placeholder cards with "Generate Report" buttons that do nothing
- No actual data queries for any of the 6 listed reports

**Fix Required:**
- Create `useIPDReports.ts` hook with:
  - `useBedOccupancyReport(dateFrom, dateTo)` - from `admissions` + `beds` tables
  - `useAdmissionStatistics(dateFrom, dateTo)` - admission trends
  - `useDischargeReport(dateFrom, dateTo)` - discharge stats
  - `useWardCensus()` - current census by ward
  - `useAverageLOS(dateFrom, dateTo)` - length of stay analytics
  - `useDailyMovement(date)` - daily admissions/discharges/transfers

---

## Phase 2: Implement Professional PDF Export

### 2.1 Create PDF Generation Utility

**New File: `src/lib/pdfExport.ts`**

Features:
- Generate formatted PDF using browser print with custom styling
- Include organization branding (logo, name, address)
- Report title with date range and filters applied
- Professional table formatting with borders
- Page numbers and generation timestamp
- Proper page breaks for tables

```typescript
interface PDFExportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  filters?: { label: string; value: string }[];
  data: any[];
  columns: { key: string; header: string; width?: string; align?: 'left' | 'center' | 'right' }[];
  summaryRow?: Record<string, any>;
  orientation?: 'portrait' | 'landscape';
}

export function generatePDFReport(options: PDFExportOptions): void {
  // Opens print window with professionally formatted report
}
```

### 2.2 Update ReportExportButton Component

**Enhanced `src/components/reports/ReportExportButton.tsx`:**

Add:
- "Export PDF" option in dropdown
- Accept `pdfOptions` prop for customization
- Include organization branding fetch via `useOrganizationBranding`

```typescript
<DropdownMenuItem onClick={handleExportPDF}>
  <FileText className="h-4 w-4 mr-2" />
  Export PDF
</DropdownMenuItem>
```

### 2.3 Create Printable Report Template Component

**New File: `src/components/reports/PrintableReport.tsx`**

Reusable component for generating print-ready reports:
- Organization header with logo
- Report title and metadata
- Filter summary section
- Data table with proper styling
- Summary/totals row
- Footer with page numbers

---

## Phase 3: Enhance Existing Reports

### 3.1 Add Export to All Report Pages

| Page | Current Export | Add PDF |
|------|----------------|---------|
| `DepartmentRevenueReport.tsx` | CSV | Yes |
| `ShiftWiseCollectionReport.tsx` | CSV | Yes |
| `BillingReportsPage.tsx` | None | CSV + PDF |
| `LabReportsPage.tsx` | CSV | Yes |
| `HRReportsPage.tsx` | Basic | CSV + PDF |
| `PayrollReportsPage.tsx` | None | CSV + PDF |
| `ExecutiveDashboardReport.tsx` | None | PDF |

### 3.2 Add Missing Filters

| Page | Missing Filters to Add |
|------|------------------------|
| `BillingReportsPage.tsx` | Branch, Department |
| `PayrollReportsPage.tsx` | Department, Employee Type |
| `HRReportsPage.tsx` | Department |
| `PharmacyReportsPage.tsx` | Branch, Category |

---

## Implementation Details

### New Files to Create

1. **`src/lib/pdfExport.ts`** - PDF generation utility with professional formatting
2. **`src/hooks/usePharmacyReports.ts`** - Real data hooks for pharmacy analytics
3. **`src/hooks/useIPDReports.ts`** - Real data hooks for IPD analytics
4. **`src/components/reports/PrintableReport.tsx`** - Reusable print template

### Files to Modify

1. **`src/components/reports/ReportExportButton.tsx`** - Add PDF export option
2. **`src/pages/app/pharmacy/PharmacyReportsPage.tsx`** - Replace hardcoded data
3. **`src/pages/app/ipd/IPDReportsPage.tsx`** - Implement actual reports
4. **`src/pages/app/billing/BillingReportsPage.tsx`** - Add export buttons
5. **`src/pages/app/hr/HRReportsPage.tsx`** - Add export functionality
6. **`src/pages/app/hr/payroll/PayrollReportsPage.tsx`** - Add export functionality
7. **`src/pages/app/reports/ExecutiveDashboardReport.tsx`** - Add PDF export

---

## PDF Report Format Specification

### Header Section
```
┌─────────────────────────────────────────────────────────────────┐
│  [Organization Logo]    ORGANIZATION NAME                       │
│                         Address Line 1, City                     │
│                         Phone: +92-xxx | Email: xxx@xxx.com     │
├─────────────────────────────────────────────────────────────────┤
│  REPORT TITLE                                                    │
│  Period: Jan 01, 2026 - Jan 28, 2026                            │
│  Generated: Jan 28, 2026 at 3:45 PM                             │
│  Filters: Branch: Main Hospital | Department: All               │
└─────────────────────────────────────────────────────────────────┘
```

### Data Table
```
┌──────────┬───────────────┬────────────┬────────────────┬──────────┐
│ Date     │ Invoice #     │ Patient    │ Department     │ Amount   │
├──────────┼───────────────┼────────────┼────────────────┼──────────┤
│ Jan 28   │ INV-2026-001  │ John Doe   │ OPD            │ Rs. 500  │
│ Jan 28   │ INV-2026-002  │ Jane Smith │ Laboratory     │ Rs. 1500 │
│ ...      │ ...           │ ...        │ ...            │ ...      │
├──────────┼───────────────┼────────────┼────────────────┼──────────┤
│ TOTAL    │ 45 Records    │            │                │ Rs. 45K  │
└──────────┴───────────────┴────────────┴────────────────┴──────────┘
```

### Footer
```
┌─────────────────────────────────────────────────────────────────┐
│  Page 1 of 3                          SmartHMS Report System    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

| Category | Files | Key Changes |
|----------|-------|-------------|
| Fix Hardcoded Data | 2 pages, 2 new hooks | Replace mock with Supabase queries |
| PDF Export | 1 utility, 1 component | Professional print-to-PDF with branding |
| Add Export Buttons | 6 report pages | Add ReportExportButton with PDF option |
| Add Filters | 4 report pages | Branch, Department, Category filters |

This comprehensive fix ensures all reports use real database data and provide professional PDF export functionality with organization branding and proper formatting.
