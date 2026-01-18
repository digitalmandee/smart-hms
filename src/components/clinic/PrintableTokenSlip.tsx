import { forwardRef } from "react";
import { format } from "date-fns";
import { generateQRCodeUrl, getAppointmentVerificationUrl } from "@/lib/qrcode";

interface PrintableTokenSlipProps {
  tokenNumber: number;
  patient: {
    name: string;
    mrNumber?: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
  invoiceNumber?: string;
  amountPaid?: number;
  paymentMethod?: string;
  organization: {
    name: string;
    address?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    slug?: string;
  };
  showQR?: boolean;
}

export const PrintableTokenSlip = forwardRef<HTMLDivElement, PrintableTokenSlipProps>(
  ({ tokenNumber, patient, doctor, invoiceNumber, amountPaid, paymentMethod, organization, showQR = true }, ref) => {
    const qrData = getAppointmentVerificationUrl(tokenNumber, organization.slug);

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
        </div>

        {/* Token Title */}
        <div className="text-center mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide">OPD Token</p>
        </div>

        {/* Large Token Number */}
        <div className="text-center my-4">
          <div className="text-5xl font-bold">#{tokenNumber}</div>
        </div>

        {/* Patient & Doctor Info */}
        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Patient:</span>
            <span className="font-medium">{patient.name}</span>
          </div>
          {patient.mrNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">MR#:</span>
              <span className="font-mono">{patient.mrNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">{doctor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Specialty:</span>
            <span>{doctor.specialty}</span>
          </div>
        </div>

        {/* Payment Info (if paid) */}
        {invoiceNumber && (
          <div className="border-t border-dashed pt-2 mb-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice:</span>
              <span className="font-mono">{invoiceNumber}</span>
            </div>
            {amountPaid !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid:</span>
                <span className="font-bold">Rs. {amountPaid.toLocaleString()}</span>
              </div>
            )}
            {paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        {showQR && (
          <div className="text-center my-3 border-t border-dashed pt-3">
            <img 
              src={generateQRCodeUrl(qrData, 80)} 
              alt="Token QR Code"
              className="mx-auto w-20 h-20"
            />
            <p className="text-[10px] text-gray-500 mt-1">Scan to verify</p>
          </div>
        )}

        {/* Date/Time */}
        <div className="text-center text-xs border-t border-dashed pt-2 mt-2">
          <p>
            <strong>Date:</strong> {format(new Date(), "dd MMM yyyy")} &nbsp;|&nbsp;
            <strong>Time:</strong> {format(new Date(), "hh:mm a")}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-500 mt-3 pt-2 border-t border-dashed">
          <p>Please wait for your token to be called</p>
        </div>
      </div>
    );
  }
);

PrintableTokenSlip.displayName = "PrintableTokenSlip";
