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
}

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
    showQR = true
  }, ref) => {
    const qrData = getInvoiceVerificationUrl(invoiceNumber, organization.slug);

    return (
      <div ref={ref} className="p-4 bg-white text-black max-w-[80mm] mx-auto text-sm font-sans">
        {/* Header with Organization Branding */}
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
          {organization.logo_url && (
            <img 
              src={organization.logo_url} 
              alt={organization.name}
              className="h-10 mx-auto mb-2 object-contain"
            />
          )}
          <h1 className="text-base font-bold">{organization.name}</h1>
          {organization.address && <p className="text-xs">{organization.address}</p>}
          {organization.phone && <p className="text-xs">Tel: {organization.phone}</p>}
          {organization.email && <p className="text-xs">{organization.email}</p>}
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-3">
          <p className="text-sm font-bold uppercase tracking-wide">Payment Receipt</p>
          {receiptNumber && <p className="text-xs text-gray-600">#{receiptNumber}</p>}
        </div>

        {/* Receipt Details */}
        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{format(new Date(), "MMM dd, yyyy hh:mm a")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice#:</span>
            <span className="font-mono">{invoiceNumber}</span>
          </div>
        </div>

        {/* Patient Info */}
        <div className="border-t border-dashed pt-2 mb-3 text-xs">
          <p className="font-semibold">{patient.name}</p>
          {patient.mrNumber && <p className="text-gray-600">{patient.mrNumber}</p>}
        </div>

        {/* Items (if provided) */}
        {items && items.length > 0 && (
          <div className="border-t border-dashed pt-2 mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-right py-1">Qty</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1">{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">Rs. {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-dashed py-2 space-y-1 text-xs">
          {subtotal !== undefined && (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
          )}
          {tax !== undefined && tax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>Rs. {tax.toLocaleString()}</span>
            </div>
          )}
          {discount !== undefined && discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-Rs. {discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t">
            <span>Total:</span>
            <span>Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-dashed py-3 space-y-1">
          <div className="flex justify-between text-base font-bold">
            <span>Amount Paid:</span>
            <span className="text-green-700">Rs. {paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Method:</span>
            <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
          </div>
          {referenceNumber && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono">{referenceNumber}</span>
            </div>
          )}
          {balanceDue > 0 && (
            <div className="flex justify-between text-sm font-bold text-red-600 pt-1 border-t">
              <span>Balance Due:</span>
              <span>Rs. {balanceDue.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="text-center my-3 border-t border-dashed pt-3">
            <img 
              src={generateQRCodeUrl(qrData, 80)} 
              alt="Invoice QR Code"
              className="mx-auto w-20 h-20"
            />
            <p className="text-[10px] text-gray-500 mt-1">Scan to verify payment</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs border-t border-dashed pt-3 mt-2">
          {receivedBy && (
            <p className="text-gray-600 mb-1">Received by: {receivedBy}</p>
          )}
          <p className="font-semibold">Thank you for your payment!</p>
          <p className="text-[10px] text-gray-500 mt-2">
            This is a computer-generated receipt
          </p>
        </div>
      </div>
    );
  }
);

PrintablePaymentReceipt.displayName = "PrintablePaymentReceipt";
