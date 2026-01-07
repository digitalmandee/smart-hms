import { forwardRef } from "react";
import { format } from "date-fns";
import { InvoiceWithDetails } from "@/hooks/useBilling";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface PrintableInvoiceProps {
  invoice: InvoiceWithDetails;
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, organization }, ref) => {
    const balance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] text-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{organization?.name || "Healthcare Clinic"}</h1>
            {organization?.address && <p className="text-gray-600">{organization.address}</p>}
            {organization?.phone && <p className="text-gray-600">Tel: {organization.phone}</p>}
            {organization?.email && <p className="text-gray-600">{organization.email}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">INVOICE</h2>
            <p className="font-mono text-lg">{invoice.invoice_number}</p>
            <p className="text-gray-600">
              Date: {format(new Date(invoice.invoice_date || invoice.created_at), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <p className="font-bold text-gray-600 mb-1">BILL TO:</p>
          <p className="font-semibold text-lg">
            {invoice.patient.first_name} {invoice.patient.last_name}
          </p>
          <p className="text-gray-600">{invoice.patient.patient_number}</p>
          {invoice.patient.phone && <p className="text-gray-600">{invoice.patient.phone}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 w-12">#</th>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2 w-16">Qty</th>
              <th className="text-right py-2 w-24">Price</th>
              <th className="text-right py-2 w-16">Disc</th>
              <th className="text-right py-2 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">Rs. {Number(item.unit_price).toFixed(2)}</td>
                <td className="py-2 text-right">{item.discount_percent || 0}%</td>
                <td className="py-2 text-right">Rs. {Number(item.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(invoice.tax_amount) > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>Rs. {Number(invoice.tax_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- Rs. {Number(invoice.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-black pt-2 font-bold text-lg">
              <span>TOTAL:</span>
              <span>Rs. {Number(invoice.total_amount).toFixed(2)}</span>
            </div>
            {Number(invoice.paid_amount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Paid:</span>
                <span>Rs. {Number(invoice.paid_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>BALANCE DUE:</span>
              <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                Rs. {balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-4 border-t">
            <p className="font-bold text-gray-600">Notes:</p>
            <p>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t text-center text-gray-500 text-xs">
          <p>Thank you for your visit!</p>
          <p>
            Generated on {format(new Date(), "MMM dd, yyyy 'at' hh:mm a")}
          </p>
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";
