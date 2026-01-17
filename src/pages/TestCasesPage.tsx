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
    { role: "Blood Bank Tech", email: "bloodbank@healthos.demo", module: "Blood Bank Operations" }
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
    { name: "Inventory", icon: "📦", tests: [
      { id: "INV-001", test: "Create purchase order", steps: "PO > New", expected: "PO generated" },
      { id: "INV-002", test: "Approve PO", steps: "PO > Approve", expected: "Status: approved" },
      { id: "INV-003", test: "Receive goods (GRN)", steps: "GRN > Create from PO", expected: "GRN created" },
      { id: "INV-004", test: "View stock levels", steps: "Stock Levels page", expected: "Current stock shown" }
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
            <p className="text-sm text-muted-foreground">14 End-to-End Journeys · 190+ Module Tests · 19 Demo Accounts</p>
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
