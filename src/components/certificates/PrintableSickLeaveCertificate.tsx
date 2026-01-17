import React, { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { MedicalCertificate } from "@/hooks/useMedicalCertificates";

interface PrintableSickLeaveCertificateProps {
  certificate: MedicalCertificate;
  organizationName?: string;
  branchName?: string;
}

export const PrintableSickLeaveCertificate = forwardRef<HTMLDivElement, PrintableSickLeaveCertificateProps>(
  ({ certificate, organizationName, branchName }, ref) => {
    const patientName = certificate.patient 
      ? `${certificate.patient.first_name} ${certificate.patient.last_name}` 
      : "N/A";
    
    const patientAge = certificate.patient?.date_of_birth
      ? differenceInYears(new Date(), new Date(certificate.patient.date_of_birth))
      : null;

    return (
      <div ref={ref} className="bg-white p-8 text-black print:p-4" style={{ width: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {organizationName || "Hospital Name"}
          </h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-xl font-bold mt-4 uppercase">
            Sick Leave Certificate
          </h2>
          <p className="text-sm mt-2">
            Certificate No: <strong>{certificate.certificate_number || "PENDING"}</strong>
          </p>
        </div>

        {/* Date */}
        <div className="text-right mb-6 text-sm">
          <p>
            Date:{" "}
            <strong>
              {certificate.issued_at 
                ? format(new Date(certificate.issued_at), "dd MMMM yyyy")
                : format(new Date(), "dd MMMM yyyy")}
            </strong>
          </p>
        </div>

        {/* To Whom It May Concern */}
        <div className="mb-6">
          <p className="font-semibold text-lg">To Whom It May Concern,</p>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            This is to certify that{" "}
            <strong className="underline">{patientName}</strong>,{" "}
            {patientAge !== null && (
              <>
                aged <strong>{patientAge} years</strong>,{" "}
              </>
            )}
            {certificate.patient?.gender && (
              <>
                <strong className="capitalize">{certificate.patient.gender}</strong>,{" "}
              </>
            )}
            bearing Hospital Registration No.{" "}
            <strong>{certificate.patient?.patient_number || "N/A"}</strong>,
            residing at{" "}
            <strong>{certificate.patient?.address || "address on record"}</strong>,
            was examined/treated at this hospital.
          </p>

          {certificate.diagnosis && (
            <p>
              The patient was diagnosed with / treated for:{" "}
              <strong>{certificate.diagnosis}</strong>
            </p>
          )}

          <p>
            Based on my medical examination, I advise that the patient requires rest and is{" "}
            <strong>unfit for duty/work</strong> for a period of{" "}
            <strong className="text-lg">{certificate.leave_days || "___"} days</strong>,
          </p>

          <div className="my-6 p-4 bg-gray-50 border rounded">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Leave Period From:</span>
                <div className="font-bold text-lg mt-1">
                  {certificate.leave_from 
                    ? format(new Date(certificate.leave_from), "dd MMMM yyyy")
                    : "_______________"}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Leave Period To:</span>
                <div className="font-bold text-lg mt-1">
                  {certificate.leave_to 
                    ? format(new Date(certificate.leave_to), "dd MMMM yyyy")
                    : "_______________"}
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-gray-600">Total Days:</span>
              <span className="ml-2 font-bold text-xl">{certificate.leave_days || "___"}</span>
            </div>
          </div>

          {certificate.recommendations && (
            <p>
              <strong>Medical Advice:</strong> {certificate.recommendations}
            </p>
          )}

          <p>
            This certificate is issued upon the request of the patient for official purposes.
          </p>
        </div>

        {/* Notes */}
        {certificate.notes && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
            <p className="font-semibold">Additional Notes:</p>
            <p className="mt-1">{certificate.notes}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-16 flex justify-end">
          <div className="text-center">
            <div className="border-t border-black pt-2 px-16">
              <p className="font-semibold">
                {certificate.doctor?.profiles?.full_name || "Attending Physician"}
              </p>
              {certificate.doctor?.specialization && (
                <p className="text-sm text-gray-600">{certificate.doctor.specialization}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Certificate issued on: {certificate.issued_at 
                ? format(new Date(certificate.issued_at), "dd MMM yyyy 'at' HH:mm")
                : "PENDING"}</p>
              <p>Print Count: {certificate.print_count}</p>
            </div>
            <div className="text-right">
              <p>Verified by: Hospital Records</p>
            </div>
          </div>
          <p className="mt-4 text-center">
            This certificate is issued for official purposes only. Any alteration or misuse
            of this document is punishable under law.
          </p>
        </div>
      </div>
    );
  }
);

PrintableSickLeaveCertificate.displayName = "PrintableSickLeaveCertificate";
