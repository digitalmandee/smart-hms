
# HMS Reports Enhancement Plan

## Current Reports Inventory

After thorough analysis, the HMS has a comprehensive reporting system with **20+ report pages** covering all major modules:

### Management Reports
| Report | Location | Features | Status |
|--------|----------|----------|--------|
| Executive Dashboard | `/app/reports/executive` | KPIs, Gross vs Net, Beds, Clickable Drill-downs | Complete |
| Department Revenue | `/app/reports/department-revenue` | By OPD/IPD/Lab/Pharmacy/Surgery | Complete |
| Shift-wise Collection | `/app/reports/shift-collection` | Morning/Evening/Night analysis, Cashier breakdown | Complete |
| Branch Comparison | `/app/reports/branches` | Multi-branch analytics | Complete |

### Clinical Reports
| Report | Location | Features | Status |
|--------|----------|----------|--------|
| Clinic/OPD Reports | `/app/clinic/reports` | Token summary, Doctor earnings, Peak hours | Complete |
| Patient Reports | `/app/patients/reports` | Demographics, Registration trends | Complete |
| Appointment Reports | `/app/appointments/reports` | Booking trends, No-show analysis | Complete |
| Doctor Reports | `/app/opd/reports` | Consultation volume, Performance | Complete |
| Lab Reports | `/app/lab/reports` | TAT, Test categories, Pending orders | Complete |
| ER Reports | `/app/emergency/reports` | Triage levels, Arrival modes | Complete |
| IPD Reports | `/app/ipd/reports` | Bed occupancy, LOS, Ward census | Complete |

### Operational Reports
| Report | Location | Features | Status |
|--------|----------|----------|--------|
| Pharmacy Reports | `/app/pharmacy/reports` | Sales, Top products, Payment methods | Complete |
| Inventory Reports | `/app/inventory/reports` | Stock valuation, Movement, Expiry | Complete |

### Financial Reports
| Report | Location | Features | Status |
|--------|----------|----------|--------|
| Billing Reports | `/app/billing/reports` | Daily collections, Aging, Payment methods | Complete |
| Financial Statements | `/app/accounts/reports` | Trial Balance, P&L, Balance Sheet, Cash Flow | Complete |

### HR Reports
| Report | Location | Features | Status |
|--------|----------|----------|--------|
| HR Dashboard | `/app/hr/reports` | Department distribution, Leave analysis | Complete |
| Attendance Reports | `/app/hr/attendance/reports` | Monthly trends, Department analysis | Complete |
| Payroll Reports | `/app/hr/payroll/reports` | YTD summary, Salary distribution | Complete |
| Daily Commission | `/app/hr/payroll/daily-commissions` | Doctor earnings by date | Complete |
| Roster Reports | `/app/hr/attendance/roster-reports` | Shift distribution, Coverage gaps | Complete |

---

## Identified Gaps

### Missing Reports

1. **Surgery/OT Reports** - No dedicated report page exists
   - Surgery volume by surgeon
   - OT utilization (room usage hours)
   - Anesthesia usage breakdown
   - Cancelled/postponed surgeries

2. **Radiology Reports** - No dedicated report page exists
   - Imaging volume by modality (X-Ray, CT, MRI, Ultrasound)
   - TAT (Turnaround Time) for reports
   - Pending interpretations

3. **Referral Reports** - Track patient referrals
   - External referral sources
   - Internal inter-department referrals
   - Referral conversion rates

4. **Insurance/Claims Reports** - Missing from billing
   - Claims submitted vs approved
   - Rejection reasons analysis
   - Insurance company performance

5. **Patient Feedback/Satisfaction** - No report exists
   - NPS scores if collected
   - Complaint resolution metrics

---

## Enhancement Recommendations

### Priority 1: Add Missing Report Pages

#### 1. OT/Surgery Reports Page
**File: `src/pages/app/ot/OTReportsPage.tsx`**

Features:
- Surgery volume by date range
- Surgeon-wise performance (procedures count, average duration)
- OT room utilization percentage
- Anesthesia type distribution
- Emergency vs elective breakdown
- Cancelled surgery analysis
- Charts: Surgery trends line chart, Room utilization bar chart

#### 2. Radiology Reports Page
**File: `src/pages/app/radiology/RadiologyReportsPage.tsx`**

Features:
- Imaging orders by modality
- TAT analysis (order to report time)
- Pending interpretations count
- Revenue by modality
- Technician productivity
- Charts: Modality pie chart, Daily volume bar chart

#### 3. Insurance Claims Report
**File: `src/pages/app/billing/ClaimsReportPage.tsx`**

Features:
- Claims status breakdown (Submitted/Approved/Rejected/Pending)
- Rejection reasons categorization
- Insurance company performance comparison
- Average processing time
- Outstanding claims aging
- Export for reconciliation

### Priority 2: Enhance Existing Reports

#### Executive Dashboard Enhancements
- Add Surgery stats card (procedures today/month)
- Add Radiology stats (images processed)
- Add Insurance claims pending widget
- Real-time auto-refresh option

#### Billing Reports Enhancements
- Add discount analysis (total discounts given)
- Add credit limit utilization for corporate patients
- Add cashier-wise variance report

#### Lab Reports Enhancements
- Add sample rejection rate
- Add critical value reporting count
- Add test-wise revenue breakdown

#### HR Reports Enhancements
- Add overtime hours tracking
- Add cost-per-employee analysis
- Add training hours completion

### Priority 3: PDF Export Improvements

Currently only 7 report pages use `ReportExportButton`. Add to remaining:
- ER Reports
- Clinic Reports
- Patient Reports
- Appointment Reports
- Doctor Reports
- Attendance Reports
- HR Reports main page

### Priority 4: New Specialized Reports

1. **Daily MIS Report** - Single-page summary for management
   - All key metrics on one printable page
   - Designed for daily review meetings

2. **Comparative Analysis Report**
   - Month-over-month comparison
   - Year-over-year trends
   - Variance highlighting

3. **Cost Analysis Report** (if expense tracking exists)
   - Revenue vs Expenses by department
   - Profit margins by service category

---

## Implementation Plan

### Phase 1: Create Missing Report Pages (High Priority)

**New Files to Create:**
| File | Purpose |
|------|---------|
| `src/pages/app/ot/OTReportsPage.tsx` | Surgery/OT analytics |
| `src/hooks/useOTReports.ts` | Hook for surgery data aggregation |
| `src/pages/app/radiology/RadiologyReportsPage.tsx` | Imaging analytics |
| `src/hooks/useRadiologyReports.ts` | Hook for radiology data |
| `src/pages/app/billing/ClaimsReportPage.tsx` | Insurance claims analysis |

**Routes to Add:**
```typescript
<Route path="ot/reports" element={<OTReportsPage />} />
<Route path="radiology/reports" element={<RadiologyReportsPage />} />
<Route path="billing/claims-report" element={<ClaimsReportPage />} />
```

**Update ReportsHubPage.tsx:**
Add cards for new reports in appropriate sections.

### Phase 2: Enhance Existing Reports

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/pages/app/reports/ExecutiveDashboardReport.tsx` | Add surgery and radiology widgets |
| `src/pages/app/billing/BillingReportsPage.tsx` | Add discount analysis section |
| `src/pages/app/lab/LabReportsPage.tsx` | Add sample rejection rate |
| `src/pages/app/hr/HRReportsPage.tsx` | Add overtime tracking |

### Phase 3: Add Export to Remaining Reports

**Files to Modify:**
- `src/pages/app/emergency/ERReportsPage.tsx`
- `src/pages/app/clinic/ClinicReportsPage.tsx`
- `src/pages/app/patients/PatientReportsPage.tsx`
- `src/pages/app/appointments/AppointmentReportsPage.tsx`
- `src/pages/app/opd/DoctorReportsPage.tsx`
- `src/pages/app/hr/attendance/AttendanceReportsPage.tsx`

---

## Technical Implementation Details

### OT Reports Hook
```typescript
// src/hooks/useOTReports.ts
export function useSurgeryStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["surgery-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: surgeries } = await supabase
        .from("surgeries")
        .select("id, surgery_type, lead_surgeon_id, ot_room_id, start_time, end_time, status")
        .gte("surgery_date", dateFrom)
        .lte("surgery_date", dateTo);
      
      // Aggregate by surgeon, room, type
      return {
        totalSurgeries: surgeries.length,
        bySurgeon: aggregateBySurgeon(surgeries),
        byRoom: aggregateByRoom(surgeries),
        byType: aggregateByType(surgeries),
        avgDuration: calculateAvgDuration(surgeries),
      };
    },
  });
}
```

### Radiology Reports Hook
```typescript
// src/hooks/useRadiologyReports.ts
export function useImagingStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["imaging-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("imaging_orders")
        .select("id, modality_id, status, created_at, reported_at, modalities(name)")
        .gte("created_at", dateFrom)
        .lte("created_at", dateTo);
      
      return {
        totalOrders: orders.length,
        byModality: aggregateByModality(orders),
        pendingInterpretations: orders.filter(o => o.status === 'pending').length,
        avgTAT: calculateAvgTAT(orders),
      };
    },
  });
}
```

---

## Summary

| Category | Current | After Enhancement |
|----------|---------|-------------------|
| Total Report Pages | 20 | 24 |
| Reports with PDF Export | 7 | 15+ |
| Missing Critical Reports | 3 (OT, Radiology, Claims) | 0 |
| Charts Coverage | Good | Enhanced with new metrics |

The HMS already has a strong reporting foundation. The main gaps are:
1. **OT/Surgery Reports** - Critical for hospitals with operating theaters
2. **Radiology Reports** - Essential for diagnostic imaging departments
3. **Insurance Claims Reports** - Important for revenue cycle management

Adding these three reports plus enhancing PDF export coverage will make the reporting system comprehensive and professional-grade.
