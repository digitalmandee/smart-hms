import { forwardRef } from "react";
import { format } from "date-fns";
import { InvoiceWithDetails } from "@/hooks/useBilling";
import { generateQRCodeUrl, getInvoiceVerificationUrl } from "@/lib/qrcode";

interface PrintableInvoiceProps {
  invoice: InvoiceWithDetails & {
    zatca_qr_code?: string | null;
    zatca_uuid?: string | null;
  };
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
    slug?: string;
    registration_number?: string | null;
    tax_id?: string | null;
  };
  branchName?: string;
  currencySymbol?: string;
  currencyLocale?: string;
  taxLabel?: string;
}

// Inline styles for print compatibility
const styles = {
  container: {
    backgroundColor: "white",
    padding: "32px",
    minHeight: "297mm",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "11pt",
    color: "#1a1a1a",
    position: "relative" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "3px solid #0d9488",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  logo: {
    width: "64px",
    height: "64px",
    objectFit: "contain" as const,
  },
  orgName: {
    fontSize: "22px",
    fontWeight: "bold" as const,
    color: "#0d9488",
    margin: "0 0 4px 0",
  },
  orgAddress: {
    fontSize: "12px",
    color: "#4b5563",
    margin: "4px 0",
  },
  contactRow: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#4b5563",
    marginTop: "4px",
  },
  regRow: {
    display: "flex",
    gap: "16px",
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px",
  },
  headerRight: {
    textAlign: "right" as const,
  },
  invoiceBadge: {
    display: "inline-block",
    backgroundColor: "#1f2937",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  invoiceBadgeText: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    letterSpacing: "1px",
    margin: 0,
  },
  qrContainer: {
    marginTop: "8px",
  },
  qrImage: {
    marginLeft: "auto",
    width: "64px",
    height: "64px",
  },
  qrText: {
    fontSize: "9px",
    color: "#6b7280",
    marginTop: "4px",
  },
  detailsBar: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  detailsItem: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  detailsValue: {
    fontFamily: "monospace",
    fontWeight: "bold" as const,
    fontSize: "16px",
  },
  detailsValueNormal: {
    fontWeight: 600,
    fontSize: "14px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  billToSection: {
    display: "flex",
    gap: "32px",
    marginBottom: "24px",
  },
  billToBox: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
  },
  billToLabel: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "8px",
    fontWeight: 600,
  },
  billToName: {
    fontWeight: "bold" as const,
    fontSize: "16px",
    margin: 0,
  },
  billToMRN: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#4b5563",
    margin: "4px 0",
  },
  billToPhone: {
    fontSize: "12px",
    color: "#4b5563",
    marginTop: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "24px",
  },
  tableHeader: {
    backgroundColor: "#1f2937",
  },
  tableHeaderCell: {
    color: "white",
    padding: "12px 8px",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  tableHeaderCellLeft: {
    textAlign: "left" as const,
  },
  tableHeaderCellCenter: {
    textAlign: "center" as const,
  },
  tableHeaderCellRight: {
    textAlign: "right" as const,
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "10px 8px",
    fontSize: "11px",
  },
  tableCellCenter: {
    padding: "10px 8px",
    fontSize: "11px",
    textAlign: "center" as const,
  },
  tableCellRight: {
    padding: "10px 8px",
    fontSize: "11px",
    textAlign: "right" as const,
    fontFamily: "monospace",
  },
  tableCellRightBold: {
    padding: "10px 8px",
    fontSize: "11px",
    textAlign: "right" as const,
    fontFamily: "monospace",
    fontWeight: 600,
  },
  totalsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "24px",
  },
  totalsBox: {
    width: "280px",
  },
  totalsRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  totalsLabel: {
    color: "#4b5563",
  },
  totalsValue: {
    fontFamily: "monospace",
  },
  totalsTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderTop: "2px solid #1f2937",
    fontWeight: "bold" as const,
    fontSize: "16px",
  },
  totalsPaidRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    color: "#15803d",
  },
  totalsBalanceRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 8px",
    borderRadius: "4px",
    fontWeight: "bold" as const,
    fontSize: "14px",
  },
  totalsBalanceDue: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
  },
  totalsBalancePaid: {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
  },
  amountWordsBox: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
  },
  amountWordsLabel: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  amountWordsValue: {
    fontWeight: 600,
    textTransform: "capitalize" as const,
  },
  notesBox: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  notesLabel: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
    fontWeight: 600,
  },
  notesValue: {
    color: "#374151",
  },
  termsSignatureRow: {
    display: "flex",
    gap: "32px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  termsBox: {
    flex: 1,
    fontSize: "10px",
    color: "#6b7280",
  },
  termsTitle: {
    fontWeight: 600,
    color: "#374151",
    marginBottom: "8px",
    fontSize: "11px",
  },
  termItem: {
    margin: "4px 0",
  },
  signatureBox: {
    flex: 1,
    textAlign: "center" as const,
  },
  signatureLine: {
    height: "48px",
    borderBottom: "1px dashed #9ca3af",
    marginBottom: "8px",
  },
  signatureLabel: {
    fontSize: "12px",
    fontWeight: 600,
  },
  signatureOrg: {
    fontSize: "10px",
    color: "#6b7280",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontSize: "10px",
    color: "#6b7280",
  },
  footerThankYou: {
    fontWeight: 600,
    marginBottom: "4px",
  },
  footerNote: {
    marginBottom: "4px",
  },
  watermark: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: "96px",
    fontWeight: "bold" as const,
    color: "rgba(34, 197, 94, 0.12)",
    pointerEvents: "none" as const,
    zIndex: 1000,
    letterSpacing: "8px",
  },
  discountValue: {
    fontFamily: "monospace",
    color: "#dc2626",
  },
  zatcaQrBox: {
    marginTop: "16px",
    padding: "12px",
    border: "2px solid #0d9488",
    borderRadius: "8px",
    backgroundColor: "#f0fdfa",
  },
  zatcaQrTitle: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#0d9488",
    marginBottom: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  zatcaQrImage: {
    width: "80px",
    height: "80px",
    margin: "0 auto",
    display: "block",
  },
  zatcaUuid: {
    fontSize: "8px",
    color: "#6b7280",
    textAlign: "center" as const,
    marginTop: "4px",
    fontFamily: "monospace",
    wordBreak: "break-all" as const,
  },
};

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, organization, branchName, currencySymbol = "Rs.", currencyLocale = "en-PK", taxLabel = "Tax" }, ref) => {
    const balance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
    const isPaid = invoice.status === "paid";
    const verificationUrl = getInvoiceVerificationUrl(invoice.invoice_number, organization?.slug);
    const qrCodeUrl = generateQRCodeUrl(verificationUrl, 80);
    
    // ZATCA QR code (for KSA compliance)
    const zatcaQrCode = invoice.zatca_qr_code;
    const zatcaQrImageUrl = zatcaQrCode ? generateQRCodeUrl(zatcaQrCode, 100) : null;

    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}`;

    const getStatusStyle = () => {
      if (isPaid) return { ...styles.statusBadge, ...styles.statusPaid };
      if (invoice.status === "cancelled") return { ...styles.statusBadge, ...styles.statusCancelled };
      return { ...styles.statusBadge, ...styles.statusPending };
    };

    const getBalanceStyle = () => {
      return balance > 0
        ? { ...styles.totalsBalanceRow, ...styles.totalsBalanceDue }
        : { ...styles.totalsBalanceRow, ...styles.totalsBalancePaid };
    };

    return (
      <div ref={ref} style={styles.container}>
        {/* ===== LETTERHEAD HEADER ===== */}
        <div style={styles.header}>
          {/* Organization Info */}
          <div style={styles.headerLeft}>
            {organization?.logo_url && (
              <img
                src={organization.logo_url}
                alt={organization.name}
                style={styles.logo}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div>
              <h1 style={styles.orgName}>
                {organization?.name || "Healthcare Facility"}
              </h1>
              {organization?.address && (
                <p style={styles.orgAddress}>{organization.address}</p>
              )}
              <div style={styles.contactRow}>
                {organization?.phone && <span>Tel: {organization.phone}</span>}
                {organization?.phone && organization?.email && <span>|</span>}
                {organization?.email && <span>{organization.email}</span>}
              </div>
              {(organization?.registration_number || organization?.tax_id) && (
                <div style={styles.regRow}>
                  {organization?.registration_number && (
                    <span>Reg: {organization.registration_number}</span>
                  )}
                  {organization?.tax_id && (
                    <span>{taxLabel} ID: {organization.tax_id}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Title & QR */}
          <div style={styles.headerRight}>
            <div style={styles.invoiceBadge}>
              <h2 style={styles.invoiceBadgeText}>TAX INVOICE</h2>
            </div>
            <div style={styles.qrContainer}>
              <img
                src={qrCodeUrl}
                alt="Verify Invoice"
                style={styles.qrImage}
              />
              <p style={styles.qrText}>Scan to verify</p>
            </div>
          </div>
        </div>

        {/* ===== INVOICE DETAILS BAR ===== */}
        <div style={styles.detailsBar}>
          <div style={styles.detailsItem}>
            <p style={styles.detailsLabel}>Invoice Number</p>
            <p style={styles.detailsValue}>{invoice.invoice_number}</p>
          </div>
          <div style={styles.detailsItem}>
            <p style={styles.detailsLabel}>Invoice Date</p>
            <p style={styles.detailsValueNormal}>
              {format(new Date(invoice.invoice_date || invoice.created_at), "dd MMM yyyy")}
            </p>
          </div>
          <div style={styles.detailsItem}>
            <p style={styles.detailsLabel}>Status</p>
            <span style={getStatusStyle()}>
              {invoice.status?.toUpperCase().replace("_", " ")}
            </span>
          </div>
        </div>

        {/* ===== BILL TO SECTION ===== */}
        <div style={styles.billToSection}>
          <div style={styles.billToBox}>
            <p style={styles.billToLabel}>Bill To</p>
            <p style={styles.billToName}>
              {invoice.patient.first_name} {invoice.patient.last_name}
            </p>
            <p style={styles.billToMRN}>{invoice.patient.patient_number}</p>
            {invoice.patient.phone && (
              <p style={styles.billToPhone}>Tel: {invoice.patient.phone}</p>
            )}
          </div>
          {branchName && (
            <div style={styles.billToBox}>
              <p style={styles.billToLabel}>Branch</p>
              <p style={{ ...styles.billToName, fontSize: "14px" }}>{branchName}</p>
            </div>
          )}
        </div>

        {/* ===== ITEMS TABLE ===== */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellLeft, width: "40px" }}>#</th>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellLeft }}>Description</th>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellCenter, width: "60px" }}>Qty</th>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellRight, width: "100px" }}>Unit Price</th>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellCenter, width: "60px" }}>Disc%</th>
              <th style={{ ...styles.tableHeaderCell, ...styles.tableHeaderCellRight, width: "110px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={{ ...styles.tableCell, fontWeight: 500 }}>
                  {item.description}
                </td>
                <td style={styles.tableCellCenter}>{item.quantity}</td>
                <td style={styles.tableCellRight}>
                  {fc(Number(item.unit_price))}
                </td>
                <td style={styles.tableCellCenter}>{item.discount_percent || 0}%</td>
                <td style={styles.tableCellRightBold}>
                  {fc(Number(item.total_price))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== TOTALS SECTION ===== */}
        <div style={styles.totalsContainer}>
          <div style={styles.totalsBox}>
            <div style={styles.totalsRow}>
              <span style={styles.totalsLabel}>Subtotal:</span>
              <span style={styles.totalsValue}>
                {fc(Number(invoice.subtotal))}
              </span>
            </div>
            {Number(invoice.tax_amount) > 0 && (
              <div style={styles.totalsRow}>
                <span style={styles.totalsLabel}>{taxLabel}:</span>
                <span style={styles.totalsValue}>
                  {fc(Number(invoice.tax_amount))}
                </span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div style={styles.totalsRow}>
                <span style={styles.totalsLabel}>Discount:</span>
                <span style={styles.discountValue}>
                  - {fc(Number(invoice.discount_amount))}
                </span>
              </div>
            )}
            <div style={styles.totalsTotalRow}>
              <span>TOTAL:</span>
              <span style={{ fontFamily: "monospace" }}>
                {fc(Number(invoice.total_amount))}
              </span>
            </div>
            {Number(invoice.paid_amount) > 0 && (
              <div style={styles.totalsPaidRow}>
                <span>Paid:</span>
                <span style={{ fontFamily: "monospace" }}>
                  {fc(Number(invoice.paid_amount))}
                </span>
              </div>
            )}
            <div style={getBalanceStyle()}>
              <span>BALANCE DUE:</span>
              <span style={{ fontFamily: "monospace" }}>
                {fc(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* ===== AMOUNT IN WORDS ===== */}
        <div style={styles.amountWordsBox}>
          <p style={styles.amountWordsLabel}>Amount in Words</p>
          <p style={styles.amountWordsValue}>
            {numberToWords(invoice.total_amount || 0)} Only
          </p>
        </div>

        {/* ===== NOTES SECTION ===== */}
        {invoice.notes && (
          <div style={styles.notesBox}>
            <p style={styles.notesLabel}>Notes</p>
            <p style={styles.notesValue}>{invoice.notes}</p>
          </div>
        )}

        {/* ===== TERMS & SIGNATURE ===== */}
        <div style={styles.termsSignatureRow}>
          {/* Terms */}
          <div style={styles.termsBox}>
            <p style={styles.termsTitle}>Terms & Conditions:</p>
            <p style={styles.termItem}>1. Payment is due upon receipt unless otherwise specified.</p>
            <p style={styles.termItem}>2. All services are subject to our standard terms of service.</p>
            <p style={styles.termItem}>3. For queries, please contact our billing department.</p>
          </div>

          {/* Signature */}
          <div style={styles.signatureBox}>
            <div style={styles.signatureLine}></div>
            <p style={styles.signatureLabel}>Authorized Signature</p>
            <p style={styles.signatureOrg}>{organization?.name || "Healthcare Facility"}</p>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={styles.footer}>
          <p style={styles.footerThankYou}>Thank you for choosing our healthcare services!</p>
          <p style={styles.footerNote}>This is a computer-generated invoice and is valid without a signature.</p>
          <p>Generated on {format(new Date(), "dd MMM yyyy 'at' hh:mm a")}</p>
        </div>

        {/* ===== PAID WATERMARK ===== */}
        {isPaid && (
          <div style={styles.watermark}>PAID</div>
        )}
      </div>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";

// Helper function to convert number to words
function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = numToWords(integerPart);
  if (decimalPart > 0) {
    result += " and " + numToWords(decimalPart) + " paisa";
  }

  return result;
}
