import { forwardRef } from "react";
import { format } from "date-fns";
import { PaymentWithMethod } from "@/hooks/useBilling";

interface PrintableReceiptProps {
  payment: PaymentWithMethod;
  invoice: {
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
  };
  patient: {
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
  organization?: {
    name: string;
    name_ar?: string | null;
    address?: string | null;
    phone?: string | null;
    tax_registration_number?: string | null;
  };
  currencySymbol?: string;
  taxLabel?: string;
  isBilingual?: boolean;
  taxRegistrationLabel?: string;
  depositApplied?: number;
  depositAvailable?: number;
  remainingDeposit?: number;
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '24px',
    maxWidth: '80mm',
    margin: '0 auto',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '12px',
    color: 'black',
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    borderBottom: '2px dashed black',
    paddingBottom: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,
  orgName: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  } as React.CSSProperties,
  orgAddress: {
    fontSize: '11px',
    margin: '2px 0',
  } as React.CSSProperties,
  receiptTitle: {
    fontWeight: 'bold',
    marginTop: '8px',
  } as React.CSSProperties,
  section: {
    marginBottom: '16px',
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
    marginBottom: '16px',
  } as React.CSSProperties,
  patientName: {
    fontWeight: '600',
    fontSize: '13px',
    margin: 0,
  } as React.CSSProperties,
  patientNumber: {
    fontSize: '11px',
    color: '#6b7280',
    margin: '2px 0 0 0',
  } as React.CSSProperties,
  paymentSection: {
    borderTop: '1px dashed #9ca3af',
    padding: '16px 0',
  } as React.CSSProperties,
  amountPaidRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  } as React.CSSProperties,
  methodRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '4px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#6b7280',
    marginBottom: '6px',
  } as React.CSSProperties,
  summarySection: {
    borderTop: '1px dashed #9ca3af',
    paddingTop: '12px',
  } as React.CSSProperties,
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '4px',
  } as React.CSSProperties,
  totalSettledRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '13px',
    paddingTop: '4px',
    borderTop: '1px solid #d1d5db',
    marginTop: '4px',
    marginBottom: '4px',
  } as React.CSSProperties,
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '13px',
    paddingTop: '4px',
  } as React.CSSProperties,
  balanceDue: {
    color: '#dc2626',
  } as React.CSSProperties,
  refundDue: {
    color: '#2563eb',
  } as React.CSSProperties,
  fullySettled: {
    color: '#16a34a',
  } as React.CSSProperties,
  depositRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '4px',
    color: '#16a34a',
  } as React.CSSProperties,
  footer: {
    marginTop: '24px',
    paddingTop: '12px',
    borderTop: '1px dashed #9ca3af',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  receivedBy: {
    fontSize: '11px',
    marginBottom: '4px',
  } as React.CSSProperties,
  thankYou: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '8px',
  } as React.CSSProperties,
};

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ payment, invoice, patient, organization, currencySymbol = 'Rs.', taxLabel, isBilingual = false, taxRegistrationLabel, depositApplied = 0, depositAvailable, remainingDeposit }, ref) => {
    const thisPaymentAmount = Number(payment.amount);
    const totalPaidOnInvoice = invoice.paid_amount || 0;
    const invoiceTotal = invoice.total_amount || 0;

    // Previous cash payments = total paid minus deposit minus this payment
    const previousCashPaid = Math.max(totalPaidOnInvoice - depositApplied - thisPaymentAmount, 0);
    const totalSettled = depositApplied + previousCashPaid + thisPaymentAmount;
    const balanceDue = Math.max(invoiceTotal - totalSettled, 0);
    const refundDue = totalSettled > invoiceTotal ? totalSettled - invoiceTotal : 0;
    const isFullySettled = totalSettled > 0 && balanceDue === 0 && refundDue === 0;

    const fmt = (amount: number) => `${currencySymbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const showDepositSection = depositApplied > 0 || (depositAvailable !== undefined && depositAvailable > 0);

    return (
      <div ref={ref} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.orgName}>{organization?.name || "Healthcare Clinic"}</h1>
          {isBilingual && organization?.name_ar && (
            <p style={{ ...styles.orgAddress, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{organization.name_ar}</p>
          )}
          {organization?.address && <p style={styles.orgAddress}>{organization.address}</p>}
          {organization?.phone && <p style={styles.orgAddress}>Tel: {organization.phone}</p>}
          {organization?.tax_registration_number && taxRegistrationLabel && (
            <p style={styles.orgAddress}>{taxRegistrationLabel}: {organization.tax_registration_number}</p>
          )}
          <p style={styles.receiptTitle}>
            PAYMENT RECEIPT{isBilingual ? ' / إيصال دفع' : ''}
          </p>
        </div>

        {/* Receipt Details */}
        <div style={styles.section}>
          <div style={styles.row}>
            <span style={styles.label}>Date:</span>
            <span style={styles.value}>
              {format(new Date(payment.payment_date || payment.created_at), "MMM dd, yyyy hh:mm a")}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Invoice#:</span>
            <span style={styles.value}>{invoice.invoice_number}</span>
          </div>
        </div>

        {/* Patient */}
        <div style={styles.patientSection}>
          <p style={styles.patientName}>
            {patient.first_name} {patient.last_name}
          </p>
          <p style={styles.patientNumber}>{patient.patient_number}</p>
        </div>

        {/* Payment Details */}
        <div style={styles.paymentSection}>
          <div style={styles.amountPaidRow}>
            <span>Amount Paid:{isBilingual ? ' / المبلغ المدفوع' : ''}</span>
            <span>{fmt(thisPaymentAmount)}</span>
          </div>
          <div style={styles.methodRow}>
            <span>Method:</span>
            <span>{payment.payment_method?.name || "Cash"}</span>
          </div>
          {payment.reference_number && (
            <div style={styles.methodRow}>
              <span>Reference:</span>
              <span>{payment.reference_number}</span>
            </div>
          )}
        </div>

        {/* Section 1: Invoice Total */}
        <div style={styles.summarySection}>
          <p style={styles.sectionTitle}>Invoice{isBilingual ? ' / الفاتورة' : ''}</p>
          <div style={styles.summaryRow}>
            <span>Net Invoice Total:{isBilingual ? ' / صافي المبلغ' : ''}</span>
            <span>{fmt(invoiceTotal)}</span>
          </div>
        </div>

        {/* Section 2: Deposit Utilization */}
        {showDepositSection && (
          <div style={{ ...styles.summarySection, borderTop: 'none', paddingTop: '8px' }}>
            <p style={styles.sectionTitle}>Deposit{isBilingual ? ' / الإيداع' : ''}</p>
            {depositAvailable !== undefined && depositAvailable > 0 && (
              <div style={styles.summaryRow}>
                <span>Deposit Available:{isBilingual ? ' / الإيداع المتاح' : ''}</span>
                <span>{fmt(depositAvailable)}</span>
              </div>
            )}
            {depositApplied > 0 && (
              <div style={styles.depositRow}>
                <span>Deposit Applied:{isBilingual ? ' / الإيداع المطبق' : ''}</span>
                <span>- {fmt(depositApplied)}</span>
              </div>
            )}
            {remainingDeposit !== undefined && remainingDeposit > 0 && (
              <div style={styles.summaryRow}>
                <span>Remaining Deposit:{isBilingual ? ' / الإيداع المتبقي' : ''}</span>
                <span>{fmt(remainingDeposit)}</span>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Settlement */}
        <div style={{ ...styles.summarySection, borderTop: 'none', paddingTop: '8px' }}>
          <p style={styles.sectionTitle}>Settlement{isBilingual ? ' / التسوية' : ''}</p>
          {previousCashPaid > 0 && (
            <div style={styles.summaryRow}>
              <span>Previous Cash Payments:{isBilingual ? ' / المدفوعات السابقة' : ''}</span>
              <span>{fmt(previousCashPaid)}</span>
            </div>
          )}
          <div style={styles.summaryRow}>
            <span>This Payment:{isBilingual ? ' / هذه الدفعة' : ''}</span>
            <span>{fmt(thisPaymentAmount)}</span>
          </div>
          <div style={styles.totalSettledRow}>
            <span>Total Settled:{isBilingual ? ' / إجمالي التسوية' : ''}</span>
            <span>{fmt(totalSettled)}</span>
          </div>

          {refundDue > 0 ? (
            <div style={styles.balanceRow}>
              <span>Refund Due:{isBilingual ? ' / مبلغ الاسترداد' : ''}</span>
              <span style={styles.refundDue}>{fmt(refundDue)}</span>
            </div>
          ) : balanceDue > 0 ? (
            <div style={styles.balanceRow}>
              <span>Balance Due:{isBilingual ? ' / الرصيد المستحق' : ''}</span>
              <span style={styles.balanceDue}>{fmt(balanceDue)}</span>
            </div>
          ) : isFullySettled ? (
            <div style={styles.balanceRow}>
              <span>Status:{isBilingual ? ' / الحالة' : ''}</span>
              <span style={styles.fullySettled}>Fully Settled{isBilingual ? ' / تمت التسوية' : ''}</span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {payment.received_by_profile && (
            <p style={styles.receivedBy}>Received by: {payment.received_by_profile.full_name}</p>
          )}
          <p style={styles.thankYou}>Thank you for your payment!</p>
        </div>
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";
