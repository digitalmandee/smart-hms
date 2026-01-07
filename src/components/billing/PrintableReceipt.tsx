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
    address?: string | null;
    phone?: string | null;
  };
}

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ payment, invoice, patient, organization }, ref) => {
    const previousPaid = (invoice.paid_amount || 0) - Number(payment.amount);
    const balanceDue = (invoice.total_amount || 0) - (invoice.paid_amount || 0);

    return (
      <div ref={ref} className="p-6 bg-white text-black max-w-[80mm] mx-auto text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-4">
          <h1 className="text-lg font-bold">{organization?.name || "Healthcare Clinic"}</h1>
          {organization?.address && <p className="text-xs">{organization.address}</p>}
          {organization?.phone && <p className="text-xs">Tel: {organization.phone}</p>}
          <p className="font-bold mt-2">PAYMENT RECEIPT</p>
        </div>

        {/* Receipt Details */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>
              {format(new Date(payment.payment_date || payment.created_at), "MMM dd, yyyy hh:mm a")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice#:</span>
            <span className="font-mono">{invoice.invoice_number}</span>
          </div>
        </div>

        {/* Patient */}
        <div className="border-t border-dashed pt-2 mb-4">
          <p className="font-semibold">
            {patient.first_name} {patient.last_name}
          </p>
          <p className="text-xs text-gray-600">{patient.patient_number}</p>
        </div>

        {/* Payment Details */}
        <div className="border-t border-dashed py-4 space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Amount Paid:</span>
            <span>Rs. {Number(payment.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Method:</span>
            <span>{payment.payment_method?.name || "Cash"}</span>
          </div>
          {payment.reference_number && (
            <div className="flex justify-between text-xs">
              <span>Reference:</span>
              <span>{payment.reference_number}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-dashed pt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Invoice Total:</span>
            <span>Rs. {Number(invoice.total_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Previous Paid:</span>
            <span>Rs. {previousPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>This Payment:</span>
            <span>Rs. {Number(payment.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t">
            <span>Balance Due:</span>
            <span className={balanceDue > 0 ? "text-red-600" : ""}>
              Rs. {balanceDue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-dashed text-center">
          {payment.received_by_profile && (
            <p className="text-xs">Received by: {payment.received_by_profile.full_name}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Thank you for your payment!</p>
        </div>
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";
