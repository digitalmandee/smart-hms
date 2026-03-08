

# QA Fixes + Complete Module Documentation Suite

## Part 1: Bug Fixes Found in QA

### Dialysis Bugs
| File | Issue |
|------|-------|
| `DialysisNewSessionPage.tsx` line 53 | `p.patients?.mrn_number` should be `p.patients?.patient_number` — field doesn't exist |

### Dental Bugs
| File | Issue |
|------|-------|
| `DentalImagesPage.tsx` line 24 | Selects `mrn_number` from patients — should be `patient_number` |
| `DentalImagesPage.tsx` line 85 | Displays `p.mrn_number` — should be `p.patient_number` |

Both modules are otherwise functionally complete: dashboards, CRUD, session detail with vitals chart, 3D tooth chart, treatment plans, scheduling, reports with real Recharts data, and image uploads all work correctly.

## Part 2: Documentation Hub

Create a unified **Documentation Center** page (`/documentation`) with downloadable PDF guides for every module, following the existing pharmacy-docs pattern (DocPageWrapper + jsPDF + html-to-image).

### Architecture

Each module gets its own doc folder with Cover + TOC + 4-8 content pages. A master `DocumentationHub` page lists all guides with download buttons.

### New Files (by module)

**Hub Page:**
- `src/pages/DocumentationHub.tsx` — Grid of all module guides with PDF download

**OPD Documentation (6 pages):**
- `src/components/opd-docs/OpdDocCover.tsx`
- `src/components/opd-docs/OpdDocToc.tsx`
- `src/components/opd-docs/OpdDocAppointment.tsx` — Booking, check-in, queue
- `src/components/opd-docs/OpdDocConsultation.tsx` — Vitals, SOAP, prescriptions, orders
- `src/components/opd-docs/OpdDocOrders.tsx` — Lab/imaging orders, referrals
- `src/components/opd-docs/OpdDocCheckout.tsx` — Billing, follow-up
- `src/pages/OpdDocumentation.tsx` — Viewer + PDF download

**IPD Documentation (8 pages):**
- `src/components/ipd-docs/IpdDocCover.tsx`
- `src/components/ipd-docs/IpdDocToc.tsx`
- `src/components/ipd-docs/IpdDocAdmission.tsx` — Bed selection, admission form
- `src/components/ipd-docs/IpdDocRounds.tsx` — Daily rounds, vitals, medication chart
- `src/components/ipd-docs/IpdDocNursing.tsx` — Nursing notes, I/O chart
- `src/components/ipd-docs/IpdDocCharges.tsx` — Room charges, consumables
- `src/components/ipd-docs/IpdDocDischarge.tsx` — Discharge workflow, summary, billing
- `src/pages/IpdDocumentation.tsx`

**Surgery/OT Documentation (6 pages):**
- `src/components/ot-docs/OtDocCover.tsx`
- `src/components/ot-docs/OtDocToc.tsx`
- `src/components/ot-docs/OtDocScheduling.tsx` — Request, scheduling, team assignment
- `src/components/ot-docs/OtDocPreOp.tsx` — Pre-op assessment, anesthesia, consent
- `src/components/ot-docs/OtDocLiveSurgery.tsx` — Live monitoring, instruments, consumables
- `src/components/ot-docs/OtDocPostOp.tsx` — PACU, post-op orders, recovery
- `src/pages/OtDocumentation.tsx`

**Lab Documentation (5 pages):**
- `src/components/lab-docs/LabDocCover.tsx`
- `src/components/lab-docs/LabDocToc.tsx`
- `src/components/lab-docs/LabDocOrders.tsx` — Order reception, sample collection
- `src/components/lab-docs/LabDocResults.tsx` — Result entry, validation, reporting
- `src/components/lab-docs/LabDocTemplates.tsx` — Test catalog, templates, ranges
- `src/pages/LabDocumentation.tsx`

**Radiology Documentation (5 pages):**
- `src/components/radiology-docs/RadDocCover.tsx`
- `src/components/radiology-docs/RadDocToc.tsx`
- `src/components/radiology-docs/RadDocOrders.tsx` — Order management, scheduling
- `src/components/radiology-docs/RadDocReporting.tsx` — Report writing, templates
- `src/components/radiology-docs/RadDocPacs.tsx` — PACS integration, image viewing
- `src/pages/RadiologyDocumentation.tsx`

**Warehouse Documentation (6 pages):**
- `src/components/warehouse-docs/WhDocCover.tsx`
- `src/components/warehouse-docs/WhDocToc.tsx`
- `src/components/warehouse-docs/WhDocReceiving.tsx` — GRN, QC, put-away
- `src/components/warehouse-docs/WhDocPicking.tsx` — Pick, pack, ship
- `src/components/warehouse-docs/WhDocOps.tsx` — Cycle count, RTV, barcode
- `src/components/warehouse-docs/WhDocKpi.tsx` — Dashboard, KPIs
- `src/pages/WarehouseDocumentation.tsx`

**Finance Documentation (6 pages):**
- `src/components/finance-docs/FinDocCover.tsx`
- `src/components/finance-docs/FinDocToc.tsx`
- `src/components/finance-docs/FinDocCoa.tsx` — Chart of Accounts, 4-level hierarchy
- `src/components/finance-docs/FinDocJournals.tsx` — Journal entries, auto-triggers
- `src/components/finance-docs/FinDocBilling.tsx` — Invoice, payment, daily closing
- `src/components/finance-docs/FinDocReports.tsx` — P&L, balance sheet, trial balance
- `src/pages/FinanceDocumentation.tsx`

**HR Documentation (6 pages):**
- `src/components/hr-docs/HrDocCover.tsx`
- `src/components/hr-docs/HrDocToc.tsx`
- `src/components/hr-docs/HrDocEmployee.tsx` — Registration, profiles, departments
- `src/components/hr-docs/HrDocAttendance.tsx` — Roster, leave, on-call
- `src/components/hr-docs/HrDocPayroll.tsx` — Payroll runs, components, tax
- `src/components/hr-docs/HrDocRecruitment.tsx` — Jobs, applications, onboarding
- `src/pages/HrDocumentation.tsx`

**Dialysis Documentation (6 pages):**
- `src/components/dialysis-docs/DialDocCover.tsx`
- `src/components/dialysis-docs/DialDocToc.tsx`
- `src/components/dialysis-docs/DialDocPatients.tsx` — Enrollment, dry weight, access type
- `src/components/dialysis-docs/DialDocSessions.tsx` — Session workflow, vitals monitoring, BP alerts
- `src/components/dialysis-docs/DialDocMachines.tsx` — Machine management, disinfection
- `src/components/dialysis-docs/DialDocSchedule.tsx` — MWF/TTS scheduling, reports
- `src/pages/DialysisDocumentation.tsx`

**Dental Documentation (6 pages):**
- `src/components/dental-docs/DentDocCover.tsx`
- `src/components/dental-docs/DentDocToc.tsx`
- `src/components/dental-docs/DentDocChart.tsx` — 3D tooth chart, FDI numbering, conditions
- `src/components/dental-docs/DentDocTreatment.tsx` — Treatment plans, surface mapping
- `src/components/dental-docs/DentDocProcedures.tsx` — CDT catalog, pricing
- `src/components/dental-docs/DentDocImages.tsx` — Imaging workflow, reports
- `src/pages/DentalDocumentation.tsx`

### Modified Files
| File | Change |
|------|--------|
| `src/App.tsx` | Add routes for all 11 new documentation pages + hub |
| `src/pages/app/dialysis/DialysisNewSessionPage.tsx` | Fix `mrn_number` → `patient_number` |
| `src/pages/app/dental/DentalImagesPage.tsx` | Fix `mrn_number` → `patient_number` |
| `src/components/landing/Footer.tsx` | Add "Documentation Center" link |

### Shared Components
All doc pages reuse the existing `DocPageWrapper` pattern (A4 sized, HealthOS header/footer, page numbering). Each documentation viewer page reuses the same jsPDF + html-to-image PDF generation logic from `PharmacyDocumentation.tsx`.

### Implementation Order
Due to the large number of files, this will be built across multiple rounds:
1. **Round 1**: Bug fixes + DocumentationHub + OPD + IPD + Surgery docs
2. **Round 2**: Lab + Radiology + Warehouse + Finance docs
3. **Round 3**: HR + Dialysis + Dental docs + route wiring

