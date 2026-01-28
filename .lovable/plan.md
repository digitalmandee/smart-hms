

# Reports System Analysis and Enhancement Plan

## Executive Summary

After analyzing the HMS codebase, I found **15+ existing report pages** but with significant gaps in depth, filters, pagination, and coverage. The reports lack proper **department-wise revenue breakdown**, **shift-wise analysis**, and advanced filtering/pagination capabilities.

---

## Current Reports Inventory

### Clinical Reports (6)
| Report | Location | Filters | Pagination | Charts | Export | Status |
|--------|----------|---------|------------|--------|--------|--------|
| Clinic Reports | `/app/clinic/reports` | Date | No | Basic | No | Basic |
| Patient Reports | `/app/patients/reports` | Date | No | No | No | Placeholder |
| Appointment Reports | `/app/appointments/reports` | Date | No | No | No | Placeholder |
| Doctor Reports | `/app/opd/reports` | Date, Branch, Doctor | No | Yes | CSV | Good |
| Lab Reports | `/app/lab/reports` | Date, Branch, Status | No | Yes | CSV | Good |
| ER Reports | `/app/emergency/reports` | Date, Branch, Status | No | Yes | CSV | Good |

### Operational Reports (3)
| Report | Location | Filters | Pagination | Charts | Export | Status |
|--------|----------|---------|------------|--------|--------|--------|
| IPD Reports | `/app/ipd/reports` | None | No | No | No | Placeholder |
| Pharmacy Reports | `/app/pharmacy/reports` | Date, Type | No | Yes | Yes | Good |
| Inventory Reports | `/app/inventory/reports` | None | No | No | No | Index Only |

### Financial Reports (5)
| Report | Location | Filters | Pagination | Charts | Export | Status |
|--------|----------|---------|------------|--------|--------|--------|
| Billing Reports | `/app/billing/reports` | Date Range | No | Yes | No | Good |
| Trial Balance | `/app/accounts/reports/trial-balance` | Date | No | No | No | Basic |
| P&L Statement | `/app/accounts/reports/profit-loss` | Date | No | No | No | Basic |
| Balance Sheet | `/app/accounts/reports/balance-sheet` | Date | No | No | No | Basic |
| Cash Flow | `/app/accounts/reports/cash-flow` | Date | No | No | No | Basic |

### HR Reports (5)
| Report | Location | Filters | Pagination | Charts | Export | Status |
|--------|----------|---------|------------|--------|--------|--------|
| HR Analytics | `/app/hr/reports` | Year | No | Yes | Basic | Good |
| Attendance Reports | `/app/hr/attendance/reports` | Date | No | Basic | No | Basic |
| Payroll Reports | `/app/hr/payroll/reports` | Year | No | Yes | Basic | Good |
| Performance Reports | `/app/hr/reports/performance` | None | No | No | No | Placeholder |
| Roster Reports | `/app/hr/attendance/roster-reports` | Month, Dept | No | No | No | Basic |

### Management Reports (2)
| Report | Location | Filters | Pagination | Charts | Export | Status |
|--------|----------|---------|------------|--------|--------|--------|
| Executive Dashboard | `/app/reports/executive` | Period (This/Last Month) | No | Yes | Yes | Good |
| Branch Comparison | `/app/reports/branch-comparison` | None | No | No | No | Placeholder |

---

## Identified Gaps

### 1. Missing Reports (Critical)

**Department-wise Revenue Report**
- No breakdown of revenue by OPD, IPD, Lab, Radiology, Pharmacy, Surgery
- Cannot identify which departments are profit centers
- Essential for hospital administration

**Shift-wise Reports**
- No report showing collections/activity by Morning/Evening/Night shift
- Cannot analyze peak hours properly
- No cashier-wise collection summary

**Doctor Earnings Report (Detailed)**
- Basic doctor performance exists but lacks:
  - Procedure-wise earnings
  - Consultation vs Surgery split
  - Monthly trend comparison

**Patient Flow Report**
- No report on patient journey time (registration to checkout)
- Missing bottleneck analysis
- No average wait time by department

**Insurance Claims Report**
- No aging analysis for claims
- Missing rejection rate tracking
- No payer-wise collection summary

### 2. Missing Filters

| Report | Missing Filters |
|--------|-----------------|
| All Reports | Shift filter (Morning/Evening/Night) |
| Billing Reports | Department, Payment Method, Cashier |
| Doctor Reports | Specialty, Procedure Type |
| IPD Reports | Ward, Bed Type, Consultant |
| Lab Reports | Test Category, Urgency |
| Pharmacy Reports | Category, Vendor, Expiry Range |
| HR Reports | Department, Designation, Employment Type |

### 3. Missing Features

- **Pagination**: No report has proper server-side pagination
- **Drill-down**: Cannot click on chart segments to see details
- **Comparison**: No period-over-period comparison (vs last month/year)
- **Custom Date Presets**: Limited to basic presets
- **Scheduled Reports**: No automated email delivery
- **Save Filters**: Cannot save favorite filter combinations

---

## Proposed New Reports

### Finance & Revenue (5 new)

1. **Department-wise Revenue Report**
   - Revenue breakdown by OPD, IPD, Lab, Radiology, Pharmacy, Surgery, Emergency
   - Bar chart and table view
   - Filters: Date, Branch, Department
   - Drill-down to see transactions

2. **Shift-wise Collection Report**
   - Collections by Morning (6AM-2PM), Evening (2PM-10PM), Night (10PM-6AM)
   - Cashier-wise breakdown
   - Filters: Date, Branch, Shift, Cashier/User
   - Payment method split per shift

3. **Daily/Monthly Revenue Comparison**
   - Compare current period vs previous period
   - Percentage change indicators
   - Year-over-year trends

4. **Outstanding Dues Aging Report**
   - Enhanced aging buckets (0-30, 31-60, 61-90, 90+ days)
   - Patient-wise outstanding list with contact info
   - Follow-up action tracking

5. **Payment Method Analysis**
   - Cash vs Card vs Online vs Credit breakdown
   - Trend over time
   - Filters: Date, Branch, Department

### HR & Payroll (4 new)

6. **Shift-wise Attendance Report**
   - Attendance by shift timing
   - Late arrivals per shift
   - Overtime by shift

7. **Department Headcount & Cost Report**
   - Employee count per department
   - Total salary cost per department
   - Cost per employee trends

8. **Leave Utilization Report**
   - Leave balance vs used
   - Department-wise leave patterns
   - Peak leave periods

9. **Employee Turnover Report**
   - Monthly/yearly turnover rate
   - Exit reasons analysis
   - Department-wise attrition

### Accounts (3 new)

10. **Vendor Payment Report**
    - Vendor-wise payment history
    - Outstanding AP aging
    - Payment schedule calendar

11. **Expense Analysis Report**
    - Expense by category
    - Department-wise expense
    - Budget vs Actual comparison

12. **Daily Transaction Report**
    - All financial transactions for a day
    - Journal entries summary
    - Bank reconciliation support

### Clinical (3 new)

13. **Patient Wait Time Report**
    - Average wait time by department
    - Peak hours identification
    - Bottleneck analysis

14. **Consultation Summary Report**
    - Doctor-wise consultation count
    - Follow-up vs New patient ratio
    - Diagnosis distribution

15. **Procedure Volume Report**
    - Surgery count by type
    - Lab test volume by category
    - Radiology procedure distribution

---

## Technical Implementation

### Enhanced ReportFilters Component
Add support for:
- Shift filter (morning/evening/night)
- Department filter
- Cashier/User filter
- Category filter
- Custom date range presets
- Save filter preferences

### Create Reusable Report Components

```
src/components/reports/
  ReportFilters.tsx (existing - enhance)
  ReportTable.tsx (new - with pagination)
  ReportChart.tsx (new - reusable charts)
  ReportExport.tsx (new - PDF/Excel/CSV)
  ReportDrillDown.tsx (new - click to expand)
  ReportComparison.tsx (new - period comparison)
```

### New Hooks for Reports

```
src/hooks/
  useDepartmentRevenue.ts
  useShiftWiseCollection.ts
  usePatientFlowAnalytics.ts
  useEmployeeCostAnalytics.ts
  useReportPagination.ts
```

### Database Considerations

Some reports may require:
- Adding `shift` column to transactions/attendance
- Creating materialized views for performance
- Adding indexes on report query columns

---

## File Changes Summary

### New Pages (15 files)
```
src/pages/app/reports/
  DepartmentRevenueReport.tsx
  ShiftWiseCollectionReport.tsx
  RevenueComparisonReport.tsx
  OutstandingAgingReport.tsx
  PaymentMethodAnalysisReport.tsx
  PatientWaitTimeReport.tsx
  ConsultationSummaryReport.tsx
  ProcedureVolumeReport.tsx

src/pages/app/hr/reports/
  ShiftAttendanceReport.tsx
  DepartmentCostReport.tsx
  LeaveUtilizationReport.tsx
  TurnoverReport.tsx

src/pages/app/accounts/
  VendorPaymentReport.tsx
  ExpenseAnalysisReport.tsx
  DailyTransactionReport.tsx
```

### Enhanced Pages (10 files)
```
src/pages/app/billing/BillingReportsPage.tsx - Add department, shift filters
src/pages/app/pharmacy/PharmacyReportsPage.tsx - Add pagination, category filter
src/pages/app/lab/LabReportsPage.tsx - Add pagination
src/pages/app/hr/HRReportsPage.tsx - Add department filter
src/pages/app/hr/payroll/PayrollReportsPage.tsx - Add department filter
src/pages/app/ipd/IPDReportsPage.tsx - Implement actual reports
src/pages/app/inventory/InventoryReportsPage.tsx - Add detail pages
src/pages/app/reports/ReportsHubPage.tsx - Add new report links
src/pages/app/reports/ExecutiveDashboardReport.tsx - Add department revenue chart
```

### New Components (6 files)
```
src/components/reports/
  ReportTable.tsx
  ReportPagination.tsx
  ReportExportButton.tsx
  ShiftFilter.tsx
  DepartmentFilter.tsx
  ReportComparisonChart.tsx
```

### New Hooks (5 files)
```
src/hooks/
  useDepartmentRevenue.ts
  useShiftWiseData.ts
  useReportPagination.ts
  usePatientFlowAnalytics.ts
  useTurnoverAnalytics.ts
```

---

## Implementation Priority

### Phase 1 - High Priority (Core Revenue Reports)
1. Department-wise Revenue Report
2. Shift-wise Collection Report
3. Enhanced Billing Reports with filters and pagination
4. ReportTable component with pagination

### Phase 2 - Medium Priority (HR & Analytics)
5. Shift-wise Attendance Report
6. Department Headcount & Cost Report
7. Enhanced HR Reports page
8. Patient Wait Time Report

### Phase 3 - Lower Priority (Accounts & Advanced)
9. Vendor Payment Report
10. Expense Analysis Report
11. Turnover Report
12. All remaining reports

---

## Summary

| Category | Current | After Enhancement |
|----------|---------|-------------------|
| Total Reports | 15 | 30+ |
| Reports with Pagination | 0 | All new reports |
| Reports with Shift Filter | 0 | 8+ |
| Reports with Department Filter | 0 | 12+ |
| Reports with Export (CSV/PDF) | 5 | All reports |
| Reports with Charts | 8 | All reports |
| Reports with Drill-down | 0 | Priority reports |

This plan transforms the HMS from basic reporting to a comprehensive analytics platform with proper filters, pagination, and actionable insights for hospital administration.

