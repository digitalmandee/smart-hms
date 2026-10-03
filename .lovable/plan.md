# Thalassemia / NGO Readiness: Gaps and Build Plan

## Where things stand

**Ready now (general flows that work for an NGO thalassemia centre)**
- Facility profile: Thalassemia Center type, preset modules, Surgery/ER/Radiology/Dialysis/Dental hidden, ADF login page
- Blood bank: donors, donations, testing, inventory, cross-match, issue, transfusion record, reaction form, donor recall, bag labels, donor cards
- Donations (NGO side): donors, campaigns + public campaign page, recurring pledges, record donation, receipts, zakat wording, revenue posting
- Procurement PR → PO → GRN, warehouse, inventory, pharmacy, lab, billing, HR, accounts

**Not built (thalassemia-specific flows)**
- Thalassemia patient registry: diagnosis type (major/intermedia), baseline Hb, blood group/phenotype, splenectomy status, transfusion interval
- Transfusion day-care visit: chair booking, pre/post-transfusion Hb, units given, ml/kg, next due date
- Recurring transfusion schedule (every 2–4 weeks) with overdue list
- Chelation therapy tracking: drug, dose, compliance, side effects
- Iron overload monitoring: ferritin trend chart, alerts above thresholds
- Patient sponsorship: link a donor/zakat fund to a patient, free/subsidised visit billed against the fund, sponsor reports
- Thalassemia dashboard and reports (patients due today, ferritin > 2500, units used per patient, cost per patient vs funding)

## Proposed build (all screens in English, Urdu, Arabic with RTL)

1. Thalassemia patient profile tab on the patient page
2. Day-care transfusion visit screen (linked to existing blood bank transfusion records)
3. Recurring transfusion schedule + "due / overdue" list
4. Chelation therapy log with compliance
5. Ferritin and Hb trend charts with alerts
6. Patient sponsorship: assign sponsor fund, auto-charge visit to fund, sponsor statement
7. Thalassemia dashboard + 4 reports
8. Add these to the ADF menu only (thalassemia facility type)

## Technical details
- New tables: thalassemia_profiles, thalassemia_visits, chelation_records, patient_sponsorships (with GRANTs + branch RLS)
- Visits reference blood_transfusions and lab results; ferritin pulled from lab results by test name
- Sponsorship charging uses existing invoice + donation fund posting via DB triggers (no manual journals)
- Routes under /app/thalassemia/*, gated by facility-type filter
