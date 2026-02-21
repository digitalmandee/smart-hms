import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, CheckCircle2, Clock, Users, Route, TestTube, Stethoscope, Pill, Building2, HeartPulse, Syringe, Banknote, UserCog, Package, Monitor, TabletSmartphone, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ============ END-TO-END JOURNEY TEST CASES ============
const JOURNEY_TEST_CASES = [
  {
    id: "journey-opd",
    name: "Complete OPD Patient Flow",
    icon: Stethoscope,
    description: "New patient registration through consultation, prescription, lab, pharmacy, and billing",
    roles: ["Receptionist", "Nurse", "Doctor", "Lab Tech", "Pharmacist", "Accountant"],
    estimatedTime: "25-30 minutes",
    steps: [
      { step: 1, role: "Receptionist", action: "Navigate to Patients → New Patient", location: "/app/patients/new", expected: "Registration form opens", data: "Use test patient: Muhammad Ali, CNIC: 42101-1234567-1" },
      { step: 2, role: "Receptionist", action: "Fill patient details and save", location: "/app/patients/new", expected: "Patient created with MR# (e.g., MR-2024-00026)", data: "Note the MR# for later steps" },
      { step: 3, role: "Receptionist", action: "Create walk-in appointment", location: "/app/appointments/new", expected: "Token number generated (e.g., Token #16)", data: "Select today's date, any available doctor" },
      { step: 4, role: "Receptionist", action: "Check-in patient for appointment", location: "/app/appointments", expected: "Status changes to 'checked_in', patient in queue", data: "Click check-in button on appointment row" },
      { step: 5, role: "Nurse", action: "Login as nurse@healthos.demo", location: "/login", expected: "Redirect to OPD Nursing Station", data: "Password: Demo@123" },
      { step: 6, role: "Nurse", action: "View patient in 'Awaiting Vitals' queue", location: "/app/opd/nursing", expected: "Patient visible with orange 'Needs Vitals' badge", data: "Patient sorted by check-in time" },
      { step: 7, role: "Nurse", action: "Record vitals: BP 120/80, Temp 98.6°F, Pulse 72, SpO2 98%", location: "Vitals Modal", expected: "Vitals saved, patient moves to 'Ready' queue", data: "Enter realistic vital signs" },
      { step: 8, role: "Nurse", action: "Set triage priority to 'Normal'", location: "Triage Section", expected: "Green 'Normal' priority badge displayed", data: "Options: Emergency (Red), Urgent (Yellow), Normal (Green)" },
      { step: 9, role: "Doctor", action: "Login as doctor@healthos.demo", location: "/login", expected: "Redirect to OPD Dashboard", data: "Password: Demo@123" },
      { step: 10, role: "Doctor", action: "View patient queue with vitals displayed", location: "/app/opd", expected: "Patient visible with vitals summary and priority badge", data: "Queue sorted by priority then check-in time" },
      { step: 11, role: "Doctor", action: "Click patient to start consultation", location: "/app/opd", expected: "Consultation form opens with patient details", data: "Form shows medical history if available" },
      { step: 12, role: "Doctor", action: "Enter chief complaint: 'Fever and headache for 3 days'", location: "Consultation Form", expected: "Complaint saved in consultation record", data: "Free text field" },
      { step: 13, role: "Doctor", action: "Add ICD-10 diagnosis: Search 'Viral fever'", location: "Diagnosis Section", expected: "ICD-10 code selected (e.g., B34.9)", data: "Searchable dropdown with codes" },
      { step: 14, role: "Doctor", action: "Create prescription with 3 medicines", location: "Prescription Builder", expected: "Medicines added with dosage and duration", data: "Paracetamol 500mg TDS x 5 days, etc." },
      { step: 15, role: "Doctor", action: "Order lab tests: CBC, LFT", location: "Lab Order Section", expected: "Lab order created with status 'ordered'", data: "Select from available test catalog" },
      { step: 16, role: "Doctor", action: "Complete consultation", location: "Consultation Form", expected: "Status: completed, patient removed from queue", data: "Click 'Complete' button" },
      { step: 17, role: "Lab Tech", action: "Login as labtech@healthos.demo", location: "/login", expected: "Redirect to Lab Queue", data: "Password: Demo@123" },
      { step: 18, role: "Lab Tech", action: "View lab order in queue", location: "/app/lab/queue", expected: "Order visible with orange 'Not Collected' card", data: "Shows patient name, tests ordered, ordering doctor" },
      { step: 19, role: "Lab Tech", action: "Enter sample barcode number", location: "Collection Modal", expected: "Status changes to 'Collected' (blue card)", data: "Enter unique barcode like 'LAB-2024-001234'" },
      { step: 20, role: "Lab Tech", action: "Enter CBC results with normal values", location: "Result Entry Form", expected: "Results saved, form shows all parameters", data: "WBC: 7500, RBC: 4.8, Hgb: 14.2, etc." },
      { step: 21, role: "Lab Tech", action: "Enter LFT results", location: "Result Entry Form", expected: "All liver function parameters recorded", data: "SGPT: 32, SGOT: 28, Bilirubin: 0.8" },
      { step: 22, role: "Lab Tech", action: "Finalize and publish report", location: "Result Entry Form", expected: "Status: Published, report available", data: "Click 'Complete' then 'Publish'" },
      { step: 23, role: "Pharmacist", action: "Login as pharmacist@healthos.demo", location: "/login", expected: "Redirect to Pharmacy POS", data: "Password: Demo@123" },
      { step: 24, role: "Pharmacist", action: "Search by today's token number", location: "/app/pharmacy/pos", expected: "Patient found with green 'Today Token #X' badge", data: "Enter token number from step 3" },
      { step: 25, role: "Pharmacist", action: "View pending prescriptions in side panel", location: "Prescription Panel", expected: "All 3 prescribed medicines displayed", data: "Shows medicine name, dosage, quantity" },
      { step: 26, role: "Pharmacist", action: "Click 'Add All' to add prescription items", location: "Prescription Panel", expected: "All items added to cart with prices", data: "Prices fetched from inventory" },
      { step: 27, role: "Pharmacist", action: "Select payment method: Cash", location: "Checkout Section", expected: "Cash payment form displayed", data: "Enter amount tendered" },
      { step: 28, role: "Pharmacist", action: "Complete sale", location: "Checkout Section", expected: "Transaction complete, receipt generated", data: "Prescription marked as 'dispensed'" },
      { step: 29, role: "Accountant", action: "Login as accountant@healthos.demo", location: "/login", expected: "Redirect to Billing Dashboard", data: "Password: Demo@123" },
      { step: 30, role: "Accountant", action: "View invoice for this patient", location: "/app/billing", expected: "Invoice visible with all charges", data: "Lab fees + Pharmacy sale shown" },
      { step: 31, role: "Accountant", action: "Verify payment status", location: "Invoice Detail", expected: "Pharmacy payment recorded, Lab pending", data: "May need to collect consultation fee" }
    ]
  },
  {
    id: "journey-er-ipd",
    name: "Emergency to IPD Admission",
    icon: HeartPulse,
    description: "Emergency patient arrival, triage, treatment, and admission to inpatient ward",
    roles: ["ER Staff", "ER Doctor", "IPD Nurse", "IPD Doctor", "Accountant"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "ER Staff", action: "Navigate to Emergency Registration", location: "/app/emergency/register", expected: "Quick registration form opens", data: "Use for unknown/unconscious patient" },
      { step: 2, role: "ER Staff", action: "Register patient with minimal info", location: "/app/emergency/register", expected: "ER# generated (e.g., ER-2024-0001)", data: "Name: Unknown Male, Approx Age: 45" },
      { step: 3, role: "ER Staff", action: "Complete triage assessment: ESI Level 1 (Critical)", location: "Triage Form", expected: "Red 'Critical' badge assigned", data: "Chief complaint: Chest pain, difficulty breathing" },
      { step: 4, role: "ER Staff", action: "Mark as cardiac emergency", location: "Registration", expected: "Cardiac emergency flag visible", data: "Special protocols may trigger" },
      { step: 5, role: "ER Staff", action: "Record initial vitals: BP 90/60, Pulse 120, SpO2 88%", location: "Vitals Section", expected: "Abnormal values highlighted in red", data: "Low BP, high pulse, low oxygen" },
      { step: 6, role: "ER Doctor", action: "View ER Dashboard queue", location: "/app/emergency", expected: "Patient at TOP of queue (red priority)", data: "Critical patients sorted first" },
      { step: 7, role: "ER Doctor", action: "Start ER treatment", location: "/app/emergency", expected: "Treatment form opens with patient info", data: "Shows vitals, triage level, chief complaint" },
      { step: 8, role: "ER Doctor", action: "Order STAT lab tests: Troponin, ECG", location: "Orders Section", expected: "STAT orders created (urgent flag)", data: "Lab marked for immediate processing" },
      { step: 9, role: "ER Doctor", action: "Record treatment notes: O2 started, IV access", location: "Treatment Notes", expected: "Notes saved with timestamp", data: "Time-stamped clinical notes" },
      { step: 10, role: "ER Doctor", action: "Administer emergency medications", location: "Medications Given", expected: "Medications logged with time", data: "Aspirin 325mg, Nitroglycerin SL" },
      { step: 11, role: "ER Doctor", action: "Decision: Admit to ICU", location: "Disposition", expected: "Admission workflow initiated", data: "Select 'Admit to IPD' option" },
      { step: 12, role: "ER Doctor", action: "Select ICU ward and admitting diagnosis", location: "Admission Form", expected: "Admission request sent to IPD", data: "Diagnosis: Acute Coronary Syndrome" },
      { step: 13, role: "IPD Nurse", action: "Login as ipdnurse@healthos.demo", location: "/login", expected: "Redirect to IPD Dashboard", data: "Password: Demo@123" },
      { step: 14, role: "IPD Nurse", action: "Accept admission from ER", location: "/app/ipd/admissions", expected: "New admission created from ER data", data: "All ER notes transferred" },
      { step: 15, role: "IPD Nurse", action: "Assign ICU bed (e.g., ICU-01)", location: "Bed Selection", expected: "Bed status: Occupied", data: "Select from available ICU beds" },
      { step: 16, role: "IPD Nurse", action: "Complete admission assessment", location: "Assessment Form", expected: "Initial nursing assessment documented", data: "Allergies, current meds, risk assessment" },
      { step: 17, role: "IPD Nurse", action: "Record admission vitals", location: "Vitals Chart", expected: "Vitals logged in IPD record", data: "Continuous monitoring parameters" },
      { step: 18, role: "IPD Doctor", action: "Perform daily round", location: "/app/ipd/rounds", expected: "Round documented with plan", data: "Assessment, Plan, Orders for next 24h" },
      { step: 19, role: "IPD Nurse", action: "Administer medications (eMAR)", location: "/app/ipd/medication-chart", expected: "Doses recorded with timestamps", data: "Scan patient wristband, verify, administer" },
      { step: 20, role: "IPD Nurse", action: "Add nursing notes", location: "/app/ipd/nursing-notes", expected: "Shift notes documented", data: "Patient condition, interventions, response" },
      { step: 21, role: "Accountant", action: "View accumulating IPD charges", location: "/app/billing", expected: "Daily room charges, ER charges shown", data: "Charges auto-posted from IPD" }
    ]
  },
  {
    id: "journey-ipd-discharge",
    name: "IPD Complete Stay & Discharge",
    icon: Building2,
    description: "Full inpatient journey from planned admission through discharge with billing clearance",
    roles: ["Receptionist", "IPD Nurse", "Doctor", "Pharmacist", "Accountant"],
    estimatedTime: "25-30 minutes",
    steps: [
      { step: 1, role: "Receptionist", action: "Create planned admission", location: "/app/ipd/admissions/new", expected: "Admission scheduled for specific date", data: "Patient: Existing patient with MR#" },
      { step: 2, role: "Receptionist", action: "Select ward and reserve bed", location: "Bed Selection", expected: "Bed reserved (status: Reserved)", data: "General Ward, Bed GW-05" },
      { step: 3, role: "Receptionist", action: "Collect admission deposit", location: "Deposit Section", expected: "Deposit recorded against admission", data: "PKR 50,000 advance deposit" },
      { step: 4, role: "IPD Nurse", action: "Patient arrives - activate admission", location: "/app/ipd/admissions", expected: "Status: Active, Bed: Occupied", data: "Click 'Admit Now' on scheduled admission" },
      { step: 5, role: "IPD Nurse", action: "Complete admission assessment", location: "Assessment Form", expected: "Nursing assessment documented", data: "Allergies, fall risk, skin assessment" },
      { step: 6, role: "IPD Nurse", action: "Record admission vitals", location: "Vitals Chart", expected: "Baseline vitals recorded", data: "BP: 130/85, Pulse: 78, Temp: 98.4°F" },
      { step: 7, role: "Doctor", action: "Create care plan", location: "/app/ipd/care-plans", expected: "Care plan active with goals", data: "Post-surgical recovery plan" },
      { step: 8, role: "Doctor", action: "Order admission medications", location: "Prescription", expected: "IPD prescription created", data: "Antibiotics, analgesics, IV fluids" },
      { step: 9, role: "Doctor", action: "Complete Day 1 daily round", location: "/app/ipd/rounds", expected: "Round documented", data: "Patient stable, continue current plan" },
      { step: 10, role: "IPD Nurse", action: "Administer morning medications", location: "/app/ipd/emar", expected: "Doses recorded in eMAR", data: "Time: 08:00, verify 5 rights" },
      { step: 11, role: "IPD Nurse", action: "Record 4-hourly vitals", location: "Vitals Chart", expected: "Multiple entries logged", data: "06:00, 10:00, 14:00, 18:00, 22:00" },
      { step: 12, role: "IPD Nurse", action: "Document shift nursing notes", location: "/app/ipd/nursing-notes", expected: "Shift summary recorded", data: "Patient progress, concerns, handover" },
      { step: 13, role: "Dietitian", action: "Assign diet plan", location: "/app/ipd/diet", expected: "Diet active for patient", data: "Soft diet, low sodium, 1800 cal" },
      { step: 14, role: "Doctor", action: "Complete Day 2 daily round", location: "/app/ipd/rounds", expected: "Progress noted, discharge planned", data: "Patient improving, plan discharge tomorrow" },
      { step: 15, role: "Doctor", action: "Create discharge medications", location: "Prescription", expected: "Take-home medications prescribed", data: "5 days of oral antibiotics, pain meds" },
      { step: 16, role: "Doctor", action: "Initiate discharge process", location: "/app/ipd/discharges", expected: "Discharge workflow started", data: "Status: Pending Billing Clearance" },
      { step: 17, role: "Pharmacist", action: "Dispense discharge medications", location: "/app/pharmacy", expected: "Medications dispensed", data: "Handed to patient/attendant" },
      { step: 18, role: "Accountant", action: "Generate final bill", location: "/app/billing", expected: "All IPD charges compiled", data: "Room charges, medications, procedures" },
      { step: 19, role: "Accountant", action: "Apply deposit and collect balance", location: "Payment Modal", expected: "Final payment collected", data: "Deposit adjusted, balance paid" },
      { step: 20, role: "Accountant", action: "Mark billing cleared", location: "Invoice", expected: "Status: Paid, Discharge cleared", data: "Print final invoice/receipt" },
      { step: 21, role: "IPD Nurse", action: "Complete discharge", location: "/app/ipd/discharges", expected: "Discharge summary generated", data: "Summary includes diagnosis, treatment, follow-up" },
      { step: 22, role: "IPD Nurse", action: "Print discharge summary", location: "Discharge Summary", expected: "PDF generated for patient", data: "Includes medication list, follow-up date" },
      { step: 23, role: "System", action: "Bed released to housekeeping", location: "Bed Management", expected: "Bed status: Cleaning Required", data: "Appears in housekeeping queue" },
      { step: 24, role: "Housekeeping", action: "Mark bed cleaned", location: "/app/ipd/housekeeping", expected: "Bed status: Available", data: "Ready for next patient" }
    ]
  },
  {
    id: "journey-surgery",
    name: "Scheduled Surgery (OT Flow)",
    icon: Syringe,
    description: "Elective surgery from scheduling through operation to post-op recovery",
    roles: ["Receptionist", "Surgeon", "Anesthetist", "OT Tech", "PACU Nurse"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "Receptionist", action: "Create surgery booking", location: "/app/ot/schedule", expected: "Surgery scheduled with OT room", data: "Patient, Surgeon, Date/Time, Procedure" },
      { step: 2, role: "Receptionist", action: "Select OT room and time slot", location: "OT Booking", expected: "OT room reserved", data: "OT Room 1, 09:00 AM, Duration: 2 hours" },
      { step: 3, role: "Surgeon", action: "Complete pre-operative assessment", location: "/app/ot/pre-op", expected: "Pre-op assessment documented", data: "Physical exam, consent, surgical plan" },
      { step: 4, role: "Anesthetist", action: "Pre-anesthesia checkup (PAC)", location: "/app/ot/pac", expected: "PAC cleared, ASA grade assigned", data: "Airway assessment, NPO status, allergies" },
      { step: 5, role: "Anesthetist", action: "Create anesthesia plan", location: "Anesthesia Plan", expected: "Plan documented", data: "General anesthesia, ETT, monitoring plan" },
      { step: 6, role: "OT Tech", action: "View OT schedule for today", location: "/app/ot/schedule", expected: "Today's surgeries listed", data: "Shows time, patient, procedure, surgeon" },
      { step: 7, role: "OT Tech", action: "Prepare OT room", location: "OT Dashboard", expected: "Room status: Ready", data: "Equipment checked, instruments sterilized" },
      { step: 8, role: "OT Tech", action: "Patient arrives in OT", location: "OT Check-in", expected: "Patient checked in, WHO checklist started", data: "Verify identity, consent, site marking" },
      { step: 9, role: "OT Tech", action: "Complete WHO Safety Checklist - Sign In", location: "Checklist", expected: "Sign In completed", data: "Patient identity, procedure, allergies confirmed" },
      { step: 10, role: "Anesthetist", action: "Start anesthesia", location: "Anesthesia Record", expected: "Induction time logged", data: "Drugs given, airway secured, monitoring started" },
      { step: 11, role: "Surgeon", action: "Surgery begins (Time Out)", location: "OT Notes", expected: "Incision time recorded", data: "Team confirms patient, site, procedure" },
      { step: 12, role: "Surgeon", action: "Perform surgical procedure", location: "Intra-op Notes", expected: "Procedure steps documented", data: "Findings, technique, complications (if any)" },
      { step: 13, role: "OT Tech", action: "Log consumables and implants used", location: "Consumables Form", expected: "All items recorded for billing", data: "Sutures, staples, implants with lot numbers" },
      { step: 14, role: "Surgeon", action: "Complete procedure (Sign Out)", location: "WHO Checklist", expected: "Sign Out completed", data: "Specimen labeling, counts correct, recovery plan" },
      { step: 15, role: "Anesthetist", action: "End anesthesia, extubate patient", location: "Anesthesia Record", expected: "Emergence time logged", data: "Reversal given, extubation successful" },
      { step: 16, role: "Anesthetist", action: "Complete anesthesia record", location: "Anesthesia Form", expected: "Full record documented", data: "Total duration, drugs, fluids, blood loss" },
      { step: 17, role: "PACU Nurse", action: "Receive patient in recovery", location: "/app/ot/pacu", expected: "PACU admission recorded", data: "Aldrete score on arrival" },
      { step: 18, role: "PACU Nurse", action: "Monitor vitals every 15 minutes", location: "PACU Monitoring", expected: "Vitals logged with recovery score", data: "BP, pulse, SpO2, consciousness, pain score" },
      { step: 19, role: "PACU Nurse", action: "Assess discharge readiness", location: "PACU Discharge", expected: "Aldrete score ≥9", data: "Activity, respiration, circulation, consciousness" },
      { step: 20, role: "PACU Nurse", action: "Transfer to ward", location: "Transfer Form", expected: "Patient transferred to IPD bed", data: "Handover to IPD nurse, post-op orders given" }
    ]
  },
  // ============ COMPREHENSIVE IPD FLOW SCENARIOS ============
  {
    id: "journey-elective-surgery-complete",
    name: "IPD Flow 1: Elective Surgery (Complete Journey)",
    icon: Syringe,
    description: "Planned surgery patient from OPD referral through pre-op, surgery, recovery, and discharge with full billing integration",
    roles: ["Receptionist", "OPD Doctor", "Surgeon", "Anesthetist", "OT Tech", "PACU Nurse", "IPD Nurse", "Pharmacist", "Dietitian", "Accountant", "Housekeeping"],
    estimatedTime: "45-60 minutes",
    steps: [
      // Phase 1: OPD & Admission Planning
      { step: 1, role: "Receptionist", action: "Search existing patient or register new", location: "/app/patients", expected: "Patient found/created with MR#", data: "Patient: Ahmad Raza, MR-2024-00050" },
      { step: 2, role: "Receptionist", action: "Create OPD appointment with Surgeon", location: "/app/appointments/new", expected: "Token generated for Surgery OPD", data: "Dr. Surgical Specialist" },
      { step: 3, role: "OPD Doctor", action: "Complete surgical consultation", location: "/app/opd/consultation", expected: "Diagnosis recorded, surgery recommended", data: "Diagnosis: Cholecystitis, Plan: Laparoscopic Cholecystectomy" },
      { step: 4, role: "OPD Doctor", action: "Order pre-operative lab tests", location: "Lab Orders", expected: "Pre-op panel ordered", data: "CBC, PT/INR, LFT, RFT, Blood Group, HBsAg, HCV" },
      { step: 5, role: "OPD Doctor", action: "Order chest X-ray and ECG", location: "Radiology Orders", expected: "Imaging orders created", data: "Chest PA view, 12-lead ECG" },
      { step: 6, role: "Receptionist", action: "Schedule planned admission", location: "/app/ipd/admissions/new", expected: "Future admission created", data: "Admission date: 3 days from today" },
      { step: 7, role: "Receptionist", action: "Reserve surgical ward bed", location: "Bed Selection", expected: "Bed status: Reserved", data: "Surgical Ward, Bed SW-05" },
      { step: 8, role: "Receptionist", action: "Collect admission deposit (50%)", location: "Deposit Form", expected: "Deposit receipt generated", data: "PKR 75,000 advance for surgery" },
      
      // Phase 2: Pre-operative Preparation
      { step: 9, role: "Lab Tech", action: "Complete all pre-op lab tests", location: "/app/lab/queue", expected: "All results published", data: "Results within normal limits" },
      { step: 10, role: "Radiologist", action: "Report chest X-ray and ECG", location: "/app/radiology", expected: "Reports finalized", data: "NAD on CXR, Normal sinus rhythm" },
      { step: 11, role: "Surgeon", action: "Review all pre-op results", location: "Patient Profile", expected: "Patient cleared for surgery", data: "All investigations reviewed and cleared" },
      { step: 12, role: "Anesthetist", action: "Pre-anesthesia checkup (PAC)", location: "/app/ot/pac", expected: "PAC assessment complete", data: "ASA Grade II, airway Mallampati 2" },
      { step: 13, role: "Anesthetist", action: "Document anesthesia plan", location: "PAC Form", expected: "Plan documented", data: "General anesthesia, LMA planned, NPO 6hrs" },
      { step: 14, role: "Receptionist", action: "Schedule OT slot", location: "/app/ot/schedule", expected: "Surgery scheduled", data: "OT Room 2, 09:00 AM, Duration: 2 hours" },
      
      // Phase 3: Admission Day
      { step: 15, role: "IPD Nurse", action: "Patient arrives - activate admission", location: "/app/ipd/admissions", expected: "Status: Active, Bed: Occupied", data: "Click 'Admit Now' on scheduled admission" },
      { step: 16, role: "IPD Nurse", action: "Complete admission nursing assessment", location: "Assessment Form", expected: "Full assessment documented", data: "Allergies: None, Fall risk: Low, Skin intact" },
      { step: 17, role: "IPD Nurse", action: "Record baseline vitals", location: "/app/ipd/vitals", expected: "Vitals charted", data: "BP: 130/85, Pulse: 78, Temp: 98.4°F, SpO2: 99%" },
      { step: 18, role: "IPD Nurse", action: "Verify NPO status from midnight", location: "Nursing Notes", expected: "NPO compliance confirmed", data: "Last meal: 10 PM previous day" },
      { step: 19, role: "IPD Nurse", action: "Prepare patient for OT", location: "Pre-op Checklist", expected: "Checklist complete", data: "Consent signed, site marked, jewelry removed" },
      { step: 20, role: "IPD Nurse", action: "Administer pre-op medications", location: "/app/ipd/emar", expected: "Pre-op meds given", data: "Pantoprazole 40mg IV, Ondansetron 4mg IV" },
      
      // Phase 4: Surgery (OT)
      { step: 21, role: "OT Tech", action: "Receive patient in OT holding", location: "OT Check-in", expected: "Patient checked in", data: "Identity verified, consent reviewed" },
      { step: 22, role: "OT Tech", action: "Complete WHO Sign-In checklist", location: "WHO Checklist", expected: "Sign-In complete", data: "Patient identity, allergies, site marking verified" },
      { step: 23, role: "Anesthetist", action: "Induce general anesthesia", location: "/app/ot/anesthesia", expected: "Induction logged", data: "Propofol 150mg, Fentanyl 100mcg, Rocuronium 40mg" },
      { step: 24, role: "Anesthetist", action: "Secure airway with LMA", location: "Anesthesia Record", expected: "Airway secured", data: "LMA #4, first attempt, no complications" },
      { step: 25, role: "Surgeon", action: "Complete WHO Time-Out", location: "WHO Checklist", expected: "Time-Out complete", data: "Team confirms patient, procedure, antibiotics given" },
      { step: 26, role: "Surgeon", action: "Perform laparoscopic cholecystectomy", location: "/app/ot/surgery-notes", expected: "Procedure documented", data: "4-port technique, gallbladder removed intact" },
      { step: 27, role: "OT Tech", action: "Log all consumables used", location: "Consumables Form", expected: "Items recorded for billing", data: "Trocars x4, clip appliers, endobag" },
      { step: 28, role: "Surgeon", action: "Complete WHO Sign-Out", location: "WHO Checklist", expected: "Sign-Out complete", data: "Counts correct, specimen labeled, recovery plan" },
      { step: 29, role: "Anesthetist", action: "Reverse anesthesia, extubate", location: "Anesthesia Record", expected: "Emergence complete", data: "Sugammadex 200mg, smooth extubation" },
      { step: 30, role: "Anesthetist", action: "Complete anesthesia record", location: "Anesthesia Form", expected: "Full record saved", data: "Duration: 1hr 45min, EBL: 50ml, stable vitals" },
      
      // Phase 5: Post-Operative Recovery (PACU)
      { step: 31, role: "PACU Nurse", action: "Receive patient in recovery", location: "/app/ot/pacu", expected: "PACU admission logged", data: "Aldrete score: 7 on arrival" },
      { step: 32, role: "PACU Nurse", action: "Monitor vitals every 5 minutes initially", location: "PACU Monitoring", expected: "Continuous monitoring documented", data: "BP, pulse, SpO2, consciousness level" },
      { step: 33, role: "PACU Nurse", action: "Assess pain and administer analgesia", location: "PACU Chart", expected: "Pain managed", data: "Pain score 6/10, Tramadol 50mg IV given" },
      { step: 34, role: "PACU Nurse", action: "Monitor for complications", location: "PACU Notes", expected: "No complications noted", data: "No nausea, bleeding, or respiratory issues" },
      { step: 35, role: "PACU Nurse", action: "Achieve discharge criteria", location: "PACU Discharge", expected: "Aldrete score ≥9", data: "Score: 10, stable vitals, pain controlled" },
      { step: 36, role: "PACU Nurse", action: "Handover to ward nurse", location: "Transfer Form", expected: "Handover completed", data: "Post-op orders, drain status, pain plan" },
      
      // Phase 6: Post-Operative Ward Care
      { step: 37, role: "IPD Nurse", action: "Receive patient from PACU", location: "/app/ipd/nursing-station", expected: "Patient back in ward bed", data: "Verify identity, review handover notes" },
      { step: 38, role: "IPD Nurse", action: "Record post-op vitals", location: "/app/ipd/vitals", expected: "First ward vitals logged", data: "2-hourly vitals for first 12 hours" },
      { step: 39, role: "Surgeon", action: "Post-operative round", location: "/app/ipd/rounds", expected: "Post-op orders documented", data: "Ambulation, diet progression, drain care" },
      { step: 40, role: "Surgeon", action: "Order post-op medications", location: "Prescription", expected: "IPD prescription created", data: "IV antibiotics, analgesics, DVT prophylaxis" },
      { step: 41, role: "IPD Nurse", action: "Administer evening medications", location: "/app/ipd/emar", expected: "All doses recorded", data: "Ceftriaxone 1g IV, Paracetamol 1g IV" },
      { step: 42, role: "Dietitian", action: "Assign post-surgical diet", location: "/app/ipd/diet", expected: "Diet plan active", data: "Clear liquids Day 0, soft diet Day 1" },
      { step: 43, role: "IPD Nurse", action: "Complete shift nursing notes", location: "/app/ipd/nursing-notes", expected: "Shift summary documented", data: "Patient stable, no complications" },
      
      // Phase 7: Recovery Days
      { step: 44, role: "IPD Nurse", action: "Day 1 morning vitals & assessment", location: "/app/ipd/vitals", expected: "Vitals within normal limits", data: "Temp: 99°F (low-grade expected)" },
      { step: 45, role: "Surgeon", action: "Day 1 round - assess wound", location: "/app/ipd/rounds", expected: "Progress documented", data: "Wound dry, drain output 30ml, ambulatory" },
      { step: 46, role: "IPD Nurse", action: "Remove drain as ordered", location: "Nursing Procedure", expected: "Drain removal documented", data: "Drain removed, site clean" },
      { step: 47, role: "Surgeon", action: "Day 2 round - discharge planning", location: "/app/ipd/rounds", expected: "Discharge planned", data: "Clinically fit, plan discharge today" },
      
      // Phase 8: Discharge Process
      { step: 48, role: "Surgeon", action: "Create discharge medications", location: "Prescription", expected: "Take-home Rx created", data: "Oral antibiotics 5 days, analgesics PRN" },
      { step: 49, role: "Surgeon", action: "Initiate discharge", location: "/app/ipd/discharges", expected: "Discharge workflow started", data: "Status: Pending Billing Clearance" },
      { step: 50, role: "Pharmacist", action: "Dispense discharge medications", location: "/app/pharmacy/pos", expected: "Medications dispensed", data: "Patient counseled on medications" },
      { step: 51, role: "Accountant", action: "Generate final IPD bill", location: "/app/billing", expected: "All charges compiled", data: "Room: PKR 12K, OT: PKR 80K, Meds: PKR 15K" },
      { step: 52, role: "Accountant", action: "Apply deposit, collect balance", location: "Payment Modal", expected: "Final payment collected", data: "Total: PKR 150K, Deposit: 75K, Balance: 75K" },
      { step: 53, role: "Accountant", action: "Mark billing cleared", location: "Invoice", expected: "Status: Paid", data: "Print invoice and receipt" },
      { step: 54, role: "IPD Nurse", action: "Generate discharge summary", location: "/app/ipd/discharges", expected: "Summary created", data: "Diagnosis, procedure, meds, follow-up" },
      { step: 55, role: "IPD Nurse", action: "Complete final discharge", location: "Discharge Form", expected: "Patient discharged", data: "Bed released, summary printed" },
      { step: 56, role: "Housekeeping", action: "Mark bed for cleaning", location: "/app/ipd/housekeeping", expected: "Bed status: Cleaning Required", data: "Appears in housekeeping queue" },
      { step: 57, role: "Housekeeping", action: "Complete bed cleaning", location: "/app/ipd/housekeeping", expected: "Bed status: Available", data: "Ready for next admission" }
    ]
  },
  {
    id: "journey-emergency-icu-complete",
    name: "IPD Flow 2: Emergency ICU Admission (Critical Care)",
    icon: HeartPulse,
    description: "Critical emergency patient through ER stabilization, ICU admission, intensive monitoring, step-down transfer, and discharge",
    roles: ["ER Staff", "ER Doctor", "ICU Nurse", "Intensivist", "Lab Tech", "Pharmacist", "IPD Nurse", "Respiratory Therapist", "Accountant"],
    estimatedTime: "50-60 minutes",
    steps: [
      // Phase 1: Emergency Arrival & Stabilization
      { step: 1, role: "ER Staff", action: "Ambulance arrival notification", location: "/app/emergency", expected: "Alert displayed on ER dashboard", data: "ETA 5 mins, chest pain, BP 80/50" },
      { step: 2, role: "ER Staff", action: "Quick registration (unknown patient)", location: "/app/emergency/register", expected: "ER# generated immediately", data: "Unknown Male, ~55 years" },
      { step: 3, role: "ER Staff", action: "Triage: ESI Level 1 (Resuscitation)", location: "Triage Form", expected: "Red 'Resuscitation' badge", data: "Chief complaint: Crushing chest pain, diaphoresis" },
      { step: 4, role: "ER Staff", action: "Record critical vitals", location: "Vitals Section", expected: "All values highlighted as abnormal", data: "BP: 80/50, HR: 130, RR: 28, SpO2: 88%" },
      { step: 5, role: "ER Doctor", action: "Immediately assess patient", location: "/app/emergency", expected: "Treatment form opens", data: "Patient at top of queue (red priority)" },
      { step: 6, role: "ER Doctor", action: "Order STAT cardiac workup", location: "Orders Section", expected: "Urgent orders created", data: "Troponin, ECG, Chest X-ray STAT" },
      { step: 7, role: "ER Doctor", action: "Initiate resuscitation measures", location: "Treatment Notes", expected: "Interventions logged", data: "O2 15L NRB, 2 large bore IV, fluid bolus" },
      { step: 8, role: "ER Doctor", action: "Administer emergency medications", location: "Medications", expected: "Meds logged with times", data: "Aspirin 325mg, Heparin 5000U, Morphine 4mg" },
      { step: 9, role: "Lab Tech", action: "STAT lab results reported", location: "/app/lab/queue", expected: "Critical value alert", data: "Troponin: 8.5 ng/mL (CRITICAL HIGH)" },
      { step: 10, role: "ER Doctor", action: "Diagnosis: STEMI", location: "ER Notes", expected: "Diagnosis documented", data: "Acute anterior STEMI, hemodynamically unstable" },
      { step: 11, role: "ER Doctor", action: "Decision: ICU admission", location: "Disposition", expected: "ICU admission initiated", data: "Requires intensive monitoring and possible cath" },
      
      // Phase 2: ICU Admission
      { step: 12, role: "ICU Nurse", action: "Accept admission from ER", location: "/app/ipd/admissions", expected: "ICU admission created", data: "All ER data transferred" },
      { step: 13, role: "ICU Nurse", action: "Assign ICU bed with monitor", location: "Bed Selection", expected: "Bed occupied with monitoring", data: "ICU Bed 03 with cardiac monitor" },
      { step: 14, role: "ICU Nurse", action: "Complete ICU admission assessment", location: "ICU Assessment", expected: "Critical care assessment done", data: "Sedation scale, pain, skin, lines, drains" },
      { step: 15, role: "ICU Nurse", action: "Initiate continuous monitoring", location: "/app/ipd/vitals", expected: "Continuous charting started", data: "15-minute vital recording" },
      { step: 16, role: "ICU Nurse", action: "Insert Foley catheter, document", location: "Procedures", expected: "Urinary output monitoring started", data: "Target UOP >0.5 ml/kg/hr" },
      { step: 17, role: "Intensivist", action: "Complete ICU admission orders", location: "/app/ipd/rounds", expected: "Comprehensive orders set", data: "Ventilator, sedation, pressors, labs" },
      { step: 18, role: "Intensivist", action: "Order continuous cardiac monitoring", location: "Orders", expected: "Cardiac monitoring active", data: "Continuous ECG, q4h troponin" },
      { step: 19, role: "Intensivist", action: "Initiate vasopressor support", location: "Medication Orders", expected: "Drip started", data: "Norepinephrine 0.1 mcg/kg/min titrate to MAP >65" },
      { step: 20, role: "Pharmacist", action: "Verify and dispense ICU medications", location: "/app/pharmacy", expected: "Critical meds dispensed", data: "High-risk medications double-checked" },
      
      // Phase 3: ICU Days - Intensive Monitoring
      { step: 21, role: "ICU Nurse", action: "Document hourly I/O", location: "/app/ipd/io-chart", expected: "Fluid balance tracked", data: "Input: IV fluids, Output: Urine, drains" },
      { step: 22, role: "ICU Nurse", action: "Administer medications per eMAR", location: "/app/ipd/emar", expected: "All doses with times recorded", data: "Heparin drip, antibiotics, sedation" },
      { step: 23, role: "Lab Tech", action: "Process serial cardiac markers", location: "/app/lab/queue", expected: "Trending troponins reported", data: "Troponin trending down: 8.5→6.2→4.1" },
      { step: 24, role: "Intensivist", action: "Day 1 ICU round", location: "/app/ipd/rounds", expected: "SOAP note documented", data: "Hemodynamically stable on low-dose pressors" },
      { step: 25, role: "Respiratory Therapist", action: "Assess respiratory status", location: "RT Notes", expected: "RT assessment complete", data: "ABG: pH 7.38, pCO2 42, pO2 85, O2 2L NC" },
      { step: 26, role: "ICU Nurse", action: "Complete nursing care bundle", location: "ICU Bundles", expected: "DVT/VAP prevention documented", data: "HOB 30°, SCDs on, CHG bath done" },
      { step: 27, role: "Intensivist", action: "Day 2 round - wean pressors", location: "/app/ipd/rounds", expected: "Weaning plan documented", data: "Norepinephrine weaned off, MAP stable" },
      { step: 28, role: "Dietitian", action: "Initiate ICU nutrition", location: "/app/ipd/diet", expected: "Enteral feeding started", data: "Tube feeding 40ml/hr, goal 80ml/hr" },
      
      // Phase 4: Step-Down Transfer
      { step: 29, role: "Intensivist", action: "Assess for step-down readiness", location: "/app/ipd/rounds", expected: "Transfer criteria met", data: "Off pressors 24hrs, stable on room air" },
      { step: 30, role: "Intensivist", action: "Order step-down transfer", location: "Transfer Order", expected: "Transfer request created", data: "To Cardiac Step-Down Unit" },
      { step: 31, role: "ICU Nurse", action: "Complete transfer nursing summary", location: "Transfer Notes", expected: "Comprehensive handover prepared", data: "All lines, drains, meds, plan summarized" },
      { step: 32, role: "ICU Nurse", action: "Initiate bed transfer", location: "/app/ipd/bed-transfers", expected: "Transfer logged", data: "From ICU-03 to Step-Down-05" },
      { step: 33, role: "IPD Nurse", action: "Accept patient in step-down", location: "/app/ipd/nursing-station", expected: "Patient received", data: "Verify all equipment and orders" },
      { step: 34, role: "IPD Nurse", action: "Initial step-down assessment", location: "Nursing Assessment", expected: "New baseline established", data: "Telemetry monitoring initiated" },
      
      // Phase 5: General Ward & Discharge
      { step: 35, role: "Intensivist", action: "Day 4 round - discharge planning", location: "/app/ipd/rounds", expected: "Discharge plan initiated", data: "Stable, transition to oral meds" },
      { step: 36, role: "Intensivist", action: "Create discharge medications", location: "Prescription", expected: "Cardiac discharge regimen", data: "Aspirin, Clopidogrel, Atorvastatin, Metoprolol" },
      { step: 37, role: "IPD Nurse", action: "Patient education", location: "Discharge Teaching", expected: "Education documented", data: "Cardiac diet, warning signs, follow-up" },
      { step: 38, role: "Intensivist", action: "Initiate discharge", location: "/app/ipd/discharges", expected: "Discharge workflow started", data: "Pending billing clearance" },
      { step: 39, role: "Accountant", action: "Generate ICU billing", location: "/app/billing", expected: "All ICU charges compiled", data: "ICU days, meds, procedures, monitoring" },
      { step: 40, role: "Accountant", action: "Process insurance claim", location: "Insurance Module", expected: "Claim submitted", data: "Pre-auth verified, claim processed" },
      { step: 41, role: "Accountant", action: "Collect patient portion", location: "Payment", expected: "Copay collected", data: "Print final invoice" },
      { step: 42, role: "IPD Nurse", action: "Complete discharge summary", location: "/app/ipd/discharges", expected: "Summary generated", data: "STEMI, ICU course, cardiac rehab referral" },
      { step: 43, role: "IPD Nurse", action: "Final discharge", location: "Discharge Form", expected: "Patient discharged", data: "Follow-up: Cardiology in 1 week" }
    ]
  },
  {
    id: "journey-medical-investigation",
    name: "IPD Flow 3: Medical Investigation Stay (Diagnostic Workup)",
    icon: TestTube,
    description: "Patient admitted for comprehensive diagnostic workup with serial labs, imaging, and specialist consultations",
    roles: ["Receptionist", "Admitting Doctor", "IPD Nurse", "Lab Tech", "Radiologist", "Specialist", "Pharmacist", "Accountant"],
    estimatedTime: "40-50 minutes",
    steps: [
      // Phase 1: OPD Assessment & Admission Decision
      { step: 1, role: "Receptionist", action: "Patient presents with chronic symptoms", location: "/app/patients", expected: "Patient record accessed", data: "MR-2024-00075, 6-month weight loss, fatigue" },
      { step: 2, role: "Admitting Doctor", action: "OPD consultation - needs workup", location: "/app/opd/consultation", expected: "Admission recommended", data: "R/O malignancy, requires inpatient workup" },
      { step: 3, role: "Admitting Doctor", action: "Order initial lab panel", location: "Lab Orders", expected: "Baseline labs ordered", data: "CBC, CMP, LFT, TFT, LDH, Tumor markers" },
      { step: 4, role: "Receptionist", action: "Create planned admission", location: "/app/ipd/admissions/new", expected: "Admission scheduled", data: "Medical ward, investigation stay" },
      { step: 5, role: "Receptionist", action: "Assign bed in medical ward", location: "Bed Selection", expected: "Bed reserved", data: "Medical Ward B, Bed MW-12" },
      { step: 6, role: "Receptionist", action: "Collect investigation deposit", location: "Deposit Form", expected: "Deposit recorded", data: "PKR 30,000 for investigations" },
      
      // Phase 2: Admission & Initial Assessment
      { step: 7, role: "IPD Nurse", action: "Admit patient", location: "/app/ipd/admissions", expected: "Admission activated", data: "Status: Active, ward assigned" },
      { step: 8, role: "IPD Nurse", action: "Complete admission assessment", location: "Assessment Form", expected: "Full history documented", data: "6-month history, 10kg weight loss, night sweats" },
      { step: 9, role: "IPD Nurse", action: "Record baseline vitals", location: "/app/ipd/vitals", expected: "Vitals charted", data: "Temp: 99.5°F (low-grade fever)" },
      { step: 10, role: "Admitting Doctor", action: "Document admission plan", location: "/app/ipd/rounds", expected: "Investigation plan documented", data: "Day 1-2: Labs, Day 2-3: Imaging, Day 3+: Biopsy if needed" },
      { step: 11, role: "Admitting Doctor", action: "Order Day 1 investigations", location: "Orders", expected: "Serial labs ordered", data: "CBC, ESR, CRP, Peripheral smear, Bone marrow aspiration" },
      
      // Phase 3: Day 1 - Laboratory Workup
      { step: 12, role: "Lab Tech", action: "Collect blood samples", location: "/app/lab/queue", expected: "Samples collected", data: "Multiple tubes for various tests" },
      { step: 13, role: "Lab Tech", action: "Process and report CBC", location: "Lab Results", expected: "Abnormal results flagged", data: "WBC: 25,000 (HIGH), Hgb: 8.5 (LOW), Plt: 95K (LOW)" },
      { step: 14, role: "Lab Tech", action: "Report peripheral smear", location: "Lab Results", expected: "Morphology reported", data: "Atypical lymphocytes seen, blast cells 15%" },
      { step: 15, role: "Lab Tech", action: "Tumor markers reported", location: "Lab Results", expected: "Results available", data: "LDH: 850 (HIGH), AFP: Normal, CEA: Borderline" },
      { step: 16, role: "IPD Nurse", action: "Record 6-hourly vitals", location: "/app/ipd/vitals", expected: "Vitals trending", data: "Temperature trend documented" },
      { step: 17, role: "Admitting Doctor", action: "Review Day 1 results", location: "/app/ipd/rounds", expected: "Findings documented", data: "Concerning for hematologic malignancy" },
      { step: 18, role: "Admitting Doctor", action: "Request Hematology consult", location: "Consult Request", expected: "Specialist consult ordered", data: "Urgent hematology opinion" },
      
      // Phase 4: Day 2 - Imaging & Specialist Input
      { step: 19, role: "Admitting Doctor", action: "Order imaging studies", location: "Radiology Orders", expected: "Imaging scheduled", data: "CT Chest/Abdomen/Pelvis, Bone scan" },
      { step: 20, role: "Radiologist", action: "Perform CT scan", location: "/app/radiology", expected: "Images acquired", data: "Contrast-enhanced CT complete" },
      { step: 21, role: "Radiologist", action: "Report CT findings", location: "Radiology Report", expected: "Findings documented", data: "Multiple enlarged lymph nodes, splenomegaly" },
      { step: 22, role: "Specialist", action: "Hematology consultation", location: "/app/ipd/consultations", expected: "Specialist notes documented", data: "Recommend bone marrow biopsy, flow cytometry" },
      { step: 23, role: "Specialist", action: "Order bone marrow biopsy", location: "Procedure Orders", expected: "Biopsy scheduled", data: "Posterior iliac crest, Day 3 morning" },
      { step: 24, role: "IPD Nurse", action: "Prepare for biopsy", location: "Nursing Notes", expected: "Pre-procedure checklist", data: "Consent obtained, coags reviewed, NPO from midnight" },
      
      // Phase 5: Day 3 - Procedure & Serial Monitoring
      { step: 25, role: "Specialist", action: "Perform bone marrow biopsy", location: "Procedure Room", expected: "Procedure completed", data: "Aspirate and trephine obtained" },
      { step: 26, role: "IPD Nurse", action: "Post-procedure monitoring", location: "/app/ipd/vitals", expected: "Hourly vitals x4", data: "Monitor for bleeding, pain management" },
      { step: 27, role: "Lab Tech", action: "Process bone marrow sample", location: "/app/lab", expected: "Samples sent for analysis", data: "Morphology, flow cytometry, cytogenetics" },
      { step: 28, role: "Pharmacist", action: "Dispense supportive medications", location: "/app/pharmacy", expected: "Medications provided", data: "Analgesics, antiemetics, supplements" },
      { step: 29, role: "IPD Nurse", action: "Administer ordered medications", location: "/app/ipd/emar", expected: "All doses documented", data: "Iron, B12, blood transfusion if needed" },
      
      // Phase 6: Day 4-5 - Results & Diagnosis
      { step: 30, role: "Lab Tech", action: "Report bone marrow results", location: "/app/lab", expected: "Diagnostic results", data: "Acute Lymphoblastic Leukemia (ALL) confirmed" },
      { step: 31, role: "Specialist", action: "Review all results", location: "Case Summary", expected: "Final diagnosis made", data: "B-ALL, standard risk features" },
      { step: 32, role: "Specialist", action: "Family meeting & counseling", location: "Progress Notes", expected: "Discussion documented", data: "Diagnosis explained, treatment options discussed" },
      { step: 33, role: "Specialist", action: "Treatment plan documentation", location: "/app/ipd/rounds", expected: "Chemo protocol selected", data: "BFM protocol, start after port placement" },
      { step: 34, role: "Admitting Doctor", action: "Coordinate oncology referral", location: "Referral", expected: "Outpatient oncology scheduled", data: "Transfer to oncology center for treatment" },
      
      // Phase 7: Discharge Planning
      { step: 35, role: "Specialist", action: "Create discharge medications", location: "Prescription", expected: "Supportive care Rx", data: "Folic acid, B12, iron supplements" },
      { step: 36, role: "Specialist", action: "Initiate discharge", location: "/app/ipd/discharges", expected: "Discharge workflow started", data: "Investigation workup complete" },
      { step: 37, role: "Accountant", action: "Generate investigation bill", location: "/app/billing", expected: "All charges compiled", data: "Labs: PKR 45K, CT: PKR 25K, Biopsy: PKR 20K" },
      { step: 38, role: "Accountant", action: "Process payment", location: "Payment", expected: "Bill settled", data: "Insurance + patient copay" },
      { step: 39, role: "IPD Nurse", action: "Complete discharge summary", location: "/app/ipd/discharges", expected: "Comprehensive summary", data: "Diagnosis, workup results, oncology follow-up" },
      { step: 40, role: "IPD Nurse", action: "Patient education & handover", location: "Discharge Teaching", expected: "Education documented", data: "Warning signs, infection precautions, follow-up dates" }
    ]
  },
  {
    id: "journey-maternity-complete",
    name: "IPD Flow 4: Maternity - Labor & Delivery (Mother-Baby Care)",
    icon: Building2,
    description: "Complete maternity journey from labor admission through delivery, newborn care, and mother-baby discharge",
    roles: ["Receptionist", "L&D Nurse", "Obstetrician", "Pediatrician", "Anesthetist", "Nursery Nurse", "Pharmacist", "Accountant"],
    estimatedTime: "50-60 minutes",
    steps: [
      // Phase 1: Labor Admission
      { step: 1, role: "Receptionist", action: "Pregnant patient arrives in labor", location: "/app/emergency", expected: "Quick maternity registration", data: "Fatima Khan, G2P1, 39 weeks, contractions" },
      { step: 2, role: "Receptionist", action: "Access existing ANC record", location: "Patient Profile", expected: "Antenatal history available", data: "Low-risk pregnancy, all ANC visits complete" },
      { step: 3, role: "L&D Nurse", action: "Initial labor assessment", location: "/app/ipd/labor-tracking", expected: "Labor status documented", data: "Contractions q5min, cervix 4cm, membranes intact" },
      { step: 4, role: "L&D Nurse", action: "Apply fetal monitor", location: "Labor Monitoring", expected: "CTG tracing started", data: "FHR: 140bpm, reactive, no decelerations" },
      { step: 5, role: "L&D Nurse", action: "Record admission vitals", location: "/app/ipd/vitals", expected: "Baseline vitals charted", data: "BP: 120/80, Pulse: 88, Temp: 98.6°F" },
      { step: 6, role: "Obstetrician", action: "Admission examination", location: "/app/ipd/rounds", expected: "Obstetric assessment documented", data: "Vertex presentation, adequate pelvis, plan vaginal delivery" },
      { step: 7, role: "Receptionist", action: "Create L&D admission", location: "/app/ipd/admissions/new", expected: "Maternity admission created", data: "L&D Room 3, labor bed assigned" },
      
      // Phase 2: Active Labor
      { step: 8, role: "L&D Nurse", action: "Hourly labor progress", location: "/app/ipd/labor-tracking", expected: "Partograph updated", data: "Cervix 6cm at 2 hours, progressing well" },
      { step: 9, role: "L&D Nurse", action: "Continuous fetal monitoring", location: "CTG Monitoring", expected: "FHR patterns documented", data: "Category 1 tracing, reassuring" },
      { step: 10, role: "L&D Nurse", action: "Pain assessment", location: "Nursing Notes", expected: "Pain score documented", data: "Pain 8/10, patient requests epidural" },
      { step: 11, role: "Obstetrician", action: "Order epidural analgesia", location: "Orders", expected: "Anesthesia consult placed", data: "Epidural for labor analgesia" },
      { step: 12, role: "Anesthetist", action: "Place epidural catheter", location: "Anesthesia Record", expected: "Epidural placed successfully", data: "L3-4 space, test dose negative" },
      { step: 13, role: "L&D Nurse", action: "Post-epidural monitoring", location: "/app/ipd/vitals", expected: "Vitals stable post-epidural", data: "BP maintained, pain relief achieved" },
      { step: 14, role: "L&D Nurse", action: "Progress check - 8cm", location: "/app/ipd/labor-tracking", expected: "Active labor continuing", data: "Cervix 8cm, station 0, membranes ruptured" },
      
      // Phase 3: Second Stage & Delivery
      { step: 15, role: "L&D Nurse", action: "Full dilation achieved", location: "/app/ipd/labor-tracking", expected: "Second stage started", data: "Cervix 10cm, head at +1 station" },
      { step: 16, role: "L&D Nurse", action: "Prepare for delivery", location: "Delivery Setup", expected: "Delivery room ready", data: "Resuscitation equipment, warmer ready" },
      { step: 17, role: "Obstetrician", action: "Conduct delivery", location: "Delivery Notes", expected: "Vaginal delivery documented", data: "SVD, male baby, 3.2 kg, cried immediately" },
      { step: 18, role: "Obstetrician", action: "Active third stage management", location: "Delivery Notes", expected: "Placenta delivered", data: "Oxytocin given, placenta complete, EBL 300ml" },
      { step: 19, role: "Obstetrician", action: "Perineal repair if needed", location: "Procedure Notes", expected: "Repair documented", data: "Second-degree tear, repaired with Vicryl" },
      { step: 20, role: "L&D Nurse", action: "Immediate newborn care", location: "Newborn Assessment", expected: "APGAR documented", data: "APGAR: 8 at 1min, 9 at 5min" },
      { step: 21, role: "L&D Nurse", action: "Initiate skin-to-skin contact", location: "Nursing Notes", expected: "Bonding documented", data: "Mother-baby skin contact, breastfeeding initiated" },
      
      // Phase 4: Newborn Registration & Care
      { step: 22, role: "Receptionist", action: "Register newborn patient", location: "/app/ipd/birth-records/new", expected: "Baby MR# generated", data: "Baby of Fatima Khan, linked to mother" },
      { step: 23, role: "Pediatrician", action: "Newborn examination", location: "/app/opd/gynecology", expected: "Full newborn exam documented", data: "Term baby, AGA, no anomalies" },
      { step: 24, role: "Nursery Nurse", action: "Administer newborn medications", location: "Baby eMAR", expected: "Prophylaxis given", data: "Vitamin K 1mg IM, eye prophylaxis" },
      { step: 25, role: "Nursery Nurse", action: "Record newborn vitals", location: "Baby Vitals", expected: "Baseline vitals charted", data: "Temp: 98.6°F, HR: 140, RR: 44, SpO2: 98%" },
      { step: 26, role: "Pediatrician", action: "Order newborn screening", location: "Lab Orders", expected: "Screening tests ordered", data: "Hearing screen, bilirubin, metabolic screen" },
      { step: 27, role: "L&D Nurse", action: "Apply newborn ID band", location: "ID Verification", expected: "ID band applied", data: "Matching mother-baby ID bands" },
      
      // Phase 5: Postpartum Care
      { step: 28, role: "L&D Nurse", action: "Transfer to postpartum room", location: "/app/ipd/bed-transfers", expected: "Transfer completed", data: "Mother and baby to Postpartum Room 5" },
      { step: 29, role: "L&D Nurse", action: "Postpartum assessment", location: "Nursing Assessment", expected: "Post-delivery assessment done", data: "Fundus firm, lochia normal, perineum intact" },
      { step: 30, role: "L&D Nurse", action: "Monitor for postpartum hemorrhage", location: "/app/ipd/vitals", expected: "Vitals stable", data: "2-hourly vitals x4, then 4-hourly" },
      { step: 31, role: "Obstetrician", action: "Postpartum round", location: "/app/ipd/rounds", expected: "Day 1 assessment documented", data: "Mother stable, plan discharge Day 2" },
      { step: 32, role: "Obstetrician", action: "Order postpartum medications", location: "Prescription", expected: "Medications ordered", data: "Iron, calcium, analgesics, stool softener" },
      { step: 33, role: "L&D Nurse", action: "Breastfeeding support", location: "Nursing Notes", expected: "Feeding assessment done", data: "Good latch, colostrum expressed" },
      { step: 34, role: "Nursery Nurse", action: "Monitor newborn feeding", location: "Baby Notes", expected: "Feeding log maintained", data: "Breastfed q2-3hr, good urine/stool output" },
      { step: 35, role: "Lab Tech", action: "Newborn bilirubin check", location: "/app/lab/queue", expected: "Bilirubin result", data: "Total bilirubin: 8 mg/dL (normal)" },
      
      // Phase 6: Day 2 - Discharge Preparation
      { step: 36, role: "Pediatrician", action: "Day 2 newborn exam", location: "Pediatric Notes", expected: "Pre-discharge exam done", data: "Baby well, no jaundice, feeding well" },
      { step: 37, role: "Pediatrician", action: "Order vaccinations", location: "Immunization Orders", expected: "Birth vaccines ordered", data: "BCG, Hepatitis B (Birth dose)" },
      { step: 38, role: "Nursery Nurse", action: "Administer vaccinations", location: "Baby eMAR", expected: "Vaccines given", data: "BCG left arm, HepB right thigh" },
      { step: 39, role: "Obstetrician", action: "Maternal discharge clearance", location: "/app/ipd/rounds", expected: "Mother fit for discharge", data: "Vitals stable, wound healing, ambulating" },
      { step: 40, role: "Obstetrician", action: "Create maternal discharge Rx", location: "Prescription", expected: "Take-home medications", data: "Iron, calcium, vitamins for 3 months" },
      { step: 41, role: "Pediatrician", action: "Create newborn discharge Rx", location: "Prescription", expected: "Baby medications", data: "Vitamin D drops 400IU daily" },
      
      // Phase 7: Discharge Process
      { step: 42, role: "Obstetrician", action: "Initiate discharge", location: "/app/ipd/discharges", expected: "Discharge workflow started", data: "Both mother and baby discharge" },
      { step: 43, role: "Pharmacist", action: "Dispense maternal medications", location: "/app/pharmacy/pos", expected: "Meds dispensed", data: "Patient counseled on all medications" },
      { step: 44, role: "Pharmacist", action: "Dispense baby medications", location: "/app/pharmacy/pos", expected: "Baby meds dispensed", data: "Vitamin D administration explained" },
      { step: 45, role: "Accountant", action: "Generate combined bill", location: "/app/billing", expected: "Mother + baby charges", data: "Delivery: PKR 80K, Baby: PKR 15K" },
      { step: 46, role: "Accountant", action: "Process payment", location: "Payment", expected: "Bill settled", data: "Insurance claim + patient copay" },
      { step: 47, role: "L&D Nurse", action: "Maternal discharge teaching", location: "Discharge Teaching", expected: "Education documented", data: "Warning signs, contraception, follow-up" },
      { step: 48, role: "Nursery Nurse", action: "Newborn care teaching", location: "Discharge Teaching", expected: "Baby care education", data: "Feeding, cord care, danger signs, follow-up" },
      { step: 49, role: "L&D Nurse", action: "Generate birth certificate", location: "/app/ipd/birth-records", expected: "Certificate ready", data: "Official birth documentation" },
      { step: 50, role: "L&D Nurse", action: "Complete discharge summaries", location: "/app/ipd/discharges", expected: "Both summaries generated", data: "Mother summary + baby discharge card" },
      { step: 51, role: "L&D Nurse", action: "Final discharge", location: "Discharge Form", expected: "Both patients discharged", data: "Follow-up: OB 6 weeks, Peds 1 week" }
    ]
  },
  {
    id: "journey-lab",
    name: "Laboratory Complete Flow",
    icon: TestTube,
    description: "Lab order from doctor through sample collection to patient result access",
    roles: ["Doctor", "Lab Tech", "Patient (Public Portal)"],
    estimatedTime: "15-20 minutes",
    steps: [
      { step: 1, role: "Doctor", action: "During consultation, create lab order", location: "/app/opd/consultation", expected: "Lab order created, status: Ordered", data: "Tests: CBC, LFT, RFT, Lipid Profile" },
      { step: 2, role: "Doctor", action: "Add clinical notes for lab", location: "Lab Order Form", expected: "Notes attached to order", data: "Fasting sample required, R/O diabetes" },
      { step: 3, role: "Doctor", action: "Complete consultation and save", location: "Consultation", expected: "Order sent to lab queue", data: "Patient instructed to go to lab" },
      { step: 4, role: "Lab Tech", action: "View lab queue", location: "/app/lab/queue", expected: "Order visible with orange 'Not Collected' card", data: "Shows patient, tests, ordering doctor" },
      { step: 5, role: "Lab Tech", action: "Click to open sample collection", location: "Order Card", expected: "Collection modal opens", data: "Patient details and test list shown" },
      { step: 6, role: "Lab Tech", action: "Enter sample barcode number", location: "Collection Modal", expected: "Barcode saved, status: Collected", data: "Barcode: LAB-2024-123456" },
      { step: 7, role: "Lab Tech", action: "Verify sample details and confirm", location: "Collection Modal", expected: "Card turns blue 'Collected'", data: "Sample type, collection time recorded" },
      { step: 8, role: "Lab Tech", action: "Process samples in lab", location: "Physical Lab", expected: "Results ready for entry", data: "Run tests on analyzers" },
      { step: 9, role: "Lab Tech", action: "Open result entry form", location: "/app/lab/queue", expected: "Result form with all parameters", data: "Each test's parameters listed" },
      { step: 10, role: "Lab Tech", action: "Enter CBC results", location: "Result Form", expected: "CBC values saved", data: "WBC: 7500, RBC: 4.8, Hgb: 14.2, Plt: 250000" },
      { step: 11, role: "Lab Tech", action: "Enter LFT results with abnormal value", location: "Result Form", expected: "Abnormal SGPT highlighted", data: "SGPT: 85 (H), SGOT: 32, Bilirubin: 0.9" },
      { step: 12, role: "Lab Tech", action: "Enter RFT results", location: "Result Form", expected: "RFT values saved", data: "Creatinine: 1.0, BUN: 18, Uric Acid: 5.2" },
      { step: 13, role: "Lab Tech", action: "Enter Lipid Profile results", location: "Result Form", expected: "Lipid values saved", data: "Cholesterol: 210 (H), TG: 150, HDL: 45, LDL: 140" },
      { step: 14, role: "Lab Tech", action: "Review all results for accuracy", location: "Result Review", expected: "All parameters verified", data: "Check for transcription errors" },
      { step: 15, role: "Lab Tech", action: "Finalize report", location: "Result Form", expected: "Status: Completed", data: "Click 'Complete' button" },
      { step: 16, role: "Lab Tech", action: "Publish report for patient access", location: "Report View", expected: "Status: Published", data: "Click 'Publish' button" },
      { step: 17, role: "Patient", action: "Access public lab report portal", location: "/lab-reports", expected: "Search page displayed", data: "Open in incognito/new browser" },
      { step: 18, role: "Patient", action: "Enter MR# and last 4 digits of phone", location: "Search Form", expected: "Patient's reports listed", data: "MR-2024-00001, Phone: 1234" },
      { step: 19, role: "Patient", action: "View report summary", location: "Report List", expected: "All published reports shown", data: "Date, tests, status visible" },
      { step: 20, role: "Patient", action: "Click to view/download full report", location: "Report Detail", expected: "PDF opens/downloads", data: "All results with reference ranges" }
    ]
  },
  {
    id: "journey-pharmacy-pos",
    name: "Pharmacy Prescription to Sale",
    icon: Pill,
    description: "Complete pharmacy workflow from prescription receipt to sale completion with hold/recall",
    roles: ["Doctor", "Pharmacist"],
    estimatedTime: "15-20 minutes",
    steps: [
      { step: 1, role: "Doctor", action: "Create prescription with 5 medicines", location: "/app/opd/consultation", expected: "Prescription created, RX# generated", data: "Various medicines with different dosages" },
      { step: 2, role: "Pharmacist", action: "Open POS terminal", location: "/app/pharmacy/pos", expected: "POS interface ready", data: "Search box, cart, payment sections visible" },
      { step: 3, role: "Pharmacist", action: "Search by today's token number", location: "Search Box", expected: "Patient found with green 'Today Token #X' badge", data: "Enter 1-4 digit token number" },
      { step: 4, role: "Pharmacist", action: "View prescription panel on right", location: "Prescription Panel", expected: "5 pending items displayed", data: "Medicine names, dosages, quantities shown" },
      { step: 5, role: "Pharmacist", action: "Add first prescription item", location: "Prescription Panel", expected: "Item added to cart with price", data: "Click '+' or the item row" },
      { step: 6, role: "Pharmacist", action: "Add second prescription item", location: "Prescription Panel", expected: "Second item in cart", data: "Running total updated" },
      { step: 7, role: "Pharmacist", action: "Click 'Add All' for remaining items", location: "Prescription Panel", expected: "All 5 items now in cart", data: "Remaining items added at once" },
      { step: 8, role: "Pharmacist", action: "Search for OTC item directly", location: "Product Search", expected: "Additional item added", data: "e.g., Vitamin C, not on prescription" },
      { step: 9, role: "Pharmacist", action: "Hold current transaction", location: "Hold Button", expected: "Transaction saved for later", data: "Cart cleared, hold ID generated" },
      { step: 10, role: "Pharmacist", action: "Start new customer transaction", location: "Search Box", expected: "Empty cart ready", data: "Search different patient/walk-in" },
      { step: 11, role: "Pharmacist", action: "Add items for walk-in customer", location: "Product Search", expected: "Items in cart", data: "OTC medicines for walk-in" },
      { step: 12, role: "Pharmacist", action: "Complete quick sale for walk-in", location: "Checkout", expected: "Sale completed", data: "Cash payment, receipt printed" },
      { step: 13, role: "Pharmacist", action: "View held transactions", location: "Held List", expected: "Previous transaction visible", data: "Shows patient name, items, total" },
      { step: 14, role: "Pharmacist", action: "Recall held transaction", location: "Held List", expected: "Original cart restored", data: "All 6 items back in cart" },
      { step: 15, role: "Pharmacist", action: "Apply 10% discount", location: "Discount Field", expected: "Total reduced by 10%", data: "Enter '10' in discount %" },
      { step: 16, role: "Pharmacist", action: "Select payment method: Cash", location: "Payment Section", expected: "Cash payment form shown", data: "Amount tendered field visible" },
      { step: 17, role: "Pharmacist", action: "Enter amount tendered: PKR 5000", location: "Cash Form", expected: "Change calculated automatically", data: "Change: PKR X displayed" },
      { step: 18, role: "Pharmacist", action: "Complete sale", location: "Checkout Button", expected: "Transaction completed, receipt generated", data: "Success toast, receipt modal opens" },
      { step: 19, role: "Pharmacist", action: "Print receipt", location: "Receipt Modal", expected: "Receipt prints successfully", data: "Paper receipt or PDF" },
      { step: 20, role: "System", action: "Verify prescription marked as dispensed", location: "Database", expected: "is_dispensed: true for prescription items", data: "Rx items linked to sale transaction" }
    ]
  },
  {
    id: "journey-billing-accounts",
    name: "Billing & Accounts Integration",
    icon: Banknote,
    description: "Invoice creation through payment to financial reporting",
    roles: ["Accountant", "Finance Manager"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "Accountant", action: "View pending invoices", location: "/app/billing", expected: "Unpaid/partial invoices listed", data: "Filter by status: Pending, Partial" },
      { step: 2, role: "Accountant", action: "Select an invoice with balance", location: "Invoice List", expected: "Invoice detail opens", data: "Shows line items, payments, balance" },
      { step: 3, role: "Accountant", action: "Review invoice line items", location: "Invoice Detail", expected: "All charges visible", data: "Consultation, Lab, Pharmacy, etc." },
      { step: 4, role: "Accountant", action: "Add partial payment (50%)", location: "Payment Modal", expected: "Payment recorded, balance updated", data: "PKR 5000 of 10000 total" },
      { step: 5, role: "Accountant", action: "Select payment method and reference", location: "Payment Form", expected: "Payment method recorded", data: "Card payment with reference #" },
      { step: 6, role: "Accountant", action: "Print payment receipt", location: "Receipt Button", expected: "Receipt PDF generated", data: "Shows payment amount, method, balance" },
      { step: 7, role: "Accountant", action: "Add final payment for remaining balance", location: "Payment Modal", expected: "Invoice fully paid", data: "Status changes to 'Paid'" },
      { step: 8, role: "Accountant", action: "Print final invoice", location: "Print Invoice", expected: "Complete invoice PDF", data: "All items, payments, zero balance" },
      { step: 9, role: "Finance Manager", action: "Login as financemanager@healthos.demo", location: "/login", expected: "Redirect to Accounts Dashboard", data: "Password: Demo@123" },
      { step: 10, role: "Finance Manager", action: "View Accounts Receivable aging", location: "/app/accounts/receivables", expected: "AR buckets displayed", data: "0-30, 31-60, 60+ days buckets" },
      { step: 11, role: "Finance Manager", action: "Drill down into 60+ days bucket", location: "AR Aging", expected: "Overdue invoices listed", data: "Old unpaid invoices shown" },
      { step: 12, role: "Finance Manager", action: "View Chart of Accounts", location: "/app/accounts/chart", expected: "All accounts listed", data: "Assets, Liabilities, Income, Expenses" },
      { step: 13, role: "Finance Manager", action: "View General Ledger for Revenue account", location: "/app/accounts/ledger", expected: "All revenue transactions shown", data: "Select: Patient Revenue account" },
      { step: 14, role: "Finance Manager", action: "Verify recent payment posted", location: "Ledger Entries", expected: "Today's payment visible", data: "Credit to revenue, date, reference" },
      { step: 15, role: "Finance Manager", action: "Generate Trial Balance", location: "/app/accounts/reports", expected: "Trial Balance report displayed", data: "Debits = Credits (balanced)" },
      { step: 16, role: "Finance Manager", action: "Select date range for report", location: "Date Filter", expected: "Report refreshes for period", data: "Current month or fiscal year" },
      { step: 17, role: "Finance Manager", action: "Generate Profit & Loss statement", location: "Reports Tab", expected: "P&L displayed", data: "Revenue - Expenses = Net Income" },
      { step: 18, role: "Finance Manager", action: "View revenue breakdown", location: "P&L Detail", expected: "Revenue by category", data: "OPD, IPD, Lab, Pharmacy revenue" },
      { step: 19, role: "Finance Manager", action: "Generate Balance Sheet", location: "Reports Tab", expected: "Balance Sheet displayed", data: "Assets = Liabilities + Equity" },
      { step: 20, role: "Finance Manager", action: "Export report to PDF", location: "Export Button", expected: "PDF download initiated", data: "Formatted financial report" }
    ]
  },
  {
    id: "journey-blood-bank",
    name: "Blood Bank Transfusion Flow",
    icon: Syringe,
    description: "Blood request from ward through cross-match to transfusion with reaction monitoring",
    roles: ["Doctor", "Blood Bank Tech", "IPD Nurse"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "Doctor", action: "Create blood request for IPD patient", location: "/app/blood-bank/requests/new", expected: "Blood request created", data: "Blood group: B+, 2 units PRBC" },
      { step: 2, role: "Doctor", action: "Add clinical indication", location: "Request Form", expected: "Indication saved", data: "Post-surgery anemia, Hb: 7.2" },
      { step: 3, role: "Doctor", action: "Set priority and required date", location: "Request Form", expected: "Priority set", data: "Urgent, needed within 4 hours" },
      { step: 4, role: "Blood Bank Tech", action: "View blood requests queue", location: "/app/blood-bank/requests", expected: "New request visible", data: "Shows patient, blood group, units, priority" },
      { step: 5, role: "Blood Bank Tech", action: "Check blood inventory", location: "/app/blood-bank/inventory", expected: "Available units shown", data: "B+ PRBC: 5 units available" },
      { step: 6, role: "Blood Bank Tech", action: "Select compatible units", location: "Inventory", expected: "Units selected for cross-match", data: "Select 2 units with valid expiry" },
      { step: 7, role: "Blood Bank Tech", action: "Collect patient blood sample", location: "Cross-match Form", expected: "Sample collected for testing", data: "Sample ID, collection time recorded" },
      { step: 8, role: "Blood Bank Tech", action: "Perform cross-match testing", location: "Cross-match Form", expected: "Test results entry form", data: "Major/minor cross-match, antibody screen" },
      { step: 9, role: "Blood Bank Tech", action: "Enter cross-match results: Compatible", location: "Cross-match Form", expected: "Units cleared for transfusion", data: "Both units compatible" },
      { step: 10, role: "Blood Bank Tech", action: "Issue blood units", location: "Issue Form", expected: "Units issued to requesting ward", data: "Unit IDs, issue time, issued to" },
      { step: 11, role: "Blood Bank Tech", action: "Print blood issue slip", location: "Issue Confirmation", expected: "Issue slip generated", data: "Unit details, compatibility, instructions" },
      { step: 12, role: "IPD Nurse", action: "Receive blood units in ward", location: "Ward", expected: "Units received and verified", data: "Check unit ID, patient ID, blood group" },
      { step: 13, role: "IPD Nurse", action: "Record pre-transfusion vitals", location: "/app/blood-bank/transfusions", expected: "Baseline vitals recorded", data: "BP, Pulse, Temp, Resp rate" },
      { step: 14, role: "IPD Nurse", action: "Verify with second nurse (2-person check)", location: "Verification", expected: "Double verification completed", data: "Both nurses sign off" },
      { step: 15, role: "IPD Nurse", action: "Start transfusion", location: "Transfusion Form", expected: "Transfusion started, time logged", data: "Unit 1 started at slow rate" },
      { step: 16, role: "IPD Nurse", action: "Monitor for 15 min, record vitals", location: "Monitoring", expected: "15-min vitals recorded", data: "Watch for reactions: fever, rash, SOB" },
      { step: 17, role: "IPD Nurse", action: "Continue transfusion (no reaction)", location: "Monitoring", expected: "Normal rate continued", data: "Increase to full transfusion rate" },
      { step: 18, role: "IPD Nurse", action: "Complete unit 1 transfusion", location: "Transfusion Form", expected: "Unit 1 completed", data: "End time, total volume logged" },
      { step: 19, role: "IPD Nurse", action: "Record post-transfusion vitals", location: "Monitoring", expected: "Post-vitals documented", data: "Compare to pre-transfusion" },
      { step: 20, role: "IPD Nurse", action: "Start unit 2 transfusion", location: "Transfusion Form", expected: "Second unit started", data: "Repeat monitoring process" },
      { step: 21, role: "IPD Nurse", action: "Complete all transfusions", location: "Transfusion Form", expected: "All units transfused successfully", data: "Total: 2 units, no reactions" },
      { step: 22, role: "Blood Bank Tech", action: "Update inventory", location: "/app/blood-bank/inventory", expected: "Units marked as transfused", data: "Inventory reduced by 2 units" }
    ]
  },
  {
    id: "journey-hr-payroll",
    name: "HR & Payroll Cycle",
    icon: UserCog,
    description: "Employee attendance through leave management to monthly payroll processing",
    roles: ["HR Officer", "Employee", "HR Manager", "Finance Manager"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "HR Officer", action: "View daily attendance", location: "/app/hr/attendance", expected: "Today's attendance shown", data: "List of employees with status" },
      { step: 2, role: "HR Officer", action: "Mark attendance for employee (Present)", location: "Attendance Form", expected: "Attendance recorded", data: "Check-in: 09:00, Check-out: 18:00" },
      { step: 3, role: "HR Officer", action: "Mark attendance for another employee (Absent)", location: "Attendance Form", expected: "Absence recorded", data: "Status: Absent, no times entered" },
      { step: 4, role: "HR Officer", action: "Mark late arrival for employee", location: "Attendance Form", expected: "Late minutes calculated", data: "Check-in: 09:45, Late: 45 min" },
      { step: 5, role: "HR Officer", action: "View monthly attendance sheet", location: "/app/hr/attendance/sheet", expected: "Calendar view with attendance", data: "P=Present, A=Absent, L=Leave, H=Holiday" },
      { step: 6, role: "Employee", action: "Submit leave request (Annual Leave)", location: "/app/hr/leaves/apply", expected: "Leave request submitted", data: "3 days annual leave, next week" },
      { step: 7, role: "Employee", action: "Add reason and attach document", location: "Leave Form", expected: "Details saved", data: "Family function, no document needed" },
      { step: 8, role: "HR Manager", action: "View pending leave requests", location: "/app/hr/leaves", expected: "Request visible in queue", data: "Shows employee, type, dates, status" },
      { step: 9, role: "HR Manager", action: "Review leave balance", location: "Leave Request", expected: "Available balance shown", data: "Annual: 12 available of 15 total" },
      { step: 10, role: "HR Manager", action: "Approve leave request", location: "Leave Request", expected: "Leave approved, balance updated", data: "Status: Approved, 9 remaining" },
      { step: 11, role: "HR Manager", action: "Reject another leave request", location: "Leave Request", expected: "Leave rejected with reason", data: "Reason: Critical project deadline" },
      { step: 12, role: "HR Officer", action: "View attendance summary for month", location: "/app/hr/attendance/report", expected: "Monthly summary displayed", data: "Present: 22, Absent: 2, Leave: 2, Late: 4" },
      { step: 13, role: "HR Manager", action: "Navigate to payroll processing", location: "/app/hr/payroll", expected: "Payroll dashboard opens", data: "Current month processing status" },
      { step: 14, role: "HR Manager", action: "Generate monthly payroll", location: "Process Payroll", expected: "Payroll calculated for all employees", data: "Based on attendance, leaves, deductions" },
      { step: 15, role: "HR Manager", action: "Review payroll calculations", location: "Payroll Review", expected: "Individual salaries shown", data: "Gross, deductions, net for each" },
      { step: 16, role: "HR Manager", action: "Apply late deduction", location: "Payroll Adjustment", expected: "Deduction applied", data: "Late penalty: PKR 500 for 45 min late" },
      { step: 17, role: "HR Manager", action: "Approve payroll for month", location: "Approve Button", expected: "Payroll approved", data: "Status: Approved, ready for disbursement" },
      { step: 18, role: "HR Manager", action: "Generate payslips", location: "Payslip Generator", expected: "Payslips created for all", data: "PDF payslips generated" },
      { step: 19, role: "HR Manager", action: "Print individual payslip", location: "Payslip View", expected: "Payslip PDF opens", data: "Shows all earnings, deductions, net" },
      { step: 20, role: "Finance Manager", action: "View salary expense journal", location: "/app/accounts/ledger", expected: "Payroll journal entry visible", data: "Debit: Salary Expense, Credit: Payable" },
      { step: 21, role: "Finance Manager", action: "Process salary payment", location: "/app/accounts/payables", expected: "Salary payment recorded", data: "Bank transfer, reference number" }
    ]
  },
  {
    id: "journey-inventory",
    name: "Inventory Procurement Cycle",
    icon: Package,
    description: "Purchase requisition through PO approval to GRN and stock update",
    roles: ["Store Manager", "Finance Manager"],
    estimatedTime: "20-25 minutes",
    steps: [
      { step: 1, role: "Store Manager", action: "View low stock alerts", location: "/app/inventory/alerts", expected: "Items below reorder level shown", data: "Red alerts for critical items" },
      { step: 2, role: "Store Manager", action: "Navigate to Purchase Orders", location: "/app/inventory/purchase-orders", expected: "PO list displayed", data: "Filter: Draft, Pending, Approved" },
      { step: 3, role: "Store Manager", action: "Create new Purchase Order", location: "New PO Button", expected: "PO form opens", data: "Auto-generates PO number" },
      { step: 4, role: "Store Manager", action: "Select vendor", location: "Vendor Dropdown", expected: "Vendor selected", data: "ABC Medical Supplies Pvt Ltd" },
      { step: 5, role: "Store Manager", action: "Add line item 1: Syringes", location: "Item Search", expected: "Item added with quantity and price", data: "Qty: 500, Unit Price: PKR 15" },
      { step: 6, role: "Store Manager", action: "Add line item 2: Gloves", location: "Item Search", expected: "Second item added", data: "Qty: 1000, Unit Price: PKR 8" },
      { step: 7, role: "Store Manager", action: "Add line item 3: IV Cannula", location: "Item Search", expected: "Third item added", data: "Qty: 200, Unit Price: PKR 45" },
      { step: 8, role: "Store Manager", action: "Review PO total", location: "PO Summary", expected: "Total calculated", data: "Subtotal + Tax = Grand Total" },
      { step: 9, role: "Store Manager", action: "Submit PO for approval", location: "Submit Button", expected: "Status: Pending Approval", data: "Sent to Finance Manager" },
      { step: 10, role: "Finance Manager", action: "View pending PO approvals", location: "/app/inventory/purchase-orders", expected: "PO visible in approval queue", data: "Filter: Pending Approval" },
      { step: 11, role: "Finance Manager", action: "Review PO details", location: "PO Detail", expected: "All line items, pricing visible", data: "Check budget, vendor terms" },
      { step: 12, role: "Finance Manager", action: "Approve Purchase Order", location: "Approve Button", expected: "Status: Approved", data: "PO ready to send to vendor" },
      { step: 13, role: "Store Manager", action: "Print/Email PO to vendor", location: "PO Actions", expected: "PO document generated", data: "PDF with all details, terms" },
      { step: 14, role: "Store Manager", action: "Goods received from vendor", location: "Physical Receipt", expected: "Ready to create GRN", data: "Vendor delivers items" },
      { step: 15, role: "Store Manager", action: "Create GRN from PO", location: "/app/inventory/grn", expected: "GRN form opens with PO items", data: "Auto-populates from approved PO" },
      { step: 16, role: "Store Manager", action: "Enter received quantity for Syringes", location: "GRN Form", expected: "Qty received recorded", data: "Ordered: 500, Received: 480" },
      { step: 17, role: "Store Manager", action: "Enter received quantity for Gloves", location: "GRN Form", expected: "Full quantity received", data: "Ordered: 1000, Received: 1000" },
      { step: 18, role: "Store Manager", action: "Enter received quantity for IV Cannula", location: "GRN Form", expected: "Qty recorded", data: "Ordered: 200, Received: 200" },
      { step: 19, role: "Store Manager", action: "Enter batch numbers and expiry", location: "GRN Form", expected: "Batch details saved", data: "Batch: ABC123, Expiry: Dec 2025" },
      { step: 20, role: "Store Manager", action: "Note discrepancy in Syringes", location: "GRN Notes", expected: "Shortage documented", data: "20 units short, vendor to replace" },
      { step: 21, role: "Store Manager", action: "Verify and complete GRN", location: "Verify Button", expected: "GRN completed, stock updated", data: "Inventory levels increased" },
      { step: 22, role: "Store Manager", action: "View updated stock levels", location: "/app/inventory/stock-levels", expected: "New quantities reflected", data: "Syringes: +480, Gloves: +1000" },
      { step: 23, role: "Finance Manager", action: "View Accounts Payable", location: "/app/accounts/payables", expected: "Vendor payable created", data: "Liability to ABC Medical Supplies" },
      { step: 24, role: "Finance Manager", action: "Verify GRN value matches", location: "Payables Detail", expected: "Amount matches GRN total", data: "Less the 20 short syringes" }
    ]
  },
  {
    id: "journey-kiosk-token",
    name: "Self-Service Token Kiosk Flow",
    icon: TabletSmartphone,
    description: "Patient uses self-service kiosk to generate token without receptionist",
    roles: ["Admin", "Patient", "Nurse", "System"],
    estimatedTime: "15-20 minutes",
    steps: [
      { step: 1, role: "Admin", action: "Navigate to Kiosk Management", location: "/app/settings/kiosks", expected: "Kiosks list displayed", data: "View all configured kiosks" },
      { step: 2, role: "Admin", action: "Create new kiosk 'OPD-Kiosk-01'", location: "/app/settings/kiosks/new", expected: "Kiosk created with username/password", data: "Auto-generated credentials displayed" },
      { step: 3, role: "Admin", action: "Set kiosk type: OPD, departments: General, Cardiology", location: "Kiosk Form", expected: "Department filters configured", data: "Only selected departments show on kiosk" },
      { step: 4, role: "Admin", action: "Copy auto-generated password", location: "Kiosk Detail", expected: "Password noted for device", data: "Password shown only once on creation" },
      { step: 5, role: "Admin", action: "Get public kiosk URL from setup page", location: "/app/appointments/kiosk-setup", expected: "URL: /kiosk/{orgId}", data: "Copy URL for tablet browser" },
      { step: 6, role: "System", action: "Open kiosk URL on tablet device", location: "/kiosk/{orgId}", expected: "Public token kiosk loads (no login required)", data: "Self-service mode, patient-facing UI" },
      { step: 7, role: "Patient", action: "Enter phone number: 03001234567", location: "Phone Input Screen", expected: "Continue button enabled", data: "Phone used to lookup existing patient" },
      { step: 8, role: "Patient", action: "(New patient) Enter name: 'Ali Khan'", location: "Name Input Screen", expected: "Name accepted", data: "Quick registration for new patients" },
      { step: 9, role: "Patient", action: "Select department: 'General Medicine'", location: "Department Grid", expected: "Department highlighted", data: "Only kiosk-configured departments shown" },
      { step: 10, role: "Patient", action: "Select doctor: 'Dr. Ahmed Khan'", location: "Doctor Grid", expected: "Doctor selected", data: "Shows available doctors for department" },
      { step: 11, role: "Patient", action: "Confirm appointment details", location: "Confirmation Screen", expected: "All details displayed for verification", data: "Name, department, doctor, date shown" },
      { step: 12, role: "Patient", action: "Click 'Generate Token'", location: "Confirm Button", expected: "Token #XX generated", data: "Token number assigned for today" },
      { step: 13, role: "Patient", action: "View token slip with estimated wait time", location: "Success Screen", expected: "Token, doctor, estimated wait displayed", data: "Large token number for easy reading" },
      { step: 14, role: "Patient", action: "Print token slip", location: "Print Button", expected: "Thermal printer prints slip", data: "Slip includes QR code for tracking" },
      { step: 15, role: "Patient", action: "Click 'New Token' for next patient", location: "New Token Button", expected: "Kiosk resets to phone input screen", data: "Ready for next walk-in patient" },
      { step: 16, role: "Nurse", action: "View token in Queue Control Panel", location: "/app/appointments/queue-control", expected: "New kiosk-generated token visible", data: "Token marked with kiosk source" }
    ]
  },
  {
    id: "journey-queue-display",
    name: "Queue Display & Control Panel Flow",
    icon: Monitor,
    description: "Staff manages patient queue while TV displays update in real-time",
    roles: ["Admin", "Nurse", "System"],
    estimatedTime: "15-20 minutes",
    steps: [
      { step: 1, role: "Admin", action: "Navigate to Queue Display Configuration", location: "/app/settings/queue-displays", expected: "Display list shown", data: "Configure TV screens for waiting areas" },
      { step: 2, role: "Admin", action: "Create new display 'OPD Waiting Room TV'", location: "/app/settings/queue-displays/new", expected: "Display created", data: "Assign name and location" },
      { step: 3, role: "Admin", action: "Set type: OPD, link to OPD-Kiosk-01", location: "Display Form", expected: "Display filters to show kiosk tokens", data: "Only tokens from linked kiosk appear" },
      { step: 4, role: "Admin", action: "Enable audio announcements", location: "Audio Toggle", expected: "Audio enabled", data: "Voice will announce token numbers" },
      { step: 5, role: "Admin", action: "Copy display URL", location: "Display Detail", expected: "URL: /display/{displayId}", data: "URL for TV browser kiosk mode" },
      { step: 6, role: "System", action: "Open display on waiting room TV", location: "/display/{displayId}", expected: "Queue display loads fullscreen", data: "Large text, high contrast for visibility" },
      { step: 7, role: "System", action: "Display shows 'Now Serving' (empty initially)", location: "TV Screen", expected: "'Waiting for next patient...' message", data: "Clear indicator when no active token" },
      { step: 8, role: "System", action: "Display shows 'Up Next' with waiting patients", location: "TV Screen", expected: "Token list with priorities", data: "Sorted by priority then check-in time" },
      { step: 9, role: "Nurse", action: "Open Queue Control Panel", location: "/app/appointments/queue-control", expected: "Control panel loads with queue", data: "Staff interface for queue management" },
      { step: 10, role: "Nurse", action: "Filter by doctor or department", location: "Filter Dropdown", expected: "Queue filtered to selection", data: "Manage specific doctor's queue" },
      { step: 11, role: "Nurse", action: "Click 'Call Next' button", location: "Control Panel", expected: "First patient status → 'in_progress'", data: "Token moves to 'Now Serving'" },
      { step: 12, role: "System", action: "TV Display updates: Token #XX now serving", location: "TV Screen", expected: "Large token number displayed", data: "Patient sees their token called" },
      { step: 13, role: "System", action: "Audio announcement plays", location: "Speakers", expected: "'Token number XX, please proceed...'", data: "TTS or pre-recorded audio" },
      { step: 14, role: "Nurse", action: "Click 'Complete' for current patient", location: "Control Panel", expected: "Status → 'completed', removed from queue", data: "Patient finished with doctor" },
      { step: 15, role: "Nurse", action: "Click 'Skip' for next patient", location: "Control Panel", expected: "Skipped patient moves to end of queue", data: "Patient not present, will be re-called" },
      { step: 16, role: "Nurse", action: "Click 'Recall' for previous token", location: "Control Panel", expected: "Token re-announced on TV", data: "Patient may have missed first call" },
      { step: 17, role: "System", action: "Display auto-refreshes (every 5 seconds)", location: "TV Screen", expected: "Queue updates in real-time", data: "Supabase real-time subscription" }
    ]
  },
  {
    id: "journey-kiosk-auth",
    name: "Staff-Assisted Kiosk (Authenticated) Flow",
    icon: TabletSmartphone,
    description: "Kiosk device login and staff-assisted token generation at reception",
    roles: ["Admin", "Receptionist", "System"],
    estimatedTime: "10-15 minutes",
    steps: [
      { step: 1, role: "Admin", action: "Create kiosk with credentials", location: "/app/settings/kiosks/new", expected: "Kiosk username: kiosk-opd-reception", data: "Staff-assisted mode selected" },
      { step: 2, role: "Admin", action: "Note generated password", location: "Kiosk Form", expected: "Password displayed once", data: "Save password securely" },
      { step: 3, role: "Receptionist", action: "Open kiosk login on reception tablet", location: "/kiosk/login", expected: "Login screen displayed", data: "Dedicated kiosk login page" },
      { step: 4, role: "Receptionist", action: "Enter kiosk credentials", location: "Login Form", expected: "Username + password entered", data: "Use kiosk credentials, not user account" },
      { step: 5, role: "Receptionist", action: "Login successful", location: "Submit", expected: "Redirect to /kiosk/terminal", data: "Authenticated kiosk session started" },
      { step: 6, role: "Receptionist", action: "View terminal header with info", location: "Terminal", expected: "Organization name, kiosk name, time", data: "Session info displayed" },
      { step: 7, role: "Receptionist", action: "Patient approaches reception", location: "Reception Desk", expected: "Staff assists patient", data: "Face-to-face interaction" },
      { step: 8, role: "Receptionist", action: "Enter patient phone number", location: "Phone Input", expected: "Search for existing patient", data: "Auto-lookup by phone" },
      { step: 9, role: "Receptionist", action: "Patient found (existing MR#)", location: "Search Result", expected: "Name auto-populated", data: "Shows patient name and MR#" },
      { step: 10, role: "Receptionist", action: "OR Enter new patient name", location: "Name Input", expected: "New patient registration flow", data: "Quick reg for new patients" },
      { step: 11, role: "Receptionist", action: "Select department", location: "Department Grid", expected: "Filtered by kiosk config", data: "Only allowed departments shown" },
      { step: 12, role: "Receptionist", action: "Select doctor", location: "Doctor Grid", expected: "Available doctors shown", data: "Based on department selection" },
      { step: 13, role: "Receptionist", action: "Confirm and generate token", location: "Confirm Screen", expected: "Token generated with kiosk_id", data: "Appointment linked to this kiosk" },
      { step: 14, role: "Receptionist", action: "Print token for patient", location: "Print Button", expected: "Slip printed", data: "Hand token slip to patient" },
      { step: 15, role: "Receptionist", action: "Click logout at end of shift", location: "Logout Button", expected: "Session ended, return to login", data: "Kiosk session deactivated" },
      { step: 16, role: "Admin", action: "View kiosk session in admin", location: "/app/settings/kiosk-sessions", expected: "Session logged with tokens count", data: "Shows tokens generated, duration" },
      { step: 17, role: "Admin", action: "View activity log", location: "/app/settings/kiosk-activity", expected: "Token generation events logged", data: "Audit trail of kiosk activity" }
    ]
  },
  {
    id: "journey-patient-profile",
    name: "Patient Profile Deep Dive",
    icon: User,
    description: "Navigating complete patient profile with all integrated clinical tabs",
    roles: ["Receptionist", "Doctor", "Nurse"],
    estimatedTime: "10-15 minutes",
    steps: [
      { step: 1, role: "Receptionist", action: "Search patient by MR# or name", location: "/app/patients", expected: "Patient found in list", data: "Use MR-2024-00001 or 'Muhammad Ahmed'" },
      { step: 2, role: "Receptionist", action: "Click patient name to open profile", location: "Patient Row", expected: "Profile page loads", data: "Full patient detail view" },
      { step: 3, role: "Receptionist", action: "View Overview tab", location: "Overview Tab", expected: "Demographics, visit stats, recent activity", data: "Summary of patient record" },
      { step: 4, role: "Receptionist", action: "View Medical History tab", location: "Medical History Tab", expected: "Allergies, chronic diseases, surgeries", data: "Patient's medical background" },
      { step: 5, role: "Receptionist", action: "View Appointments tab", location: "Appointments Tab", expected: "All past/future appointments listed", data: "Chronological appointment history" },
      { step: 6, role: "Doctor", action: "View Consultations tab", location: "Consultations Tab", expected: "Consultation history with diagnoses", data: "ICD-10 codes, clinical notes" },
      { step: 7, role: "Doctor", action: "View Prescriptions tab", location: "Prescriptions Tab", expected: "All prescriptions with dispense status", data: "RX numbers, medicines, dispensed flag" },
      { step: 8, role: "Doctor", action: "View Lab Results tab", location: "Lab Results Tab", expected: "Lab orders with results", data: "Test values, normal ranges, flags" },
      { step: 9, role: "Doctor", action: "View Radiology tab", location: "Radiology Tab", expected: "Imaging studies and reports", data: "X-rays, CT scans, ultrasounds" },
      { step: 10, role: "Doctor", action: "View IPD Admissions tab", location: "IPD Tab", expected: "Inpatient admission history", data: "Admission dates, wards, discharge summaries" },
      { step: 11, role: "Doctor", action: "View ER Visits tab", location: "ER Visits Tab", expected: "Emergency visit records", data: "Triage levels, treatments, outcomes" },
      { step: 12, role: "Nurse", action: "View Blood Transfusions tab", location: "Blood Tab", expected: "Transfusion history", data: "Units received, reactions (if any)" },
      { step: 13, role: "Receptionist", action: "View Billing tab", location: "Billing Tab", expected: "Invoices and payments", data: "Outstanding balances, payment history" },
      { step: 14, role: "Receptionist", action: "Print Patient ID Card", location: "Print Card Button", expected: "Card with photo, MR#, QR code", data: "Printable patient identification" },
      { step: 15, role: "Doctor", action: "Add quick clinical note from profile", location: "Quick Action", expected: "Note saved to patient record", data: "Optional note without full consultation" }
    ]
  },
  {
    id: "journey-warehouse",
    name: "Full Warehouse Procurement to Dispatch",
    icon: Package,
    description: "Complete warehouse cycle from reorder alert through procurement, receiving, QC, put-away, requisition, picking, packing, and shipping",
    roles: ["Warehouse Admin", "Warehouse User"],
    estimatedTime: "30-40 minutes",
    steps: [
      { step: 1, role: "Warehouse Admin", action: "View reorder alerts for items below threshold", location: "/app/warehouse/reorder-alerts", expected: "Items below reorder level listed with deficit", data: "8 items should show alerts" },
      { step: 2, role: "Warehouse Admin", action: "Select items and create Purchase Request", location: "Reorder Alerts", expected: "PR created pre-filled with deficit quantities", data: "Auto-generated PR number" },
      { step: 3, role: "Warehouse Admin", action: "Submit and approve Purchase Request", location: "/app/warehouse/purchase-requests", expected: "PR status: approved", data: "Approved by warehouse admin" },
      { step: 4, role: "Warehouse Admin", action: "Convert approved PR to Purchase Order", location: "PR Detail > Convert to PO", expected: "PO created with PR items and vendor", data: "Select vendor from list" },
      { step: 5, role: "Warehouse Admin", action: "Approve Purchase Order", location: "/app/warehouse/purchase-orders", expected: "PO status: approved", data: "Ready to send to vendor" },
      { step: 6, role: "Warehouse User", action: "Create GRN from approved PO", location: "PO Detail > Create GRN", expected: "GRN form pre-filled with PO items", data: "Enter received qty, batch, expiry" },
      { step: 7, role: "Warehouse User", action: "Perform QC check on each received item", location: "GRN QC Section", expected: "Items marked accepted/rejected with reasons", data: "Per-item quality check" },
      { step: 8, role: "Warehouse Admin", action: "Verify GRN after QC approval", location: "GRN Detail > Verify", expected: "Stock updated in inventory_stock", data: "Quantities reflect received amounts" },
      { step: 9, role: "Warehouse Admin", action: "Post GRN to accounts", location: "GRN Detail > Post", expected: "Journal entry created", data: "Accounts payable updated" },
      { step: 10, role: "Warehouse User", action: "Complete put-away tasks to assigned bins", location: "/app/warehouse/putaway", expected: "Items assigned to storage bins", data: "Bin occupancy updated" },
      { step: 11, role: "Warehouse User", action: "Create stock requisition from department", location: "/app/warehouse/requisitions", expected: "Requisition created with requested items", data: "Department and priority set" },
      { step: 12, role: "Warehouse Admin", action: "Approve requisition with quantities", location: "Requisition Detail > Approve", expected: "Status: approved, pick list generated", data: "qty_approved may differ from qty_requested" },
      { step: 13, role: "Warehouse User", action: "Start and complete pick list (FEFO)", location: "/app/warehouse/pick-lists", expected: "Items picked from bins, earliest expiry first", data: "quantity_picked updated per item" },
      { step: 14, role: "Warehouse User", action: "Create packing slip and pack items", location: "Packing > New from pick list", expected: "Items assigned to boxes with weight", data: "Box numbers and total weight recorded" },
      { step: 15, role: "Warehouse Admin", action: "Verify packing slip", location: "Packing Slip > Verify", expected: "Status: verified, ready for shipment", data: "verified_by set" },
      { step: 16, role: "Warehouse User", action: "Create shipment with carrier details", location: "/app/warehouse/shipping", expected: "Shipment created with tracking", data: "Carrier name, tracking number" },
      { step: 17, role: "Warehouse User", action: "Dispatch shipment", location: "Shipment > Dispatch", expected: "Status: dispatched, dispatched_at set", data: "Items in transit to destination" },
      { step: 18, role: "Warehouse User", action: "Mark shipment as delivered", location: "Shipment > Mark Delivered", expected: "Status: delivered, delivered_at set", data: "Delivery confirmed at destination" }
    ]
  }
];

// ============ MODULE TEST CASES ============
const TEST_CASES = {
  demoAccounts: [
    { role: "Super Admin", email: "superadmin@healthos.demo", module: "Platform Management" },
    { role: "Org Admin", email: "orgadmin@healthos.demo", module: "Organization Settings" },
    { role: "Branch Admin", email: "branchadmin@healthos.demo", module: "Branch Management" },
    { role: "Doctor", email: "doctor@healthos.demo", module: "OPD Consultations" },
    { role: "Cardiologist", email: "cardiologist@healthos.demo", module: "Specialized OPD" },
    { role: "Pediatrician", email: "pediatrician@healthos.demo", module: "Pediatric OPD" },
    { role: "Nurse", email: "nurse@healthos.demo", module: "OPD Nursing Station" },
    { role: "IPD Nurse", email: "ipdnurse@healthos.demo", module: "Inpatient Care" },
    { role: "Receptionist", email: "receptionist@healthos.demo", module: "Registration & Appointments" },
    { role: "Pharmacist", email: "pharmacist@healthos.demo", module: "Pharmacy POS & Dispensing" },
    { role: "Lab Tech", email: "labtech@healthos.demo", module: "Laboratory Queue" },
    { role: "Radiologist", email: "radiologist@healthos.demo", module: "Imaging Reports" },
    { role: "Radiology Tech", email: "radtech@healthos.demo", module: "Image Capture" },
    { role: "Accountant", email: "accountant@healthos.demo", module: "Billing & Invoices" },
    { role: "Finance Manager", email: "financemanager@healthos.demo", module: "Accounts & Ledger" },
    { role: "HR Manager", email: "hrmanager@healthos.demo", module: "HR Operations" },
    { role: "HR Officer", email: "hrofficer@healthos.demo", module: "Attendance & Leaves" },
    { role: "Store Manager", email: "storemanager@healthos.demo", module: "Inventory & Procurement" },
    { role: "Blood Bank Tech", email: "bloodbank@healthos.demo", module: "Blood Bank Operations" },
    { role: "Warehouse Admin", email: "warehouse.admin@healthos.demo", module: "Warehouse Management" },
    { role: "Warehouse User", email: "warehouse.user@healthos.demo", module: "Warehouse Operations" }
  ],
  modules: [
    { name: "Reception & Patient Registration", icon: "👤", tests: [
      { id: "REC-001", test: "Register new patient", steps: "Dashboard > New Patient > Fill form", expected: "Patient created with MR#" },
      { id: "REC-002", test: "Search patient by MR#", steps: "Search box > Enter MR#", expected: "Patient found" },
      { id: "REC-003", test: "Search patient by CNIC", steps: "Search box > Enter CNIC", expected: "Patient found" },
      { id: "REC-004", test: "Create walk-in appointment", steps: "Patient > New Appointment > Walk-in", expected: "Token generated" },
      { id: "REC-005", test: "Check-in patient", steps: "Appointments > Select > Check In", expected: "Status: checked_in" }
    ]},
    { name: "OPD - Doctor Dashboard", icon: "🩺", tests: [
      { id: "OPD-001", test: "View patient queue", steps: "/app/opd", expected: "See checked-in patients" },
      { id: "OPD-002", test: "Start consultation", steps: "Select patient > Start", expected: "Consultation form opens" },
      { id: "OPD-003", test: "Add diagnosis (ICD-10)", steps: "Search diagnosis > Select", expected: "Diagnosis recorded" },
      { id: "OPD-004", test: "Create prescription", steps: "Add medicines > Save", expected: "RX# generated" },
      { id: "OPD-005", test: "Order lab tests", steps: "Add tests > Submit", expected: "Lab order created" },
      { id: "OPD-006", test: "Complete consultation", steps: "Click Complete", expected: "Status: completed" }
    ]},
    { name: "Pharmacy POS", icon: "💊", tests: [
      { id: "PHA-001", test: "Search by token number", steps: "Enter today's token #", expected: "Patient found" },
      { id: "PHA-002", test: "View pending prescriptions", steps: "Select patient", expected: "Rx items displayed" },
      { id: "PHA-003", test: "Add all Rx items", steps: "Click 'Add All'", expected: "All items in cart" },
      { id: "PHA-004", test: "Process cash payment", steps: "Checkout > Cash", expected: "Transaction complete" },
      { id: "PHA-005", test: "Hold transaction", steps: "Click Hold", expected: "Transaction saved" },
      { id: "PHA-006", test: "Recall held transaction", steps: "Held list > Select", expected: "Cart restored" }
    ]},
    { name: "Laboratory", icon: "🔬", tests: [
      { id: "LAB-001", test: "View lab queue", steps: "/app/lab/queue", expected: "Pending orders shown" },
      { id: "LAB-002", test: "Collect sample", steps: "Select order > Enter barcode", expected: "Status: collected" },
      { id: "LAB-003", test: "Enter results", steps: "Result entry > Values", expected: "Results saved" },
      { id: "LAB-004", test: "Publish report", steps: "Click Publish", expected: "Status: published" },
      { id: "LAB-005", test: "Public report access", steps: "/lab-reports > Enter ID", expected: "Report viewable" }
    ]},
    { name: "Emergency Department", icon: "🚨", tests: [
      { id: "ER-001", test: "Quick registration", steps: "/app/emergency/register", expected: "ER# generated" },
      { id: "ER-002", test: "Triage assessment", steps: "Assign ESI level", expected: "Priority set" },
      { id: "ER-003", test: "Record treatment", steps: "Add treatment notes", expected: "Notes saved" },
      { id: "ER-004", test: "Admit to IPD", steps: "ER > Admit", expected: "Admission created" }
    ]},
    { name: "IPD - Inpatient", icon: "🏥", tests: [
      { id: "IPD-001", test: "New admission", steps: "Admissions > New", expected: "Admission created" },
      { id: "IPD-002", test: "Assign bed", steps: "Select ward > Assign bed", expected: "Bed occupied" },
      { id: "IPD-003", test: "Daily round", steps: "Rounds > Add notes", expected: "Round documented" },
      { id: "IPD-004", test: "eMAR administration", steps: "Medications > Administer", expected: "Dose recorded" },
      { id: "IPD-005", test: "Discharge patient", steps: "Complete discharge", expected: "Summary generated" }
    ]},
    { name: "Blood Bank", icon: "🩸", tests: [
      { id: "BB-001", test: "Blood request", steps: "Requests > New", expected: "Request created" },
      { id: "BB-002", test: "Cross-match test", steps: "Request > Cross-match", expected: "Compatibility checked" },
      { id: "BB-003", test: "Issue blood", steps: "Request > Issue", expected: "Unit issued" },
      { id: "BB-004", test: "Record transfusion", steps: "Transfusion > Complete", expected: "Transfusion logged" }
    ]},
    { name: "Billing & Invoicing", icon: "💵", tests: [
      { id: "BIL-001", test: "Create invoice", steps: "Invoices > New", expected: "Invoice generated" },
      { id: "BIL-002", test: "Collect payment", steps: "Payment > Add", expected: "Payment recorded" },
      { id: "BIL-003", test: "Partial payment", steps: "Enter partial amount", expected: "Balance shown" },
      { id: "BIL-004", test: "Print invoice", steps: "Invoice > Print", expected: "PDF generated" }
    ]},
    { name: "Accounts & Finance", icon: "📊", tests: [
      { id: "ACC-001", test: "View chart of accounts", steps: "/app/accounts/chart", expected: "Accounts listed" },
      { id: "ACC-002", test: "View general ledger", steps: "Ledger > Select account", expected: "Transactions shown" },
      { id: "ACC-003", test: "Generate trial balance", steps: "Reports > Trial Balance", expected: "Report generated" },
      { id: "ACC-004", test: "Generate P&L", steps: "Reports > Profit & Loss", expected: "Report generated" }
    ]},
    { name: "HR & Staff", icon: "👥", tests: [
      { id: "HR-001", test: "Mark attendance", steps: "Attendance > Mark", expected: "Attendance recorded" },
      { id: "HR-002", test: "Submit leave request", steps: "Leaves > Apply", expected: "Request submitted" },
      { id: "HR-003", test: "Approve leave", steps: "Leaves > Approve", expected: "Leave approved" },
      { id: "HR-004", test: "Process payroll", steps: "Payroll > Process", expected: "Salaries calculated" }
    ]},
    { name: "Warehouse & Inventory — Procurement", icon: "📦", tests: [
      { id: "WH-PR-001", test: "Create purchase request", steps: "Procurement > PRs > New PR", expected: "PR created with auto-number" },
      { id: "WH-PR-002", test: "Submit PR for approval", steps: "Open draft PR > Submit", expected: "Status: pending_approval" },
      { id: "WH-PR-003", test: "Approve purchase request", steps: "Open pending PR > Approve", expected: "Status: approved" },
      { id: "WH-PO-001", test: "Create PO from PR", steps: "Approved PR > Convert to PO", expected: "PO pre-filled with PR items" },
      { id: "WH-PO-002", test: "Approve purchase order", steps: "Draft PO > Approve", expected: "Status: approved" },
      { id: "WH-PO-003", test: "Create GRN from PO", steps: "Approved PO > Create GRN", expected: "GRN form pre-filled" }
    ]},
    { name: "Warehouse & Inventory — Receiving", icon: "📥", tests: [
      { id: "WH-GRN-001", test: "Create GRN with batch/expiry", steps: "GRN > New > Enter qty, batch, expiry", expected: "GRN created with auto-number" },
      { id: "WH-GRN-002", test: "QC check per item", steps: "Draft GRN > QC section > Accept/Reject", expected: "Items marked accepted/rejected" },
      { id: "WH-GRN-003", test: "Verify GRN", steps: "QC-approved GRN > Verify", expected: "Stock updated in inventory" },
      { id: "WH-GRN-004", test: "Post GRN to accounts", steps: "Verified GRN > Post", expected: "Journal entry created" }
    ]},
    { name: "Warehouse & Inventory — Stock Management", icon: "🏗️", tests: [
      { id: "WH-STK-001", test: "View inventory items", steps: "Stock > Items list", expected: "Items with SKU, barcode, category shown" },
      { id: "WH-STK-002", test: "Create stock adjustment", steps: "Adjustments > New > Expired/Damaged", expected: "Adjustment created, stock reduced" },
      { id: "WH-STK-003", test: "View reorder alerts", steps: "Procurement > Reorder Alerts", expected: "Items below reorder level listed" },
      { id: "WH-STK-004", test: "Create PR from alerts", steps: "Select items > Create PR", expected: "PR pre-filled with deficit quantities" }
    ]},
    { name: "Warehouse & Inventory — Outbound", icon: "🚚", tests: [
      { id: "WH-OUT-001", test: "Create stock requisition", steps: "Stock > Requisitions > New", expected: "Requisition created" },
      { id: "WH-OUT-002", test: "Create store transfer", steps: "Outbound > Transfers > New", expected: "Transfer with source/dest stores" },
      { id: "WH-OUT-003", test: "Start and complete pick list", steps: "Pick Lists > Start Picking > Pick items", expected: "FEFO-based picking completed" },
      { id: "WH-OUT-004", test: "Create and verify packing slip", steps: "Packing > New > Assign boxes > Verify", expected: "Packing slip verified" },
      { id: "WH-OUT-005", test: "Create shipment and dispatch", steps: "Shipping > New > Enter carrier > Dispatch", expected: "Shipment dispatched with tracking" }
    ]},
    { name: "Warehouse & Inventory — Reports", icon: "📊", tests: [
      { id: "WH-RPT-001", test: "Executive Dashboard loads", steps: "Reports > Executive Dashboard", expected: "KPI cards and charts render" },
      { id: "WH-RPT-002", test: "Stock Valuation report", steps: "Reports > Stock Valuation", expected: "Total value calculated (qty × cost)" },
      { id: "WH-RPT-003", test: "ABC Analysis report", steps: "Reports > ABC Analysis", expected: "Items classified A/B/C with Pareto chart" },
      { id: "WH-RPT-004", test: "Expiry report with filter", steps: "Reports > Expiry > Change days filter", expected: "Items within expiry window shown" },
      { id: "WH-RPT-005", test: "Consumption report", steps: "Reports > Consumption", expected: "Department-wise consumption with chart" },
      { id: "WH-RPT-006", test: "Vendor Performance report", steps: "Reports > Vendor Performance", expected: "Vendor spend and PO counts shown" },
      { id: "WH-RPT-007", test: "Dead Stock report", steps: "Reports > Dead Stock > Change days", expected: "Items with no movement listed" },
      { id: "WH-RPT-008", test: "Fast Moving Items report", steps: "Reports > Fast Moving", expected: "Top items by movement shown" }
    ]},
    { name: "Warehouse & Inventory — Exports", icon: "💾", tests: [
      { id: "WH-EXP-001", test: "Export report to CSV", steps: "Any report > Export > CSV", expected: "CSV file downloads" },
      { id: "WH-EXP-002", test: "Export report to PDF", steps: "Any report > Export > PDF", expected: "PDF file downloads" }
    ]},
    { name: "Kiosk Management", icon: "📱", tests: [
      { id: "KIOSK-001", test: "Create new kiosk", steps: "Settings > Kiosks > New", expected: "Kiosk created with credentials" },
      { id: "KIOSK-002", test: "Auto-generate password", steps: "Create kiosk", expected: "8-char password displayed" },
      { id: "KIOSK-003", test: "Reset kiosk password", steps: "Kiosk detail > Reset Password", expected: "New password generated" },
      { id: "KIOSK-004", test: "Configure departments", steps: "Edit kiosk > Select departments", expected: "Departments saved" },
      { id: "KIOSK-005", test: "Set kiosk mode", steps: "Select self_service/staff_assisted", expected: "Mode saved" },
      { id: "KIOSK-006", test: "View kiosk sessions", steps: "Settings > Kiosk Sessions", expected: "Active/past sessions listed" },
      { id: "KIOSK-007", test: "End kiosk session", steps: "Sessions > End Session", expected: "Session marked inactive" },
      { id: "KIOSK-008", test: "View activity log", steps: "Settings > Kiosk Activity", expected: "Token generation events shown" },
      { id: "KIOSK-009", test: "Delete kiosk", steps: "Kiosk detail > Delete", expected: "Kiosk removed" },
      { id: "KIOSK-010", test: "Deactivate kiosk", steps: "Toggle active status", expected: "Kiosk login fails when inactive" }
    ]},
    { name: "Queue Display", icon: "📺", tests: [
      { id: "QDSP-001", test: "Create queue display", steps: "Settings > Queue Displays > New", expected: "Display created" },
      { id: "QDSP-002", test: "Set display type (OPD/ER)", steps: "Select type", expected: "Type saved" },
      { id: "QDSP-003", test: "Link to specific kiosks", steps: "Select kiosks", expected: "Display filters by kiosk" },
      { id: "QDSP-004", test: "Enable audio announcements", steps: "Toggle audio setting", expected: "Audio announcements enabled" },
      { id: "QDSP-005", test: "Set theme (light/dark)", steps: "Select theme", expected: "Display theme applied" },
      { id: "QDSP-006", test: "Copy display URL", steps: "Display detail > Copy URL", expected: "URL copied to clipboard" },
      { id: "QDSP-007", test: "Preview display", steps: "Click Preview", expected: "Opens in new tab" },
      { id: "QDSP-008", test: "Fullscreen mode", steps: "F11 or fullscreen button", expected: "Display fills entire screen" },
      { id: "QDSP-009", test: "Delete display", steps: "Delete > Confirm", expected: "Display removed" }
    ]},
    { name: "Public Portals", icon: "🌐", tests: [
      { id: "PUB-001", test: "Access lab report portal", steps: "Open /lab-reports", expected: "Search page displayed" },
      { id: "PUB-002", test: "Search reports by MR#", steps: "Enter MR# and phone", expected: "Reports listed" },
      { id: "PUB-003", test: "Download lab report PDF", steps: "Click download", expected: "PDF downloaded" },
      { id: "PUB-004", test: "View prescription history", steps: "Open /prescriptions portal", expected: "Prescriptions shown" },
      { id: "PUB-005", test: "Kiosk login page loads", steps: "Open /kiosk/login", expected: "Login form displayed" },
      { id: "PUB-006", test: "Kiosk terminal requires auth", steps: "Open /kiosk/terminal without login", expected: "Redirect to /kiosk/login" },
      { id: "PUB-007", test: "Public kiosk loads without auth", steps: "Open /kiosk/{orgId}", expected: "Self-service kiosk displayed" },
      { id: "PUB-008", test: "Queue display real-time update", steps: "Change appointment status", expected: "TV display updates within 10s" },
      { id: "PUB-009", test: "Audio announcement plays", steps: "Token called to 'in_progress'", expected: "Voice announces token" },
      { id: "PUB-010", test: "Filtered display shows subset", steps: "Configure display with dept filter", expected: "Only filtered tokens shown" }
    ]}
  ]
};

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    "Receptionist": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Nurse": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "Doctor": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Lab Tech": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Pharmacist": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Accountant": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Finance Manager": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    "HR Officer": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    "HR Manager": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    "Store Manager": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    "ER Staff": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "ER Doctor": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "IPD Nurse": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "IPD Doctor": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "Surgeon": "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
    "Anesthetist": "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    "OT Tech": "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
    "PACU Nurse": "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
    "Blood Bank Tech": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "Dietitian": "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
    "Housekeeping": "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    "Patient": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
    "Employee": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "System": "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    "Warehouse Admin": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    "Warehouse User": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };
  return colors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
};

export default function TestCasesPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'HMS Comprehensive Test Cases' });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HMS Comprehensive Test Cases</h1>
            <p className="text-sm text-muted-foreground">19 End-to-End Journeys · 200+ Module Tests · 21 Demo Accounts</p>
          </div>
          <Button onClick={() => handlePrint()}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        </div>
      </div>

      <div ref={printRef} className="container mx-auto px-4 py-8 print:p-4">
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-bold">Smart HMS - Comprehensive Test Cases</h1>
          <p className="text-sm text-muted-foreground mt-2">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Demo Accounts<Badge variant="secondary" className="ml-2">Password: Demo@123</Badge></CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {TEST_CASES.demoAccounts.map((account, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                  <div><span className="font-medium">{account.role}</span><span className="text-muted-foreground ml-2 text-xs">{account.module}</span></div>
                  <code className="text-xs bg-background px-2 py-1 rounded">{account.email}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />End-to-End Journey Flows<Badge className="ml-2">{JOURNEY_TEST_CASES.length} Journeys</Badge></CardTitle>
            <p className="text-sm text-muted-foreground">Complete workflow testing across multiple roles and departments</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {JOURNEY_TEST_CASES.map((journey) => (
                <AccordionItem key={journey.id} value={journey.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><journey.icon className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{journey.name}</span>
                          <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />{journey.estimatedTime}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{journey.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {journey.roles.map((role) => (<Badge key={role} variant="secondary" className={`text-xs ${getRoleBadgeColor(role)}`}>{role}</Badge>))}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-4 space-y-0">
                      {journey.steps.map((step, idx) => (
                        <div key={step.step} className="relative">
                          {idx < journey.steps.length - 1 && <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-20px)] bg-border" />}
                          <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-bold text-primary shrink-0 z-10">{step.step}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-xs ${getRoleBadgeColor(step.role)}`}>{step.role}</Badge>
                                {step.location && <code className="text-xs bg-muted px-2 py-0.5 rounded">{step.location}</code>}
                              </div>
                              <p className="font-medium mt-1">{step.action}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-muted-foreground">{step.expected}</span></div>
                              {step.data && <p className="text-xs text-muted-foreground mt-1 italic">📝 {step.data}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5" />Module-Wise Test Cases<Badge className="ml-2">{TEST_CASES.modules.reduce((acc, m) => acc + m.tests.length, 0)} Tests</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {TEST_CASES.modules.map((module, idx) => (
                <AccordionItem key={idx} value={`module-${idx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3"><span className="text-2xl">{module.icon}</span><span className="font-semibold">{module.name}</span><Badge variant="outline">{module.tests.length} tests</Badge></div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="max-h-[400px]">
                      <div className="space-y-2 mt-2">
                        {module.tests.map((test) => (
                          <div key={test.id} className="grid grid-cols-12 gap-4 p-3 bg-muted/30 rounded-lg text-sm items-start">
                            <div className="col-span-1"><Badge variant="outline" className="font-mono text-xs">{test.id}</Badge></div>
                            <div className="col-span-3 font-medium">{test.test}</div>
                            <div className="col-span-4 text-muted-foreground">{test.steps}</div>
                            <div className="col-span-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span>{test.expected}</span></div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Smart Hospital Management System · Test Cases Document · © 2026</p>
        </div>
      </div>
    </div>
  );
}
