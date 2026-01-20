import { forwardRef } from "react";
import { format } from "date-fns";
import { POSTransaction } from "@/hooks/usePOS";

interface POSReceiptPreviewProps {
  transaction: POSTransaction;
  organizationName?: string;
  branchName?: string;
}

export const POSReceiptPreview = forwardRef<HTMLDivElement, POSReceiptPreviewProps>(
  ({ transaction, organizationName = "Smart HMS Pharmacy", branchName = "Main Branch" }, ref) => {
    const paymentMethodLabels: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
      bank_transfer: "Bank Transfer",
      other: "Other",
    };

    return (
      <div
        ref={ref}
        className="bg-white p-6 w-[300px] text-black font-mono text-xs"
        style={{ fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold">{organizationName}</h1>
          <p className="text-xs">{branchName}</p>
          <div className="border-b border-dashed border-gray-400 my-2" />
          <p className="font-semibold">{transaction.transaction_number}</p>
          <p>{format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}</p>
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Customer Info */}
        {(transaction.customer_name || transaction.customer_phone) && (
          <>
            <div className="mb-2">
              {transaction.customer_name && <p>Customer: {transaction.customer_name}</p>}
              {transaction.customer_phone && <p>Phone: {transaction.customer_phone}</p>}
            </div>
            <div className="border-b border-dashed border-gray-400 my-2" />
          </>
        )}

        {/* Items */}
        <div className="mb-2">
          <div style={{ display: "flex", justifyContent: "space-between" }} className="font-semibold mb-1">
            <span>Item</span>
            <span>Amount</span>
          </div>
          <div className="border-b border-gray-300 mb-1" />
          
          {transaction.items?.map((item, index) => (
            <div key={index} className="mb-1">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "8px" }}>{item.medicine_name}</span>
                <span>Rs. {item.line_total.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-gray-600 pl-2">
                {item.quantity} x Rs. {item.unit_price.toFixed(2)}
                {item.discount_percent > 0 && ` (-${item.discount_percent}%)`}
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal:</span>
            <span>Rs. {Number(transaction.subtotal).toFixed(2)}</span>
          </div>
          
          {Number(transaction.discount_amount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Discount ({transaction.discount_percent}%):</span>
              <span>-Rs. {Number(transaction.discount_amount).toFixed(2)}</span>
            </div>
          )}
          
          {Number(transaction.tax_amount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax:</span>
              <span>Rs. {Number(transaction.tax_amount).toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-b border-gray-300" />
          
          <div style={{ display: "flex", justifyContent: "space-between" }} className="font-bold text-sm">
            <span>TOTAL:</span>
            <span>Rs. {Number(transaction.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Payment Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {transaction.payments?.map((payment, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{paymentMethodLabels[payment.payment_method]}:</span>
              <span>Rs. {Number(payment.amount).toFixed(2)}</span>
            </div>
          ))}
          
          {Number(transaction.change_amount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }} className="font-semibold">
              <span>Change:</span>
              <span>Rs. {Number(transaction.change_amount).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Footer */}
        <div className="text-center mt-4">
          <p>Thank you for your purchase!</p>
          <p className="text-[10px] mt-1">Get well soon</p>
          <p className="text-[10px] mt-2 text-gray-500">
            Powered by Smart HMS
          </p>
        </div>
      </div>
    );
  }
);

POSReceiptPreview.displayName = "POSReceiptPreview";
