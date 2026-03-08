

# System Audit Results + Dialysis & Dental Module Plan

## Audit Findings

### What's Working Correctly
The system is comprehensive with 23+ modules fully built. Here's the status:

| Module | Status | Notes |
|--------|--------|-------|
| OPD | **OK** | Full flow: Check-in → Vitals → Consultation → Prescription → Lab/Imaging orders → Checkout |
| IPD | **OK** | Admission → Daily Rounds → Charges → Medication Chart → Nursing Notes → Discharge → Billing |
| Surgery/OT | **OK** | 18 pages: Requests → Pre-op → Anesthesia → Live Surgery → PACU → Instrument Count → Post-op |
| Reception | **OK** | Dashboard + OT Medication Charges |
| Billing | **OK** | Invoice creation, payment collection, session management, daily closing |
| Pharmacy | **OK** | POS, dispensing, prescription queue, Wasfaty + Tatmeen wired |
| Lab & Radiology | **OK** | Orders, results, templates, PACS integration |
| Emergency | **OK** | Full ER workflow |
| Finance/Accounts | **OK** | 4-level CoA, journal entries, P&L, balance sheet |
| HR | **OK** | Full lifecycle: recruitment → payroll → exit |
| Insurance/NPHIES | **OK** | Full 15-step RCM cycle |

### Journal Entry Automation Coverage

| Trigger | Exists? | Notes |
|---------|---------|-------|
| Invoice → Journal (AR ↑, Revenue ↑) | **Yes** | `post_invoice_to_journal` |
| Payment → Journal (Cash ↑, AR ↓) | **Yes** | `post_payment_to_journal` |
| POS Sale → Journal | **Yes** | `post_pos_to_journal` |
| Payroll → Journal (Salary Exp ↑, Cash ↓) | **Yes** | `post_payroll_to_journal` |
| Expense → Journal | **Yes** | `post_expense_to_journal` |
| Donation → Journal | **Yes** | `post_donation_to_journal` |
| Shipping → Journal | **Yes** | `post_shipping_cost_to_journal` |
| Stock Write-off → Journal | **Yes** | `post_stock_writeoff_to_journal` |
| **Vendor Payment → Journal** | **MISSING** | Vendor payments do NOT auto-post to journal. This is a gap — paying vendors should Debit AP and Credit Cash. |

### Issues Found

**1. Missing Vendor Payment Journal Trigger (Finance Gap)**
Vendor payments (`vendor_payments` table) have no `post_vendor_payment_to_journal` trigger. When you pay a vendor, it should:
- Debit: Accounts Payable (AP-001)
- Credit: Cash in Hand (CASH-001)

This means vendor payments are recorded but do NOT reflect in the General Ledger, P&L, or Balance Sheet.

**2. Daily Closing Integration**
The daily closing system correctly aggregates by department (OPD, IPD, Pharmacy, Lab, Radiology, ER) and by payment method (Cash, Card, UPI). Cash reconciliation with denomination counting is in place. The `useDailyClosingSummary` hook pulls from billing sessions and payments — this is solid.

**3. No Other Critical Gaps Found**
- Account balance trigger (`update_account_balance`) fires on journal line changes
- Payment sync (`sync_appointment_payment_status`) correctly updates appointment payment status
- Department order sync (`sync_department_order_payment_status`) correctly marks lab/imaging as paid
- Room charge sync (both backfill hook and edge function) works correctly

---

## AI Integration Suggestions

Current AI: HeyGen streaming avatar + OpenAI-based chat (`useAIChat`) with modes: patient_intake, doctor_assist, general, pharmacy_lookup. Plus `useAISuggestion` for clinical suggestions.

**New AI Opportunities:**

| Area | Feature | How |
|------|---------|-----|
| Lab | **Auto-interpret lab results** | AI reads CBC/LFT/RFT values and flags abnormals with clinical significance |
| Radiology | **AI-assisted report drafting** | Feed imaging description → AI generates structured radiology report |
| Pharmacy | **Drug interaction checker** | AI checks prescription items for contraindications before dispensing |
| IPD | **Predictive discharge planning** | Based on vitals trend + diagnosis, AI estimates discharge readiness |
| Billing | **Claim denial prediction** | AI pre-screens claims against common NPHIES rejection reasons |
| OPD | **Smart ICD-10 coding** | AI suggests diagnosis codes from consultation notes |
| Kitchen | **AI diet recommendation** | Based on diagnosis + lab results, suggest appropriate diet plans |

---

## Dialysis & Dental Departments Plan

### Architecture Decision

Both should be **hybrid modules** — linked to OPD for outpatient visits and IPD for inpatient procedures, but with their own specialized workflows, dashboards, and charge capture.

### Dialysis Module

**New Files:**

| File | Purpose |
|------|---------|
| `src/pages/app/dialysis/DialysisDashboard.tsx` | Machine status, today's sessions, chair occupancy |
| `src/pages/app/dialysis/DialysisSessionPage.tsx` | Per-session: pre-dialysis assessment, intra-dialysis vitals (every 30 min), post-dialysis summary |
| `src/pages/app/dialysis/DialysisSchedulePage.tsx` | Recurring schedule (MWF / TTS shifts), chair assignments |
| `src/pages/app/dialysis/DialysisPatientsPage.tsx` | Chronic patient registry with dry weight, access type, EPO dosage |
| `src/pages/app/dialysis/DialysisMachinesPage.tsx` | Machine inventory, maintenance log, disinfection tracking |
| `src/pages/app/dialysis/DialysisReportsPage.tsx` | Kt/V adequacy, infection rates, vascular access stats |
| `src/hooks/useDialysis.ts` | All CRUD hooks |

**Database Tables:**
- `dialysis_patients` — dry weight, vascular access type (AV fistula/graft/catheter), hepatitis status, EPO protocol
- `dialysis_sessions` — machine_id, chair_number, pre/post weight, UF goal, duration, heparin dose, dialysate flow
- `dialysis_vitals` — intra-session vitals at 30-min intervals (BP, pulse, UF rate, TMP)
- `dialysis_machines` — serial number, model, last disinfection, maintenance schedule
- `dialysis_schedules` — recurring patient-chair-shift assignments (MWF AM/PM, TTS AM/PM)

**Automations:**
- Auto-post dialysis session charges to IPD charges (if admitted) or create OPD invoice (if outpatient)
- Auto-schedule recurring sessions based on patient protocol (3x/week)
- Vitals alert: if intra-dialysis BP drops >20mmHg, trigger nursing alert
- Machine disinfection reminder after each session
- Monthly Kt/V adequacy calculation

**OPD/IPD Linkage:**
- Outpatient dialysis: Book via OPD appointment → Dialysis session → Auto-invoice
- Inpatient dialysis: Ordered from IPD → Dialysis session → Charges posted to admission

### Dental Module

**New Files:**

| File | Purpose |
|------|---------|
| `src/pages/app/dental/DentalDashboard.tsx` | Today's appointments, chair utilization |
| `src/pages/app/dental/DentalChartPage.tsx` | Interactive tooth chart (32 teeth FDI numbering), per-tooth condition tracking |
| `src/pages/app/dental/DentalTreatmentPage.tsx` | Treatment plan builder with tooth-procedure mapping |
| `src/pages/app/dental/DentalProceduresPage.tsx` | Procedure catalog (CDT codes): scaling, RCT, extraction, crown, implant |
| `src/pages/app/dental/DentalHistoryPage.tsx` | Patient dental history timeline |
| `src/pages/app/dental/DentalReportsPage.tsx` | Revenue by procedure, dentist productivity |
| `src/hooks/useDental.ts` | All CRUD hooks |

**Database Tables:**
- `dental_charts` — patient tooth map (32 teeth, each with status: healthy/decayed/missing/restored/crown/implant)
- `dental_treatments` — treatment plans with tooth_number, surface (M/O/D/B/L), procedure_code, status, cost
- `dental_procedures` — CDT code catalog with standard pricing
- `dental_images` — periapical/OPG/CBCT image references per patient

**Automations:**
- Auto-populate invoice from completed treatment plan items
- Treatment plan approval workflow (patient consent before proceeding)
- Recall/follow-up reminders (6-month checkup, crown cementation follow-up)
- Auto-link dental X-ray orders to radiology module

**OPD/IPD Linkage:**
- Outpatient dental: Book via OPD → Dental chart review → Treatment → Invoice
- Inpatient dental (oral surgery under GA): Surgery request → OT scheduling → Dental procedure in OT → IPD charges

### Migration Required
- 9 new database tables (5 dialysis + 4 dental)
- New permissions: `dialysis.view`, `dialysis.manage`, `dental.view`, `dental.manage`
- Menu items and sidebar entries
- Service categories for charge capture

### Fix Required
- Add `post_vendor_payment_to_journal` trigger to close the finance gap

## Implementation Order
1. Fix vendor payment journal trigger (critical finance gap)
2. Build Dialysis module (more complex, higher clinical impact)
3. Build Dental module
4. Wire AI suggestions into new modules

