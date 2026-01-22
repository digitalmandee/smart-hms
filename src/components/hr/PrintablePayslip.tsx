import { forwardRef } from "react";
import { format } from "date-fns";

interface PayslipData {
  employee: {
    name: string;
    employeeNumber: string;
    department?: string;
    designation?: string;
  };
  period: {
    month: number;
    year: number;
  };
  earnings: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  workingDays: number;
  daysWorked: number;
  leaveDays: number;
  grossSalary?: number;
  netSalary?: number;
  paymentDate?: string;
  paymentMethod?: string;
}

interface OrganizationBranding {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  registration_number?: string | null;
  primary_color?: string;
}

interface PrintablePayslipProps {
  data: PayslipData;
  branding?: OrganizationBranding;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Convert number to words for Pakistani Rupees
function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  };
  
  return numToWords(Math.floor(num)) + " Rupees Only";
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "white",
    padding: "32px",
    minHeight: "297mm",
    width: "210mm",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "11pt",
    color: "#1a1a1a",
    position: "relative",
    boxSizing: "border-box",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "3px solid #0d9488",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    width: "70px",
    height: "70px",
    objectFit: "contain" as const,
    borderRadius: "8px",
  },
  orgInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  orgName: {
    fontSize: "20pt",
    fontWeight: "bold",
    color: "#0d9488",
    margin: 0,
    lineHeight: 1.2,
  },
  orgDetails: {
    fontSize: "9pt",
    color: "#666",
    marginTop: "4px",
  },
  payslipBadge: {
    backgroundColor: "#0d9488",
    color: "white",
    padding: "8px 24px",
    borderRadius: "4px",
    fontSize: "14pt",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  periodSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  periodTitle: {
    fontSize: "14pt",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  employeeBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    backgroundColor: "#f9fafb",
  },
  employeeBoxTitle: {
    fontSize: "10pt",
    fontWeight: "600",
    color: "#0d9488",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  employeeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  employeeField: {
    display: "flex",
    flexDirection: "column" as const,
  },
  fieldLabel: {
    fontSize: "8pt",
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  fieldValue: {
    fontSize: "11pt",
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: "2px",
  },
  attendanceSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  attendanceCard: {
    textAlign: "center" as const,
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  attendanceValue: {
    fontSize: "24pt",
    fontWeight: "bold",
    margin: 0,
    lineHeight: 1,
  },
  attendanceLabel: {
    fontSize: "9pt",
    color: "#666",
    marginTop: "4px",
  },
  earningsDeductionsSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "10px 16px",
    fontWeight: "600",
    fontSize: "10pt",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  earningsHeader: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  deductionsHeader: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  sectionContent: {
    padding: "12px 16px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "10pt",
  },
  itemName: {
    color: "#4b5563",
  },
  itemAmount: {
    fontWeight: "500",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderTop: "2px solid #e5e7eb",
    marginTop: "8px",
    fontWeight: "600",
    fontSize: "11pt",
  },
  netSalarySection: {
    backgroundColor: "#0d9488",
    color: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
  },
  netSalaryGrid: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netSalaryLabel: {
    fontSize: "12pt",
    fontWeight: "500",
  },
  netSalaryAmount: {
    fontSize: "28pt",
    fontWeight: "bold",
    margin: 0,
  },
  amountInWords: {
    fontSize: "9pt",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.3)",
    opacity: 0.9,
  },
  paymentInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontSize: "9pt",
    color: "#9ca3af",
  },
  signatureSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "48px",
    marginTop: "48px",
    marginBottom: "24px",
  },
  signatureLine: {
    borderTop: "1px solid #9ca3af",
    paddingTop: "8px",
    textAlign: "center" as const,
    fontSize: "9pt",
    color: "#666",
  },
};

export const PrintablePayslip = forwardRef<HTMLDivElement, PrintablePayslipProps>(
  ({ data, branding }, ref) => {
    const monthName = MONTHS[(data.period?.month || 1) - 1];
    const year = data.period?.year || new Date().getFullYear();
    
    const totalEarnings = data.earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalDeductions = data.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const netSalary = data.netSalary ?? (totalEarnings - totalDeductions);
    const grossSalary = data.grossSalary ?? totalEarnings;

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
      }).format(amount || 0);

    const formatPaymentDate = (dateStr?: string) => {
      if (!dateStr) return "N/A";
      try {
        return format(new Date(dateStr), "dd MMM yyyy");
      } catch {
        return dateStr;
      }
    };

    return (
      <div ref={ref} style={styles.container} className="print-container">
        {/* Header with Logo and Organization Info */}
        <div style={styles.header}>
          <div style={styles.logoSection}>
            {branding?.logo_url && (
              <img
                src={branding.logo_url}
                alt="Organization Logo"
                style={styles.logo}
              />
            )}
            <div style={styles.orgInfo}>
              <h1 style={styles.orgName}>{branding?.name || "Organization"}</h1>
              <div style={styles.orgDetails}>
                {branding?.address && <div>{branding.address}</div>}
                {branding?.phone && <div>Tel: {branding.phone}</div>}
                {branding?.email && <div>Email: {branding.email}</div>}
              </div>
            </div>
          </div>
          <div style={styles.payslipBadge}>PAYSLIP</div>
        </div>

        {/* Period */}
        <div style={styles.periodSection}>
          <h2 style={styles.periodTitle}>
            Salary Statement for {monthName} {year}
          </h2>
        </div>

        {/* Employee Information */}
        <div style={styles.employeeBox}>
          <div style={styles.employeeBoxTitle}>Employee Details</div>
          <div style={styles.employeeGrid}>
            <div style={styles.employeeField}>
              <span style={styles.fieldLabel}>Employee Name</span>
              <span style={styles.fieldValue}>{data.employee.name}</span>
            </div>
            <div style={styles.employeeField}>
              <span style={styles.fieldLabel}>Employee ID</span>
              <span style={styles.fieldValue}>{data.employee.employeeNumber}</span>
            </div>
            {data.employee.department && (
              <div style={styles.employeeField}>
                <span style={styles.fieldLabel}>Department</span>
                <span style={styles.fieldValue}>{data.employee.department}</span>
              </div>
            )}
            {data.employee.designation && (
              <div style={styles.employeeField}>
                <span style={styles.fieldLabel}>Designation</span>
                <span style={styles.fieldValue}>{data.employee.designation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div style={styles.attendanceSection}>
          <div style={{ ...styles.attendanceCard, backgroundColor: "#f9fafb" }}>
            <p style={{ ...styles.attendanceValue, color: "#374151" }}>
              {data.workingDays}
            </p>
            <p style={styles.attendanceLabel}>Working Days</p>
          </div>
          <div style={{ ...styles.attendanceCard, backgroundColor: "#dcfce7" }}>
            <p style={{ ...styles.attendanceValue, color: "#166534" }}>
              {data.daysWorked}
            </p>
            <p style={styles.attendanceLabel}>Days Worked</p>
          </div>
          <div style={{ ...styles.attendanceCard, backgroundColor: "#dbeafe" }}>
            <p style={{ ...styles.attendanceValue, color: "#1e40af" }}>
              {data.leaveDays}
            </p>
            <p style={styles.attendanceLabel}>Leave Days</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div style={styles.earningsDeductionsSection}>
          {/* Earnings */}
          <div style={styles.section}>
            <div style={{ ...styles.sectionHeader, ...styles.earningsHeader }}>
              Earnings
            </div>
            <div style={styles.sectionContent}>
              {data.earnings?.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={{ ...styles.itemAmount, color: "#166534" }}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
              <div style={styles.totalRow}>
                <span>Gross Salary</span>
                <span style={{ color: "#166534" }}>{formatCurrency(grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div style={styles.section}>
            <div style={{ ...styles.sectionHeader, ...styles.deductionsHeader }}>
              Deductions
            </div>
            <div style={styles.sectionContent}>
              {data.deductions?.length > 0 ? (
                data.deductions.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={{ ...styles.itemAmount, color: "#991b1b" }}>
                      -{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "10pt", color: "#9ca3af", padding: "8px 0" }}>
                  No deductions
                </p>
              )}
              <div style={styles.totalRow}>
                <span>Total Deductions</span>
                <span style={{ color: "#991b1b" }}>-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div style={styles.netSalarySection}>
          <div style={styles.netSalaryGrid}>
            <div>
              <span style={styles.netSalaryLabel}>Net Salary Payable</span>
            </div>
            <p style={styles.netSalaryAmount}>{formatCurrency(netSalary)}</p>
          </div>
          <div style={styles.amountInWords}>
            <strong>Amount in Words:</strong> {numberToWords(netSalary)}
          </div>
        </div>

        {/* Payment Information */}
        <div style={styles.paymentInfo}>
          <div style={styles.employeeField}>
            <span style={styles.fieldLabel}>Payment Date</span>
            <span style={styles.fieldValue}>{formatPaymentDate(data.paymentDate)}</span>
          </div>
          <div style={styles.employeeField}>
            <span style={styles.fieldLabel}>Payment Method</span>
            <span style={styles.fieldValue}>{data.paymentMethod || "N/A"}</span>
          </div>
        </div>

        {/* Signature Section */}
        <div style={styles.signatureSection}>
          <div style={styles.signatureLine}>Employee Signature</div>
          <div style={styles.signatureLine}>Authorized Signatory</div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>This is a computer-generated payslip and does not require a physical signature.</p>
          <p style={{ marginTop: "4px" }}>
            Generated on {format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
          </p>
        </div>
      </div>
    );
  }
);

PrintablePayslip.displayName = "PrintablePayslip";
