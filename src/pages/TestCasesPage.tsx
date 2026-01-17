import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Printer, FileText, Users, Stethoscope, Pill, FlaskConical, Radio, Ambulance, BedDouble, Scissors, Droplets, Receipt, Building2, Package, Calculator, Settings, Globe } from "lucide-react";

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
  ],
  modules: [
    {
      id: "reception",
      name: "Reception & Patient Registration",
      icon: Users,
      cases: [
        { id: "REC-001", name: "Register new patient", steps: "Dashboard > New Patient > Fill form", expected: "Patient created with MR#" },
        { id: "REC-002", name: "Search patient by MR#", steps: "Search box > Enter MR#", expected: "Patient found" },
        { id: "REC-003", name: "Search patient by CNIC", steps: "Search box > Enter CNIC", expected: "Patient found" },
        { id: "REC-004", name: "Search patient by phone", steps: "Search box > Enter phone number", expected: "Patient found" },
        { id: "REC-005", name: "Create walk-in appointment", steps: "Patient > New Appointment > Walk-in", expected: "Token generated" },
        { id: "REC-006", name: "Schedule future appointment", steps: "Calendar > Select slot > Confirm", expected: "Appointment scheduled" },
        { id: "REC-007", name: "Check-in patient", steps: "Appointments > Select > Check In", expected: "Status: checked_in" },
        { id: "REC-008", name: "Print patient card", steps: "Patient detail > Print", expected: "PDF generated" },
        { id: "REC-009", name: "Edit patient details", steps: "Patient > Edit > Update > Save", expected: "Details updated" },
        { id: "REC-010", name: "View patient history", steps: "Patient > History tab", expected: "All visits shown" },
      ]
    },
    {
      id: "opd-doctor",
      name: "OPD - Doctor Dashboard",
      icon: Stethoscope,
      cases: [
        { id: "OPD-001", name: "View patient queue", steps: "/app/opd", expected: "See checked-in patients" },
        { id: "OPD-002", name: "Start consultation", steps: "Select patient > Start", expected: "Consultation form opens" },
        { id: "OPD-003", name: "Record vitals", steps: "Enter BP, Temp, Pulse, SpO2", expected: "Vitals saved" },
        { id: "OPD-004", name: "Add diagnosis (ICD-10)", steps: "Search diagnosis > Select", expected: "Diagnosis recorded" },
        { id: "OPD-005", name: "Create prescription", steps: "Add medicines > Save", expected: "RX# generated" },
        { id: "OPD-006", name: "Order lab tests", steps: "Add tests > Submit", expected: "Lab order created" },
        { id: "OPD-007", name: "Order imaging", steps: "Add X-ray/Ultrasound > Submit", expected: "Imaging order created" },
        { id: "OPD-008", name: "Complete consultation", steps: "Click Complete", expected: "Status: completed" },
        { id: "OPD-009", name: "Print prescription", steps: "Prescription > Print", expected: "PDF generated" },
        { id: "OPD-010", name: "View patient history", steps: "Patient > History tab", expected: "All previous visits shown" },
        { id: "OPD-011", name: "Add follow-up appointment", steps: "Consultation > Follow-up", expected: "Future appointment created" },
        { id: "OPD-012", name: "Refer to specialist", steps: "Consultation > Refer", expected: "Referral created" },
      ]
    },
    {
      id: "opd-nursing",
      name: "OPD - Nursing Station",
      icon: Stethoscope,
      cases: [
        { id: "NRS-001", name: "View triage queue", steps: "/app/opd/nursing", expected: "See patients needing vitals" },
        { id: "NRS-002", name: "Record patient vitals", steps: "Select patient > Enter vitals", expected: "Vitals saved" },
        { id: "NRS-003", name: "Triage assessment", steps: "Complete triage form", expected: "Patient ready for doctor" },
        { id: "NRS-004", name: "View patient history", steps: "Patient > Quick view", expected: "Medical history displayed" },
        { id: "NRS-005", name: "Update priority", steps: "Patient > Set priority", expected: "Queue position updated" },
      ]
    },
    {
      id: "pharmacy-pos",
      name: "Pharmacy POS",
      icon: Pill,
      cases: [
        { id: "PHA-001", name: "Search by token number", steps: "Enter today's token #", expected: "Patient found with green badge" },
        { id: "PHA-002", name: "Search by MR#", steps: "Enter patient MR#", expected: "Patient with prescriptions shown" },
        { id: "PHA-003", name: "Search by patient name", steps: "Enter patient name", expected: "Matching patients listed" },
        { id: "PHA-004", name: "View pending prescriptions", steps: "Select patient", expected: "Rx items displayed" },
        { id: "PHA-005", name: "Add Rx item to cart", steps: "Click prescription item", expected: "Item added to cart" },
        { id: "PHA-006", name: "Add all Rx items", steps: "Click 'Add All'", expected: "All items in cart" },
        { id: "PHA-007", name: "Search medicine directly", steps: "Product search > Select", expected: "Item added to cart" },
        { id: "PHA-008", name: "Change quantity", steps: "Cart item > +/- buttons", expected: "Quantity updated" },
        { id: "PHA-009", name: "Apply discount", steps: "Enter discount %", expected: "Price adjusted" },
        { id: "PHA-010", name: "Process cash payment", steps: "Checkout > Cash", expected: "Transaction complete" },
        { id: "PHA-011", name: "Process card payment", steps: "Checkout > Card", expected: "Transaction complete" },
        { id: "PHA-012", name: "Print receipt", steps: "After payment > Print", expected: "Receipt generated" },
        { id: "PHA-013", name: "Hold transaction", steps: "Click Hold", expected: "Transaction saved for later" },
        { id: "PHA-014", name: "Recall held transaction", steps: "Held list > Select", expected: "Cart restored" },
        { id: "PHA-015", name: "Verify auto-dispense", steps: "After sale", expected: "Prescription marked dispensed" },
      ]
    },
    {
      id: "pharmacy-inventory",
      name: "Pharmacy Inventory",
      icon: Pill,
      cases: [
        { id: "INV-001", name: "Add new medicine", steps: "Medicines > Add", expected: "Medicine created with code" },
        { id: "INV-002", name: "Stock entry", steps: "Inventory > Add Stock", expected: "Stock level updated" },
        { id: "INV-003", name: "View stock alerts", steps: "Alerts page", expected: "Low stock items shown" },
        { id: "INV-004", name: "View expiry alerts", steps: "Alerts page", expected: "Expiring items shown" },
        { id: "INV-005", name: "View stock movements", steps: "Movements page", expected: "All transactions logged" },
        { id: "INV-006", name: "Adjust stock", steps: "Stock > Adjust", expected: "Adjustment recorded" },
        { id: "INV-007", name: "Batch tracking", steps: "Medicine > Batches", expected: "FIFO order shown" },
      ]
    },
    {
      id: "laboratory",
      name: "Laboratory",
      icon: FlaskConical,
      cases: [
        { id: "LAB-001", name: "View lab queue", steps: "/app/lab/queue", expected: "Pending orders shown" },
        { id: "LAB-002", name: "Collect sample", steps: "Select order > Collect", expected: "Status: collected" },
        { id: "LAB-003", name: "Enter results", steps: "Result entry > Values", expected: "Results saved" },
        { id: "LAB-004", name: "Enter out-of-range result", steps: "Enter abnormal value", expected: "Alert shown" },
        { id: "LAB-005", name: "Complete order", steps: "Mark Complete", expected: "Status: completed" },
        { id: "LAB-006", name: "Print lab report", steps: "Order > Print", expected: "PDF generated" },
        { id: "LAB-007", name: "Public report access", steps: "/lab-reports > Enter ID", expected: "Report viewable" },
        { id: "LAB-008", name: "Reject sample", steps: "Order > Reject", expected: "Status: rejected" },
      ]
    },
    {
      id: "radiology",
      name: "Radiology/Imaging",
      icon: Radio,
      cases: [
        { id: "RAD-001", name: "View technician worklist", steps: "/app/radiology", expected: "Pending orders shown" },
        { id: "RAD-002", name: "Capture image", steps: "Select order > Capture", expected: "Image uploaded" },
        { id: "RAD-003", name: "Create report", steps: "Reporting worklist > Write", expected: "Report saved" },
        { id: "RAD-004", name: "Use report template", steps: "Templates > Select", expected: "Template applied" },
        { id: "RAD-005", name: "Verify report", steps: "Verification queue > Approve", expected: "Report finalized" },
        { id: "RAD-006", name: "Print imaging report", steps: "Report > Print", expected: "PDF generated" },
      ]
    },
    {
      id: "emergency",
      name: "Emergency Department",
      icon: Ambulance,
      cases: [
        { id: "ER-001", name: "Quick registration (known)", steps: "/app/emergency/register > Existing", expected: "ER# generated" },
        { id: "ER-002", name: "Quick registration (unknown)", steps: "/app/emergency/register > Unknown", expected: "ER# with temp ID" },
        { id: "ER-003", name: "Triage assessment", steps: "Assign ESI level", expected: "Priority set (1-5)" },
        { id: "ER-004", name: "View ER queue", steps: "ER Dashboard", expected: "Patients by priority" },
        { id: "ER-005", name: "Record treatment", steps: "Add treatment notes", expected: "Notes saved" },
        { id: "ER-006", name: "Discharge from ER", steps: "Complete treatment > Discharge", expected: "Patient discharged" },
        { id: "ER-007", name: "Admit to IPD from ER", steps: "ER > Admit", expected: "Admission created" },
        { id: "ER-008", name: "Print MLC report", steps: "ER > Print MLC", expected: "PDF generated" },
        { id: "ER-009", name: "Print ER slip", steps: "ER > Print Slip", expected: "PDF generated" },
        { id: "ER-010", name: "Mark as trauma case", steps: "Registration > Trauma flag", expected: "Trauma badge shown" },
        { id: "ER-011", name: "Mark as MLC case", steps: "Registration > MLC flag", expected: "MLC badge shown" },
      ]
    },
    {
      id: "ipd",
      name: "IPD - Inpatient Department",
      icon: BedDouble,
      cases: [
        { id: "IPD-001", name: "New admission", steps: "Admissions > New", expected: "Admission created" },
        { id: "IPD-002", name: "Assign bed", steps: "Select ward > Assign bed", expected: "Bed status: occupied" },
        { id: "IPD-003", name: "View bed map", steps: "Bed Management > Map", expected: "Visual bed layout" },
        { id: "IPD-004", name: "Record daily round", steps: "Rounds > Add notes", expected: "Round documented" },
        { id: "IPD-005", name: "Record vitals chart", steps: "Vitals chart > Add", expected: "Vitals saved" },
        { id: "IPD-006", name: "Add nursing notes", steps: "Notes > Add", expected: "Notes saved" },
        { id: "IPD-007", name: "Medication chart (eMAR)", steps: "Medications > Administer", expected: "Dose recorded" },
        { id: "IPD-008", name: "Diet management", steps: "Diet > Assign", expected: "Diet plan set" },
        { id: "IPD-009", name: "Bed transfer", steps: "Transfer > New bed", expected: "Transfer recorded" },
        { id: "IPD-010", name: "Ward transfer", steps: "Transfer > New ward", expected: "Ward changed" },
        { id: "IPD-011", name: "Final billing", steps: "Discharge > Billing", expected: "Charges compiled" },
        { id: "IPD-012", name: "Discharge summary", steps: "Complete discharge", expected: "Summary generated" },
        { id: "IPD-013", name: "Housekeeping queue", steps: "After discharge", expected: "Bed in cleaning queue" },
      ]
    },
    {
      id: "ot",
      name: "Operation Theatre",
      icon: Scissors,
      cases: [
        { id: "OT-001", name: "Schedule surgery", steps: "/app/ot/schedule > New", expected: "Surgery scheduled" },
        { id: "OT-002", name: "View OT calendar", steps: "OT Schedule", expected: "Calendar view shown" },
        { id: "OT-003", name: "Pre-op assessment", steps: "Surgery > Pre-Op", expected: "Assessment saved" },
        { id: "OT-004", name: "Anesthesia record", steps: "Surgery > Anesthesia", expected: "Record saved" },
        { id: "OT-005", name: "Intra-op notes", steps: "Surgery > Notes", expected: "Notes saved" },
        { id: "OT-006", name: "Consumables used", steps: "Surgery > Consumables", expected: "Items logged" },
        { id: "OT-007", name: "PACU tracking", steps: "Recovery > Monitor", expected: "Recovery tracked" },
        { id: "OT-008", name: "Complete surgery", steps: "Mark Complete", expected: "Status: completed" },
      ]
    },
    {
      id: "blood-bank",
      name: "Blood Bank",
      icon: Droplets,
      cases: [
        { id: "BB-001", name: "Register donor", steps: "Donors > New", expected: "Donor created" },
        { id: "BB-002", name: "Donor screening", steps: "Donation > Screen", expected: "Screening result saved" },
        { id: "BB-003", name: "Record donation", steps: "Donation > New", expected: "Unit added to inventory" },
        { id: "BB-004", name: "View blood inventory", steps: "Inventory page", expected: "Units by group shown" },
        { id: "BB-005", name: "Blood request", steps: "Requests > New", expected: "Request created" },
        { id: "BB-006", name: "Cross-match test", steps: "Request > Cross-match", expected: "Compatibility checked" },
        { id: "BB-007", name: "Issue blood", steps: "Request > Issue", expected: "Unit issued" },
        { id: "BB-008", name: "Record transfusion", steps: "Transfusion > Complete", expected: "Transfusion logged" },
        { id: "BB-009", name: "Track reaction", steps: "Transfusion > Reaction", expected: "Reaction documented" },
        { id: "BB-010", name: "Component separation", steps: "Unit > Separate", expected: "Components created" },
      ]
    },
    {
      id: "billing",
      name: "Billing & Invoicing",
      icon: Receipt,
      cases: [
        { id: "BIL-001", name: "Create invoice", steps: "Invoices > New", expected: "Invoice generated" },
        { id: "BIL-002", name: "Add line items", steps: "Services/Medicines", expected: "Items added" },
        { id: "BIL-003", name: "Apply discount", steps: "Enter discount", expected: "Total adjusted" },
        { id: "BIL-004", name: "Collect full payment", steps: "Payment > Add", expected: "Status: paid" },
        { id: "BIL-005", name: "Collect partial payment", steps: "Enter partial amount", expected: "Balance shown" },
        { id: "BIL-006", name: "Print invoice", steps: "Invoice > Print", expected: "PDF generated" },
        { id: "BIL-007", name: "Print receipt", steps: "Payment > Print", expected: "Receipt generated" },
        { id: "BIL-008", name: "View payment history", steps: "Payments > History", expected: "All payments listed" },
        { id: "BIL-009", name: "Cancel invoice", steps: "Invoice > Cancel", expected: "Invoice voided" },
        { id: "BIL-010", name: "Refund payment", steps: "Payment > Refund", expected: "Refund processed" },
      ]
    },
    {
      id: "insurance",
      name: "Insurance Claims",
      icon: Building2,
      cases: [
        { id: "INS-001", name: "Add insurance company", steps: "Companies > New", expected: "Company created" },
        { id: "INS-002", name: "Create insurance plan", steps: "Plans > New", expected: "Plan created" },
        { id: "INS-003", name: "Link patient insurance", steps: "Patient > Insurance", expected: "Coverage linked" },
        { id: "INS-004", name: "Create claim", steps: "Claims > New", expected: "Claim submitted" },
        { id: "INS-005", name: "Track claim status", steps: "Claims > View", expected: "Status shown" },
        { id: "INS-006", name: "Record claim payment", steps: "Claim > Payment received", expected: "Payment logged" },
      ]
    },
    {
      id: "inventory",
      name: "Inventory & Procurement",
      icon: Package,
      cases: [
        { id: "STK-001", name: "Add item to catalog", steps: "Items > New", expected: "Item created" },
        { id: "STK-002", name: "Add vendor", steps: "Vendors > New", expected: "Vendor created" },
        { id: "STK-003", name: "Create purchase order", steps: "PO > New", expected: "PO generated" },
        { id: "STK-004", name: "Approve PO", steps: "PO > Approve", expected: "Status: approved" },
        { id: "STK-005", name: "Receive goods (GRN)", steps: "GRN > Create from PO", expected: "GRN created" },
        { id: "STK-006", name: "Verify GRN", steps: "GRN > Verify", expected: "Stock updated" },
        { id: "STK-007", name: "Create requisition", steps: "Requisitions > New", expected: "Request submitted" },
        { id: "STK-008", name: "Approve requisition", steps: "Requisition > Approve", expected: "Status: approved" },
        { id: "STK-009", name: "Issue stock", steps: "Requisition > Issue", expected: "Stock reduced" },
        { id: "STK-010", name: "View stock levels", steps: "Stock Levels page", expected: "Current stock shown" },
      ]
    },
    {
      id: "accounts",
      name: "Accounts & Finance",
      icon: Calculator,
      cases: [
        { id: "ACC-001", name: "View chart of accounts", steps: "/app/accounts/chart", expected: "Accounts listed" },
        { id: "ACC-002", name: "Create journal entry", steps: "Journals > New", expected: "Entry created" },
        { id: "ACC-003", name: "View general ledger", steps: "Ledger > Select account", expected: "Transactions shown" },
        { id: "ACC-004", name: "View receivables", steps: "Receivables page", expected: "Outstanding shown" },
        { id: "ACC-005", name: "View payables", steps: "Payables page", expected: "Liabilities shown" },
        { id: "ACC-006", name: "Generate trial balance", steps: "Reports > Trial Balance", expected: "Report generated" },
        { id: "ACC-007", name: "Generate P&L statement", steps: "Reports > Profit & Loss", expected: "Report generated" },
        { id: "ACC-008", name: "Generate balance sheet", steps: "Reports > Balance Sheet", expected: "Report generated" },
        { id: "ACC-009", name: "Bank reconciliation", steps: "Banking > Reconcile", expected: "Reconciliation complete" },
      ]
    },
    {
      id: "hr",
      name: "HR & Staff Management",
      icon: Users,
      cases: [
        { id: "HR-001", name: "Add employee", steps: "Employees > New", expected: "Employee created" },
        { id: "HR-002", name: "Mark attendance", steps: "Attendance > Mark", expected: "Attendance recorded" },
        { id: "HR-003", name: "View attendance sheet", steps: "Attendance > Sheet", expected: "Monthly view shown" },
        { id: "HR-004", name: "Submit leave request", steps: "Leaves > Apply", expected: "Request submitted" },
        { id: "HR-005", name: "Approve leave", steps: "Leaves > Approve", expected: "Leave approved" },
        { id: "HR-006", name: "Reject leave", steps: "Leaves > Reject", expected: "Leave rejected" },
        { id: "HR-007", name: "Process payroll", steps: "Payroll > Process", expected: "Salaries calculated" },
        { id: "HR-008", name: "Generate payslip", steps: "Payroll > Print", expected: "Payslip generated" },
        { id: "HR-009", name: "View doctors list", steps: "HR > Doctors", expected: "Licensed doctors shown" },
        { id: "HR-010", name: "View nurses list", steps: "HR > Nurses", expected: "Registered nurses shown" },
      ]
    },
    {
      id: "settings",
      name: "Settings & Administration",
      icon: Settings,
      cases: [
        { id: "SET-001", name: "Update organization", steps: "Settings > General", expected: "Settings saved" },
        { id: "SET-002", name: "Manage branches", steps: "Settings > Branches", expected: "Branches listed" },
        { id: "SET-003", name: "Add new user", steps: "Settings > Users > New", expected: "User created" },
        { id: "SET-004", name: "Assign roles", steps: "User > Roles", expected: "Role assigned" },
        { id: "SET-005", name: "Configure notifications", steps: "Settings > Notifications", expected: "Settings saved" },
        { id: "SET-006", name: "View audit logs", steps: "Settings > Audit Logs", expected: "Activity logged" },
        { id: "SET-007", name: "Manage kiosks", steps: "Settings > Kiosks", expected: "Kiosks listed" },
        { id: "SET-008", name: "Configure queue display", steps: "Settings > Queue Display", expected: "Display configured" },
      ]
    },
    {
      id: "public",
      name: "Public Portals",
      icon: Globe,
      cases: [
        { id: "PUB-001", name: "Queue display", steps: "/display/queue/{orgId}", expected: "Live queue shown" },
        { id: "PUB-002", name: "ER display", steps: "/display/er/{orgId}", expected: "ER queue shown" },
        { id: "PUB-003", name: "Token kiosk check-in", steps: "/kiosk/{kioskId} > Enter phone", expected: "Patient found" },
        { id: "PUB-004", name: "Token generation", steps: "Kiosk > Confirm", expected: "Token printed" },
        { id: "PUB-005", name: "Lab report portal", steps: "/lab-reports > Enter ID", expected: "Report accessible" },
      ]
    },
  ]
};

export default function TestCasesPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "HealthOS_Test_Cases",
  });

  const toggleAll = () => {
    if (expandedModules.length === TEST_CASES.modules.length) {
      setExpandedModules([]);
    } else {
      setExpandedModules(TEST_CASES.modules.map(m => m.id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">HealthOS Test Cases</h1>
              <p className="text-sm text-muted-foreground">Comprehensive Testing Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleAll}>
              {expandedModules.length === TEST_CASES.modules.length ? "Collapse All" : "Expand All"}
            </Button>
            <Button onClick={() => handlePrint()} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="container mx-auto px-4 py-8 print:p-0">
        {/* Print Header */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-bold">HealthOS - Test Cases Document</h1>
          <p className="text-lg mt-2">Hospital Management System - Comprehensive Testing Guide</p>
          <p className="text-sm text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Demo Accounts Section */}
        <Card className="mb-8 print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demo Accounts (Password: Demo@123)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Role</th>
                    <th className="text-left py-2 px-3 font-semibold">Email</th>
                    <th className="text-left py-2 px-3 font-semibold">Primary Module</th>
                  </tr>
                </thead>
                <tbody>
                  {TEST_CASES.demoAccounts.map((account, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 px-3">
                        <Badge variant="secondary">{account.role}</Badge>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs">{account.email}</td>
                      <td className="py-2 px-3 text-muted-foreground">{account.module}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Test Summary */}
        <Card className="mb-8 print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{TEST_CASES.modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {TEST_CASES.modules.reduce((sum, m) => sum + m.cases.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Test Cases</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{TEST_CASES.demoAccounts.length}</div>
                <div className="text-sm text-muted-foreground">Demo Users</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">17+</div>
                <div className="text-sm text-muted-foreground">Active Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Test Cases */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Module-Wise Test Cases</h2>
          
          <Accordion 
            type="multiple" 
            value={expandedModules}
            onValueChange={setExpandedModules}
            className="space-y-2"
          >
            {TEST_CASES.modules.map((module) => (
              <AccordionItem 
                key={module.id} 
                value={module.id}
                className="border rounded-lg print:border print:mb-4 print:break-inside-avoid"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <module.icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{module.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {module.cases.length} tests
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-2 px-3 font-semibold w-24">Test ID</th>
                          <th className="text-left py-2 px-3 font-semibold">Test Case</th>
                          <th className="text-left py-2 px-3 font-semibold">Steps</th>
                          <th className="text-left py-2 px-3 font-semibold">Expected Result</th>
                          <th className="text-center py-2 px-3 font-semibold w-20 print:hidden">Pass</th>
                        </tr>
                      </thead>
                      <tbody>
                        {module.cases.map((testCase) => (
                          <tr key={testCase.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2 px-3">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{testCase.id}</code>
                            </td>
                            <td className="py-2 px-3 font-medium">{testCase.name}</td>
                            <td className="py-2 px-3 text-muted-foreground">{testCase.steps}</td>
                            <td className="py-2 px-3 text-muted-foreground">{testCase.expected}</td>
                            <td className="py-2 px-3 text-center print:hidden">
                              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>HealthOS - Hospital Management System</p>
          <p>© 2026 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
