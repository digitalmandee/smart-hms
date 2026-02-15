import { forwardRef } from "react";
import { format } from "date-fns";
import { generateQRCodeUrl, getInvoiceVerificationUrl } from "@/lib/qrcode";

interface PrintablePaymentReceiptProps {
  receiptNumber?: string;
  invoiceNumber: string;
  patient: {
    name: string;
    mrNumber?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  referenceNumber?: string;
  balanceDue?: number;
  receivedBy?: string;
  organization: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
    slug?: string;
  };
  showQR?: boolean;
  currencySymbol?: string;
  taxLabel?: string;
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '16px',
    maxWidth: '80mm',
    margin: '0 auto',
    fontFamily: "'Arial', sans-serif",
    fontSize: '12px',
    color: 'black',
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    borderBottom: '2px dashed black',
    paddingBottom: '12px',
    marginBottom: '12px',
  } as React.CSSProperties,
  logo: {
    height: '40px',
    margin: '0 auto 8px',
    objectFit: 'contain' as const,
    display: 'block',
  } as React.CSSProperties,
  orgName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  } as React.CSSProperties,
  orgAddress: {
    fontSize: '10px',
    margin: '2px 0',
  } as React.CSSProperties,
  receiptTitle: {
    textAlign: 'center' as const,
    marginBottom: '12px',
  } as React.CSSProperties,
  receiptTitleText: {
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  receiptNumber: {
    fontSize: '10px',
    color: '#6b7280',
    marginTop: '2px',
  } as React.CSSProperties,
  section: {
    marginBottom: '12px',
    fontSize: '11px',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  } as React.CSSProperties,
  label: {
    color: '#6b7280',
  } as React.CSSProperties,
  value: {
    fontFamily: "'Courier New', Courier, monospace",
  } as React.CSSProperties,
  dashedBorder: {
    borderTop: '1px dashed #9ca3af',
    paddingTop: '8px',
    marginBottom: '12px',
  } as React.CSSProperties,
  patientSection: {
    borderTop: '1px dashed #9ca3af',
    paddingTop: '8px',
    marginBottom: '12px',
    fontSize: '11px',
  } as React.CSSProperties,
  patientName: {
    fontWeight: '600',
    fontSize: '12px',
    margin: 0,
  } as React.CSSProperties,
  patientNumber: {
    fontSize: '10px',
    color: '#6b7280',
    margin: '2px 0 0 0',
  } as React.CSSProperties,
  tableSection: {
    borderTop: '1px dashed #9ca3af',
    paddingTop: '8px',
    marginBottom: '12px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '10px',
  } as React.CSSProperties,
  tableHeader: {
    borderBottom: '1px solid #d1d5db',
  } as React.CSSProperties,
  tableHeaderCell: {
    padding: '4px 2px',
    textAlign: 'left' as const,
    fontWeight: 600,
    fontSize: '10px',
  } as React.CSSProperties,
  tableHeaderCellRight: {
    padding: '4px 2px',
    textAlign: 'right' as const,
    fontWeight: 600,
    fontSize: '10px',
  } as React.CSSProperties,
  tableRow: {
    borderBottom: 'none',
  } as React.CSSProperties,
  tableCell: {
    padding: '4px 2px',
    fontSize: '10px',
  } as React.CSSProperties,
  tableCellRight: {
    padding: '4px 2px',
    textAlign: 'right' as const,
    fontSize: '10px',
  } as React.CSSProperties,
  totalsSection: {
    borderTop: '1px dashed #9ca3af',
    paddingTop: '8px',
    marginBottom: '12px',
    fontSize: '11px',
  } as React.CSSProperties,
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  } as React.CSSProperties,
  discountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    color: '#16a34a',
  } as React.CSSProperties,
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '13px',
    paddingTop: '4px',
    borderTop: '1px solid #d1d5db',
  } as React.CSSProperties,
  paymentSection: {
    borderTop: '1px dashed #9ca3af',
    padding: '12px 0',
  } as React.CSSProperties,
  amountPaidRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  } as React.CSSProperties,
  amountPaidValue: {
    color: '#15803d',
  } as React.CSSProperties,
  methodRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '4px',
  } as React.CSSProperties,
  balanceDueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#dc2626',
    paddingTop: '4px',
    borderTop: '1px solid #fecaca',
  } as React.CSSProperties,
  qrSection: {
    textAlign: 'center' as const,
    borderTop: '1px dashed #9ca3af',
    paddingTop: '12px',
    margin: '12px 0',
  } as React.CSSProperties,
  qrImage: {
    width: '80px',
    height: '80px',
    margin: '0 auto',
    display: 'block',
  } as React.CSSProperties,
  qrText: {
    fontSize: '9px',
    color: '#6b7280',
    marginTop: '4px',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center' as const,
    borderTop: '1px dashed #9ca3af',
    paddingTop: '12px',
    marginTop: '8px',
    fontSize: '11px',
  } as React.CSSProperties,
  receivedBy: {
    color: '#6b7280',
    marginBottom: '4px',
  } as React.CSSProperties,
  thankYou: {
    fontWeight: '600',
  } as React.CSSProperties,
  computerGenerated: {
    fontSize: '9px',
    color: '#6b7280',
    marginTop: '8px',
  } as React.CSSProperties,
};

export const PrintablePaymentReceipt = forwardRef<HTMLDivElement, PrintablePaymentReceiptProps>(
  ({ 
    receiptNumber,
    invoiceNumber, 
    patient, 
    items,
    subtotal,
    tax,
    discount,
    totalAmount, 
    paidAmount, 
    paymentMethod, 
    referenceNumber,
    balanceDue = 0,
    receivedBy,
    organization,
    showQR = true,
    currencySymbol = "Rs.",
    taxLabel = "Tax",
  }, ref) => {
    const qrData = getInvoiceVerificationUrl(invoiceNumber, organization.slug);
    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString()}`;

    return (
      <div ref={ref} style={styles.container}>
        {/* Header with Organization Branding */}
        <div style={styles.header}>
          {organization.logo_url && (
            <img 
              src={organization.logo_url} 
              alt={organization.name}
              style={styles.logo}
              crossOrigin="anonymous"
            />
          )}
          <h1 style={styles.orgName}>{organization.name}</h1>
          {organization.address && <p style={styles.orgAddress}>{organization.address}</p>}
          {organization.phone && <p style={styles.orgAddress}>Tel: {organization.phone}</p>}
          {organization.email && <p style={styles.orgAddress}>{organization.email}</p>}
        </div>

        {/* Receipt Title */}
        <div style={styles.receiptTitle}>
          <p style={styles.receiptTitleText}>Payment Receipt</p>
          {receiptNumber && <p style={styles.receiptNumber}>#{receiptNumber}</p>}
        </div>

        {/* Receipt Details */}
        <div style={styles.section}>
          <div style={styles.row}>
            <span style={styles.label}>Date:</span>
            <span style={styles.value}>{format(new Date(), "MMM dd, yyyy hh:mm a")}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Invoice#:</span>
            <span style={styles.value}>{invoiceNumber}</span>
          </div>
        </div>

        {/* Patient Info */}
        <div style={styles.patientSection}>
          <p style={styles.patientName}>{patient.name}</p>
          {patient.mrNumber && <p style={styles.patientNumber}>{patient.mrNumber}</p>}
        </div>

        {/* Items (if provided) */}
        {items && items.length > 0 && (
          <div style={styles.tableSection}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Item</th>
                  <th style={styles.tableHeaderCellRight}>Qty</th>
                  <th style={styles.tableHeaderCellRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.tableCell}>{item.description}</td>
                    <td style={styles.tableCellRight}>{item.quantity}</td>
                    <td style={styles.tableCellRight}>{fc(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={styles.totalsSection}>
          {subtotal !== undefined && (
            <div style={styles.totalsRow}>
              <span>Subtotal:</span>
              <span>{fc(subtotal)}</span>
            </div>
          )}
          {tax !== undefined && tax > 0 && (
            <div style={styles.totalsRow}>
              <span>{taxLabel}:</span>
              <span>{fc(tax)}</span>
            </div>
          )}
          {discount !== undefined && discount > 0 && (
            <div style={styles.discountRow}>
              <span>Discount:</span>
              <span>-{fc(discount)}</span>
            </div>
          )}
          <div style={styles.totalRow}>
            <span>Total:</span>
            <span>{fc(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div style={styles.paymentSection}>
          <div style={styles.amountPaidRow}>
            <span>Amount Paid:</span>
            <span style={styles.amountPaidValue}>{fc(paidAmount)}</span>
          </div>
          <div style={styles.methodRow}>
            <span style={styles.label}>Method:</span>
            <span style={{ textTransform: 'capitalize' }}>{paymentMethod.replace('_', ' ')}</span>
          </div>
          {referenceNumber && (
            <div style={styles.methodRow}>
              <span style={styles.label}>Reference:</span>
              <span style={styles.value}>{referenceNumber}</span>
            </div>
          )}
          {balanceDue > 0 && (
            <div style={styles.balanceDueRow}>
              <span>Balance Due:</span>
              <span>{fc(balanceDue)}</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        {showQR && (
          <div style={styles.qrSection}>
            <img 
              src={generateQRCodeUrl(qrData, 80)} 
              alt="Invoice QR Code"
              style={styles.qrImage}
            />
            <p style={styles.qrText}>Scan to verify payment</p>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          {receivedBy && (
            <p style={styles.receivedBy}>Received by: {receivedBy}</p>
          )}
          <p style={styles.thankYou}>Thank you for your payment!</p>
          <p style={styles.computerGenerated}>
            This is a computer-generated receipt
          </p>
        </div>
      </div>
    );
  }
);

PrintablePaymentReceipt.displayName = "PrintablePaymentReceipt";
