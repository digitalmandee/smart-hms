import { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { InvoiceWithDetails } from "@/hooks/useBilling";
import { generateQRCodeUrl, getInvoiceVerificationUrl } from "@/lib/qrcode";

interface PrintableInvoiceProps {
  invoice: InvoiceWithDetails;
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
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, organization, branchName }, ref) => {
    const balance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
    const isPaid = invoice.status === "paid";
    const verificationUrl = getInvoiceVerificationUrl(invoice.invoice_number, organization?.slug);
    const qrCodeUrl = generateQRCodeUrl(verificationUrl, 80);

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] text-sm print:p-6">
        {/* ===== LETTERHEAD HEADER ===== */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            {/* Organization Info */}
            <div className="flex items-start gap-4">
              {organization?.logo_url && (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {organization?.name || "Healthcare Facility"}
                </h1>
                {organization?.address && (
                  <p className="text-gray-600 text-sm mt-1">{organization.address}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                  {organization?.phone && <span>Tel: {organization.phone}</span>}
                  {organization?.email && <span>{organization.email}</span>}
                </div>
                {(organization?.registration_number || organization?.tax_id) && (
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {organization?.registration_number && (
                      <span>Reg: {organization.registration_number}</span>
                    )}
                    {organization?.tax_id && (
                      <span>Tax ID: {organization.tax_id}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Title & QR */}
            <div className="text-right">
              <div className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md mb-2">
                <h2 className="text-xl font-bold tracking-wide">TAX INVOICE</h2>
              </div>
              <div className="mt-2">
                <img
                  src={qrCodeUrl}
                  alt="Verify Invoice"
                  className="ml-auto w-16 h-16"
                />
                <p className="text-[10px] text-gray-500 mt-1">Scan to verify</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== INVOICE DETAILS BAR ===== */}
        <div className="grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Number</p>
            <p className="font-mono font-bold text-lg">{invoice.invoice_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Date</p>
            <p className="font-semibold">
              {format(new Date(invoice.invoice_date || invoice.created_at), "dd MMM yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                isPaid
                  ? "bg-green-100 text-green-800"
                  : invoice.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {invoice.status?.toUpperCase().replace("_", " ")}
            </span>
          </div>
        </div>

        {/* ===== BILL TO SECTION ===== */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
              Bill To
            </p>
            <p className="font-bold text-lg">
              {invoice.patient.first_name} {invoice.patient.last_name}
            </p>
            <p className="text-gray-600 font-mono text-sm">{invoice.patient.patient_number}</p>
            {invoice.patient.phone && (
              <p className="text-gray-600 text-sm mt-1">Tel: {invoice.patient.phone}</p>
            )}
          </div>
          {branchName && (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
                Branch
              </p>
              <p className="font-semibold">{branchName}</p>
            </div>
          )}
        </div>

        {/* ===== ITEMS TABLE ===== */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left py-3 px-3 text-xs uppercase tracking-wide w-10">#</th>
              <th className="text-left py-3 px-3 text-xs uppercase tracking-wide">Description</th>
              <th className="text-center py-3 px-3 text-xs uppercase tracking-wide w-16">Qty</th>
              <th className="text-right py-3 px-3 text-xs uppercase tracking-wide w-28">Unit Price</th>
              <th className="text-center py-3 px-3 text-xs uppercase tracking-wide w-16">Disc%</th>
              <th className="text-right py-3 px-3 text-xs uppercase tracking-wide w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-2 px-3 border-b border-gray-200">{index + 1}</td>
                <td className="py-2 px-3 border-b border-gray-200">
                  <span className="font-medium">{item.description}</span>
                </td>
                <td className="py-2 px-3 border-b border-gray-200 text-center">
                  {item.quantity}
                </td>
                <td className="py-2 px-3 border-b border-gray-200 text-right font-mono">
                  Rs. {Number(item.unit_price).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 border-b border-gray-200 text-center">
                  {item.discount_percent || 0}%
                </td>
                <td className="py-2 px-3 border-b border-gray-200 text-right font-mono font-semibold">
                  Rs. {Number(item.total_price).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== TOTALS SECTION ===== */}
        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-mono">
                Rs. {Number(invoice.subtotal).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Number(invoice.tax_amount) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Tax:</span>
                <span className="font-mono">
                  Rs. {Number(invoice.tax_amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Discount:</span>
                <span className="font-mono text-red-600">
                  - Rs. {Number(invoice.discount_amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
              <span>TOTAL:</span>
              <span className="font-mono">
                Rs. {Number(invoice.total_amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Number(invoice.paid_amount) > 0 && (
              <div className="flex justify-between py-1 text-green-700">
                <span>Paid:</span>
                <span className="font-mono">
                  Rs. {Number(invoice.paid_amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div
              className={`flex justify-between py-2 rounded-md px-2 font-bold text-lg ${
                balance > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              <span>BALANCE DUE:</span>
              <span className="font-mono">
                Rs. {balance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ===== AMOUNT IN WORDS ===== */}
        <div className="bg-gray-50 p-3 rounded-lg mb-6 border">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Amount in Words</p>
          <p className="font-semibold capitalize">
            Rupees {numberToWords(invoice.total_amount || 0)} Only
          </p>
        </div>

        {/* ===== NOTES SECTION ===== */}
        {invoice.notes && (
          <div className="mb-6 p-3 border rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
              Notes
            </p>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* ===== TERMS & SIGNATURE ===== */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t">
          {/* Terms */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">Terms & Conditions:</p>
            <p>1. Payment is due upon receipt unless otherwise specified.</p>
            <p>2. All services are subject to our standard terms of service.</p>
            <p>3. For queries, please contact our billing department.</p>
          </div>

          {/* Signature */}
          <div className="text-center">
            <div className="h-16 border-b border-dashed border-gray-400 mb-2"></div>
            <p className="text-sm font-semibold">Authorized Signature</p>
            <p className="text-xs text-gray-500">{organization?.name || "Healthcare Facility"}</p>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500 space-y-1">
          <p className="font-semibold">Thank you for choosing our healthcare services!</p>
          <p>This is a computer-generated invoice and is valid without a signature.</p>
          <p>
            Generated on {format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
          </p>
        </div>

        {/* ===== PAID WATERMARK ===== */}
        {isPaid && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none print:flex">
            <div className="text-green-500/20 text-8xl font-bold rotate-[-30deg] tracking-widest">
              PAID
            </div>
          </div>
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
