import React, { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { DeathRecord } from "@/hooks/useDeathRecords";

interface PrintableDeathCertificateProps {
  deathRecord: DeathRecord;
  organizationName?: string;
  branchName?: string;
}

export const PrintableDeathCertificate = forwardRef<HTMLDivElement, PrintableDeathCertificateProps>(
  ({ deathRecord, organizationName, branchName }, ref) => {
    const patientName = deathRecord.patient 
      ? `${deathRecord.patient.first_name} ${deathRecord.patient.last_name}` 
      : "N/A";
    
    const patientAge = deathRecord.patient?.date_of_birth
      ? differenceInYears(new Date(deathRecord.death_date), new Date(deathRecord.patient.date_of_birth))
      : null;

    return (
      <div ref={ref} className="bg-white p-8 text-black print:p-4" style={{ width: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {organizationName || "Hospital Name"}
          </h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-xl font-bold mt-4 uppercase border-2 border-black inline-block px-8 py-2 bg-gray-100">
            Medical Certificate of Death
          </h2>
          <p className="text-sm mt-2">
            Certificate No: <strong>{deathRecord.certificate_number || "PENDING"}</strong>
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-sm">
          {/* Deceased Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Particulars of the Deceased
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-semibold">{patientName}</span>
              </div>
              <div>
                <span className="text-gray-600">Hospital Reg. No:</span>
                <span className="ml-2 font-semibold">
                  {deathRecord.patient?.patient_number || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Age at Death:</span>
                <span className="ml-2 font-semibold">
                  {patientAge !== null ? `${patientAge} years` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <span className="ml-2 font-semibold capitalize">
                  {deathRecord.patient?.gender || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <span className="ml-2 font-semibold">
                  {deathRecord.patient?.date_of_birth 
                    ? format(new Date(deathRecord.patient.date_of_birth), "dd MMM yyyy")
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Blood Group:</span>
                <span className="ml-2 font-semibold">
                  {deathRecord.patient?.blood_group || "N/A"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-semibold">
                  {deathRecord.patient?.address || "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* Death Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Particulars of Death
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Date of Death:</span>
                <span className="ml-2 font-semibold">
                  {format(new Date(deathRecord.death_date), "dd MMMM yyyy")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Time of Death:</span>
                <span className="ml-2 font-semibold">{deathRecord.death_time}</span>
              </div>
              <div>
                <span className="text-gray-600">Place of Death:</span>
                <span className="ml-2 font-semibold capitalize">
                  {deathRecord.place_of_death || "Hospital"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Manner of Death:</span>
                <span className="ml-2 font-semibold capitalize">
                  {deathRecord.manner_of_death || "Natural"}
                </span>
              </div>
              {deathRecord.is_mlc && (
                <div className="col-span-2">
                  <span className="text-gray-600">MLC Number:</span>
                  <span className="ml-2 font-semibold text-red-600">
                    {deathRecord.mlc_number || "Yes - Pending Number"}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Cause of Death - ICD-10 Format */}
          <section className="border-2 border-black p-4">
            <h3 className="font-bold text-base mb-4 text-center uppercase">
              Cause of Death
            </h3>
            
            <div className="mb-4">
              <p className="font-semibold mb-2">Part I - Disease or condition directly leading to death:</p>
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 w-8 font-semibold">(a)</td>
                    <td className="py-2 border-l pl-4">
                      <span className="text-gray-600">Immediate cause:</span>
                      <div className="font-semibold mt-1">{deathRecord.immediate_cause || "_______________"}</div>
                    </td>
                    <td className="py-2 border-l pl-4 w-32">
                      <span className="text-gray-600 text-xs">Interval:</span>
                      <div className="font-semibold">{deathRecord.immediate_cause_interval || "___"}</div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-semibold">(b)</td>
                    <td className="py-2 border-l pl-4">
                      <span className="text-gray-600">Antecedent cause (due to):</span>
                      <div className="font-semibold mt-1">{deathRecord.antecedent_cause || "_______________"}</div>
                    </td>
                    <td className="py-2 border-l pl-4">
                      <span className="text-gray-600 text-xs">Interval:</span>
                      <div className="font-semibold">{deathRecord.antecedent_cause_interval || "___"}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">(c)</td>
                    <td className="py-2 border-l pl-4">
                      <span className="text-gray-600">Underlying cause (due to):</span>
                      <div className="font-semibold mt-1">{deathRecord.underlying_cause || "_______________"}</div>
                    </td>
                    <td className="py-2 border-l pl-4">
                      <span className="text-gray-600 text-xs">Interval:</span>
                      <div className="font-semibold">{deathRecord.underlying_cause_interval || "___"}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="font-semibold mb-2">Part II - Other significant conditions contributing to death:</p>
              <div className="border-t pt-2">
                {deathRecord.contributing_conditions || "None specified"}
              </div>
            </div>
          </section>

          {/* Autopsy */}
          {deathRecord.autopsy_performed && (
            <section>
              <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
                Autopsy Information
              </h3>
              <div>
                <span className="text-gray-600">Autopsy Performed:</span>
                <span className="ml-2 font-semibold">Yes</span>
              </div>
              {deathRecord.autopsy_findings && (
                <div className="mt-2">
                  <span className="text-gray-600">Findings:</span>
                  <p className="mt-1">{deathRecord.autopsy_findings}</p>
                </div>
              )}
            </section>
          )}

          {/* Body Release */}
          {deathRecord.body_released_to && (
            <section>
              <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
                Body Release Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Released To:</span>
                  <span className="ml-2 font-semibold">{deathRecord.body_released_to}</span>
                </div>
                <div>
                  <span className="text-gray-600">Relation:</span>
                  <span className="ml-2 font-semibold">{deathRecord.body_released_relation}</span>
                </div>
                <div>
                  <span className="text-gray-600">CNIC:</span>
                  <span className="ml-2 font-semibold">{deathRecord.body_released_cnic}</span>
                </div>
                <div>
                  <span className="text-gray-600">Released At:</span>
                  <span className="ml-2 font-semibold">
                    {deathRecord.body_released_at 
                      ? format(new Date(deathRecord.body_released_at), "dd MMM yyyy HH:mm")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Certification */}
        <div className="mt-8 p-4 border-2 border-black">
          <p className="text-sm">
            I hereby certify that I attended the deceased and that the particulars and cause of death
            given above are true to the best of my knowledge and belief.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 mx-8">
              <p className="font-semibold">Certifying Physician</p>
              <p className="text-sm text-gray-600">
                {deathRecord.doctor?.profiles?.full_name || "________________"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Signature, Name & Registration No.</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 mx-8">
              <p className="font-semibold">Hospital Administrator</p>
              <p className="text-sm text-gray-600">Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>
            Certificate issued on:{" "}
            {deathRecord.certificate_issued_at 
              ? format(new Date(deathRecord.certificate_issued_at), "dd MMM yyyy 'at' HH:mm")
              : "PENDING"}
          </p>
          <p className="mt-2">
            This is a medical certificate of cause of death. For legal purposes, registration with
            local municipal authorities is required.
          </p>
        </div>
      </div>
    );
  }
);

PrintableDeathCertificate.displayName = "PrintableDeathCertificate";
