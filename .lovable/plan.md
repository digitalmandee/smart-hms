

# Plan: Enhance Landing Page with Complete Module Details for PDF Presentation

## Current State Analysis

### Existing 17 Modules in FeaturesTabs
| Module | Current Description | Enhancement Needed |
|--------|---------------------|-------------------|
| Patients | Good - CNIC, QR, history | Add family linkage detail |
| Appointments | Good - Token, SMS, booking | Add calendar grid detail |
| Consultation (OPD) | Basic - Vitals, prescription | **Needs significant expansion** |
| Emergency | Good - Triage, trauma | Add handoff workflow |
| OT | Good - Scheduling, notes | **Needs live surgery dashboard detail** |
| IPD | Basic - Bed, rounds | **Needs discharge billing detail** |
| Nursing | Good - Vitals, eMAR | Add shift handover |
| Laboratory | Good - Panels, barcodes | Add result templates |
| Radiology | Good - PACS, reports | Add technician workflow |
| Blood Bank | Good - Donors, cross-match | Good as is |
| Pharmacy | Good - Batch, expiry | Add drug interactions |
| POS | Good - Barcode, payments | Good as is |
| Billing | Basic | **Needs IPD billing integration** |
| Accounts | Good - GL, AP/AR | Add automated posting |
| Inventory | Basic - PO, vendors | **Needs procurement workflow** |
| Reports | Good - Revenue, charts | Add custom reports |
| HR | Good - Roster, payroll | **Needs doctor compensation** |

### Missing Modules (Critical for Presentation)
1. **Doctor Wallet & Earnings** - Automated commission tracking
2. **Doctor Compensation** - Fee & share configuration
3. **Procurement Workflow** - PO to AP cycle
4. **IPD Discharge Billing** - Running bills & settlement

---

## Solution: Comprehensive Enhancement

### Phase 1: Add 4 New Modules to FeaturesTabs

**1. Doctor Wallet & Earnings (New Module)**
```typescript
{
  id: 'wallet',
  icon: Wallet,
  label: 'Doctor Wallet',
  title: 'Automated Clinician Earnings & Payouts',
  description: 'Automated earning calculations for every consultation, surgery, and procedure. Database triggers credit doctor wallets in real-time upon payment. Track OPD consultations, IPD visits, surgical fees, and anesthesia charges. Seamlessly integrate with monthly payroll for bulk settlements or on-demand payouts.',
  highlights: ['Auto-Credit Triggers', 'Real-Time Balance', 'Payroll Integration', 'Earning Reports', 'Bulk Settlement'],
  screenshot: DoctorWalletScreen,
}
```

**2. Doctor Compensation (New Module)**
```typescript
{
  id: 'compensation',
  icon: BadgePercent,
  label: 'Compensation',
  title: 'Flexible Doctor Fee & Share Configuration',
  description: 'Configure complex compensation plans for clinicians. Set patient-facing consultation fees alongside doctor share percentages. Support fixed salary, per-consultation, revenue share, or hybrid models. Auto-sync with HR salary tables. Real-time earnings calculator shows doctors their take-home before every transaction.',
  highlights: ['Fee vs Share Split', 'Hybrid Plans', 'Surgery Fees', 'Anesthesia Rates', 'Auto-Sync Salary'],
  screenshot: DoctorCompensationScreen,
}
```

**3. Procurement Cycle (Merge with Inventory)**
Update Inventory module to include full procurement:
```typescript
{
  id: 'inventory',
  icon: Warehouse,
  label: 'Procurement',
  title: 'End-to-End Procurement & Stock Control',
  description: 'Complete supply chain from requisition to payment. Create unified Purchase Orders for medicines and supplies. Track vendor performance with ratings. Receive goods with GRN verification and automatic stock routing. Verified GRNs create Accounts Payable entries, closed through Vendor Payments with full ledger reconciliation.',
  highlights: ['Unified PO', 'GRN Verification', 'Stock Routing', 'Vendor Payments', 'AP Integration'],
  screenshot: ProcurementScreen,
}
```

**4. IPD Discharge Billing (Enhance IPD)**
Update IPD module with discharge billing detail:
```typescript
{
  id: 'ipd',
  icon: Hotel,
  label: 'IPD',
  title: 'Complete Inpatient & Discharge Billing',
  description: 'Manage admissions with deposit collection and real-time bed allocation. Track daily room charges automatically. Consolidate pharmacy credits, lab orders, and service charges into running bills. One-click discharge generates comprehensive summaries with itemized invoices. Balance calculation accounts for deposits and partial payments.',
  highlights: ['Deposit Management', 'Room Charge Sync', 'Running Bills', 'Pharmacy Credits', 'Discharge Invoice'],
  screenshot: IPDScreen,
}
```

### Phase 2: Enhance Existing Module Descriptions

**OPD/Consultation Enhancement:**
```typescript
description: 'Complete OPD workflow from vitals to checkout. Nurse stations record vitals with auto-calculated BMI and trend analysis. Doctors access complete patient history, allergies, and chronic conditions. Create e-prescriptions with drug interaction alerts, order labs and imaging, and generate visit summaries. Each visit tracked with unique Visit ID (OPD-YYYYMMDD-TOKEN) across all touchpoints.',
highlights: ['Nurse Vitals Station', 'Clinical Templates', 'Drug Interaction Alerts', 'Lab/Imaging Orders', 'Visit Tracking'],
```

**OT/Surgery Enhancement:**
```typescript
description: 'Comprehensive surgical workflow from scheduling to recovery. 7-tab clinical documentation: Safety Checklist, Digital Consent with signature capture, Medication management, Anesthesia records with real-time vitals, Surgical notes with templates, Consumables tracking, and Post-Op Orders. Live Surgery Dashboard with synchronized timers and role-specific views for Surgeons, Anesthetists, and OT Nurses.',
highlights: ['Live Surgery Dashboard', 'Digital Consent', 'Anesthesia Records', 'Consumable Tracking', 'PACU Management'],
```

**Accounts Enhancement:**
```typescript
description: 'Full double-entry accounting designed for healthcare. Automated real-time posting from Billing (invoices/payments), Pharmacy POS, and Inventory (GRN verification). Manage Chart of Accounts with Assets, Liabilities, Equity, Revenue, and Expenses. Track Accounts Receivable from patients and Accounts Payable to vendors. Generate financial statements (P&L, Balance Sheet, Cash Flow) with GST/tax compliance.',
highlights: ['Auto Journal Posting', 'Chart of Accounts', 'AR/AP Management', 'Financial Statements', 'Bank Reconciliation'],
```

**HR Enhancement:**
```typescript
description: 'Complete workforce management with specialized clinician support. Maintain employee profiles with credentials and specializations. Configure doctor compensation with fee/share percentages. Auto-generate duty rosters, track attendance with biometric integration, process leave approvals, and run payroll with automatic doctor earning settlements. Loans & advances with EMI calculation and deduction tracking.',
highlights: ['Doctor Compensation', 'Wallet Payouts', 'Biometric Attendance', 'Loan Management', 'Payroll Processing'],
```

### Phase 3: Add New Screenshot Components

**File: src/components/landing/ProductScreenshots.tsx**

Add 3 new screenshot components:

**DoctorWalletScreen:**
```tsx
export const DoctorWalletScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Wallet className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">My Wallet - Dr. Ali Ahmed</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-success">Rs. 125,000</div>
          <div className="text-xs text-muted-foreground">Available Balance</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-primary">Rs. 45,000</div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Recent Earnings</div>
        {[
          { type: 'OPD Consultation', patient: 'Ahmed Khan', amount: '1,500', share: '60%' },
          { type: 'Surgery - Appendectomy', patient: 'Fatima Malik', amount: '25,000', share: '40%' },
          { type: 'IPD Visit', patient: 'Usman Ali', amount: '800', share: '50%' },
        ].map((earning, i) => (
          <div key={i} className="bg-muted/50 rounded p-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{earning.type}</div>
              <div className="text-xs text-muted-foreground">{earning.patient}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-success">+Rs. {earning.amount}</div>
              <div className="text-xs text-muted-foreground">{earning.share}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">Request Payout</div>
        <div className="h-8 border rounded flex items-center justify-center text-sm">View History</div>
      </div>
    </div>
  </div>
);
```

**DoctorCompensationScreen:**
```tsx
export const DoctorCompensationScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <BadgePercent className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Compensation Plan - Dr. Ali Ahmed</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Plan Type</div>
          <div className="h-8 bg-primary/10 rounded px-2 flex items-center text-sm font-medium text-primary">Hybrid</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Base Salary</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">Rs. 150,000</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Fee & Share Configuration</div>
        {[
          { service: 'OPD Consultation', fee: '2,500', share: '60%', earning: '1,500' },
          { service: 'IPD Visit', fee: '1,500', share: '50%', earning: '750' },
          { service: 'Surgery', fee: '50,000', share: '40%', earning: '20,000' },
        ].map((item, i) => (
          <div key={i} className="bg-muted/50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{item.service}</span>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                Earns Rs. {item.earning}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Patient Fee: Rs. {item.fee}</span>
              <span>Doctor Share: {item.share}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-success/10 rounded-lg p-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-success" />
        <div>
          <div className="text-xs font-medium">Last Month Total</div>
          <div className="text-sm font-bold text-success">Rs. 285,000</div>
        </div>
      </div>
    </div>
  </div>
);
```

**ProcurementScreen:**
```tsx
export const ProcurementScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Truck className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Procurement Workflow</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-warning">5</div>
          <div className="text-xs text-muted-foreground">Pending POs</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-primary">3</div>
          <div className="text-xs text-muted-foreground">Awaiting GRN</div>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-destructive">Rs. 450K</div>
          <div className="text-xs text-muted-foreground">Unpaid AP</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Procurement Pipeline</div>
        {[
          { po: 'PO-2024-0156', vendor: 'Medical Supplies Ltd', items: 'Syringes, Gloves, Masks', amount: '85,000', stage: 'GRN Pending' },
          { po: 'PO-2024-0155', vendor: 'Pharma Distributors', items: 'Paracetamol, Amoxicillin', amount: '125,000', stage: 'Payment Due' },
        ].map((order, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{order.po}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${i === 0 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                {order.stage}
              </span>
            </div>
            <div className="text-sm font-medium">{order.vendor}</div>
            <div className="text-xs text-muted-foreground">{order.items}</div>
            <div className="text-sm font-bold text-right">Rs. {order.amount}</div>
          </div>
        ))}
      </div>
      <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">Create Purchase Order</div>
    </div>
  </div>
);
```

### Phase 4: Update Module Count

Update the section header from "17 integrated modules" to "20 integrated modules":

```typescript
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  20 integrated modules working together seamlessly. Click to explore each feature in detail.
</p>
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/landing/FeaturesTabs.tsx` | Add 3 new modules (Wallet, Compensation, Procurement), enhance 5 existing descriptions |
| `src/components/landing/ProductScreenshots.tsx` | Add 3 new screenshot components |

---

## Expected Outcome

After implementation, the landing page will feature:

1. **20 Complete Modules** - All HMS capabilities covered
2. **PDF-Ready Content** - Each module has:
   - Clear title (presentation header)
   - Detailed 2-3 sentence description
   - 5 highlight badges (key features)
   - Visual screenshot mockup
3. **Missing Features Added**:
   - Doctor Wallet & Earnings
   - Doctor Compensation Plans
   - Complete Procurement Workflow
   - Enhanced IPD Discharge Billing
4. **Enhanced Existing Modules**:
   - OPD with nurse station workflow
   - OT with live surgery dashboard
   - Accounts with automated posting
   - HR with compensation integration

---

## Module Summary for PDF Export

| # | Module | Key Value Proposition |
|---|--------|----------------------|
| 1 | Patients | CNIC auto-fill, QR check-in, complete medical history |
| 2 | Appointments | Token queue, SMS reminders, online booking |
| 3 | OPD/Consultation | Nurse vitals, e-prescription, drug alerts |
| 4 | Emergency | 5-level triage, trauma tracking, ambulance alerts |
| 5 | OT/Surgery | Live surgery dashboard, digital consent, PACU |
| 6 | IPD | Admission to discharge, room charges, running bills |
| 7 | Nursing | eMAR, vitals monitoring, shift handover |
| 8 | Laboratory | Barcode tracking, result templates, critical alerts |
| 9 | Radiology | PACS storage, radiologist reports, STAT alerts |
| 10 | Blood Bank | Donor management, cross-matching, transfusion tracking |
| 11 | Pharmacy | Batch tracking, expiry alerts, drug interactions |
| 12 | POS | Barcode scan, multi-payment, live inventory |
| 13 | Billing | Insurance claims, partial payments, collection reminders |
| 14 | Doctor Wallet | Auto-credit triggers, real-time balance, payroll integration |
| 15 | Compensation | Fee vs share split, hybrid plans, auto-sync salary |
| 16 | Accounts | Auto journal posting, AR/AP, financial statements |
| 17 | Procurement | Unified PO, GRN verification, vendor payments |
| 18 | Inventory | Reorder alerts, stock requisitions, expiry tracking |
| 19 | Reports | Revenue charts, trend analysis, custom reports |
| 20 | HR | Doctor compensation, wallet payouts, payroll processing |

