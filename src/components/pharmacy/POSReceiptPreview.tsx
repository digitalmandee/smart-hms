import { forwardRef } from "react";
import { format } from "date-fns";
import { POSTransaction } from "@/hooks/usePOS";

interface POSReceiptPreviewProps {
  transaction: POSTransaction;
  organizationName?: string;
  branchName?: string;
  currencySymbol?: string;
}

export const POSReceiptPreview = forwardRef<HTMLDivElement, POSReceiptPreviewProps>(
  ({ transaction, organizationName = "Pharmacy", branchName = "Main Branch", currencySymbol = "Rs." }, ref) => {
    const paymentMethodLabels: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
      bank_transfer: "Bank Transfer",
      other: "Other",
    };

    const fc = (amount: number) => `${currencySymbol} ${amount.toFixed(2)}`;

    // Inline styles for print compatibility
    const styles = {
      container: {
        backgroundColor: "white",
        padding: "24px",
        width: "300px",
        color: "black",
        fontFamily: "monospace",
        fontSize: "12px",
      },
      header: {
        textAlign: "center" as const,
        marginBottom: "16px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold" as const,
        margin: 0,
      },
      subtitle: {
        fontSize: "12px",
        margin: 0,
      },
      dashedBorder: {
        borderBottom: "1px dashed #9ca3af",
        marginTop: "8px",
        marginBottom: "8px",
      },
      solidBorder: {
        borderBottom: "1px solid #d1d5db",
      },
      row: {
        display: "flex",
        justifyContent: "space-between",
      },
      rowSemibold: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 600,
      },
      rowBold: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: "bold" as const,
        fontSize: "14px",
      },
      section: {
        marginBottom: "8px",
      },
      columnLayout: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
      },
      itemName: {
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
        paddingRight: "8px",
      },
      itemDetail: {
        fontSize: "10px",
        color: "#4b5563",
        paddingLeft: "8px",
      },
      itemRow: {
        marginBottom: "4px",
      },
      footer: {
        textAlign: "center" as const,
        marginTop: "16px",
      },
      footerSmall: {
        fontSize: "10px",
        marginTop: "4px",
      },
      footerPowered: {
        fontSize: "10px",
        marginTop: "8px",
        color: "#6b7280",
      },
      fontSemibold: {
        fontWeight: 600,
      },
      headerSemibold: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 600,
        marginBottom: "4px",
      },
    };

    return (
      <div ref={ref} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{organizationName}</h1>
          <p style={styles.subtitle}>{branchName}</p>
          <div style={styles.dashedBorder} />
          <p style={styles.fontSemibold}>{transaction.transaction_number}</p>
          <p>{format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}</p>
        </div>

        <div style={styles.dashedBorder} />

        {/* Customer Info */}
        {(transaction.customer_name || transaction.customer_phone) && (
          <>
            <div style={styles.section}>
              {transaction.customer_name && <p>Customer: {transaction.customer_name}</p>}
              {transaction.customer_phone && <p>Phone: {transaction.customer_phone}</p>}
            </div>
            <div style={styles.dashedBorder} />
          </>
        )}

        {/* Items */}
        <div style={styles.section}>
          <div style={styles.headerSemibold}>
            <span>Item</span>
            <span>Amount</span>
          </div>
          <div style={styles.solidBorder} />
          
          {transaction.items?.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <div style={styles.row}>
                <span style={styles.itemName}>{item.medicine_name}</span>
                <span>{fc(item.line_total)}</span>
              </div>
              <div style={styles.itemDetail}>
                {item.quantity} x {fc(item.unit_price)}
                {item.discount_percent > 0 && ` (-${item.discount_percent}%)`}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.dashedBorder} />

        {/* Totals */}
        <div style={styles.columnLayout}>
          <div style={styles.row}>
            <span>Subtotal:</span>
            <span>{fc(Number(transaction.subtotal))}</span>
          </div>
          
          {Number(transaction.discount_amount) > 0 && (
            <div style={styles.row}>
              <span>Discount ({transaction.discount_percent}%):</span>
              <span>-{fc(Number(transaction.discount_amount))}</span>
            </div>
          )}
          
          {Number(transaction.tax_amount) > 0 && (
            <div style={styles.row}>
              <span>Tax:</span>
              <span>{fc(Number(transaction.tax_amount))}</span>
            </div>
          )}
          
          <div style={styles.solidBorder} />
          
          <div style={styles.rowBold}>
            <span>TOTAL:</span>
            <span>{fc(Number(transaction.total_amount))}</span>
          </div>
        </div>

        <div style={styles.dashedBorder} />

        {/* Payment Info */}
        <div style={styles.columnLayout}>
          {transaction.payments?.map((payment, index) => (
            <div key={index} style={styles.row}>
              <span>{paymentMethodLabels[payment.payment_method]}:</span>
              <span>{fc(Number(payment.amount))}</span>
            </div>
          ))}
          
          {Number(transaction.change_amount) > 0 && (
            <div style={styles.rowSemibold}>
              <span>Change:</span>
              <span>{fc(Number(transaction.change_amount))}</span>
            </div>
          )}
        </div>

        <div style={styles.dashedBorder} />

        {/* Footer */}
        <div style={styles.footer}>
          <p>Thank you for your purchase!</p>
          <p style={styles.footerSmall}>Get well soon</p>
        </div>
      </div>
    );
  }
);

POSReceiptPreview.displayName = "POSReceiptPreview";
