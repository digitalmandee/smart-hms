import React, { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { MedicalCertificate } from "@/hooks/useMedicalCertificates";

interface PrintableFitnessCertificateProps {
  certificate: MedicalCertificate;
  organizationName?: string;
  branchName?: string;
}

export const PrintableFitnessCertificate = forwardRef<HTMLDivElement, PrintableFitnessCertificateProps>(
  ({ certificate, organizationName, branchName }, ref) => {
    const patientName = certificate.patient 
      ? `${certificate.patient.first_name} ${certificate.patient.last_name}` 
      : "N/A";
    
    const patientAge = certificate.patient?.date_of_birth
      ? differenceInYears(new Date(), new Date(certificate.patient.date_of_birth))
      : null;

    const getFitnessStatusText = (status: string | null) => {
      switch (status) {
        case 'fit': return 'FIT';
        case 'unfit': return 'UNFIT';
        case 'fit_with_restrictions': return 'FIT WITH RESTRICTIONS';
        case 'temporarily_unfit': return 'TEMPORARILY UNFIT';
        default: return 'PENDING';
      }
    };

    const getFitnessStatusColor = (status: string | null) => {
      switch (status) {
        case 'fit': return 'text-green-700 bg-green-100 border-green-700';
        case 'unfit': return 'text-red-700 bg-red-100 border-red-700';
        case 'fit_with_restrictions': return 'text-yellow-700 bg-yellow-100 border-yellow-700';
        case 'temporarily_unfit': return 'text-orange-700 bg-orange-100 border-orange-700';
        default: return 'text-gray-700 bg-gray-100 border-gray-700';
      }
    };

    return (
      <div ref={ref} className="bg-white p-8 text-black print:p-4" style={{ width: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {organizationName || "Hospital Name"}
          </h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-xl font-bold mt-4 uppercase">
            Medical Fitness Certificate
          </h2>
          <p className="text-sm mt-2">
            Certificate No: <strong>{certificate.certificate_number || "PENDING"}</strong>
          </p>
        </div>

        {/* Patient Details */}
        <section className="mb-6">
          <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
            Patient Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-semibold">{patientName}</span>
            </div>
            <div>
              <span className="text-gray-600">Registration No:</span>
              <span className="ml-2 font-semibold">
                {certificate.patient?.patient_number || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-semibold">
                {patientAge !== null ? `${patientAge} years` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 font-semibold capitalize">
                {certificate.patient?.gender || "N/A"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 font-semibold">
                {certificate.patient?.address || "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Examination Details */}
        <section className="mb-6">
          <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
            Examination Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Date of Examination:</span>
              <span className="ml-2 font-semibold">
                {certificate.issued_at 
                  ? format(new Date(certificate.issued_at), "dd MMM yyyy")
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Purpose:</span>
              <span className="ml-2 font-semibold">{certificate.purpose || "General Fitness"}</span>
            </div>
            {certificate.job_type && (
              <div>
                <span className="text-gray-600">Job Type:</span>
                <span className="ml-2 font-semibold">{certificate.job_type}</span>
              </div>
            )}
            {certificate.employer_name && (
              <div>
                <span className="text-gray-600">Employer:</span>
                <span className="ml-2 font-semibold">{certificate.employer_name}</span>
              </div>
            )}
          </div>
        </section>

        {/* Findings */}
        {certificate.findings && (
          <section className="mb-6">
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Clinical Findings
            </h3>
            <p className="text-sm whitespace-pre-wrap">{certificate.findings}</p>
          </section>
        )}

        {/* Fitness Status */}
        <section className="mb-6">
          <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
            Medical Opinion
          </h3>
          <div className="text-center my-6">
            <div className={`inline-block px-8 py-4 border-2 text-2xl font-bold ${getFitnessStatusColor(certificate.fitness_status)}`}>
              {getFitnessStatusText(certificate.fitness_status)}
            </div>
          </div>
          
          {certificate.restrictions && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <p className="font-semibold text-sm">Restrictions/Limitations:</p>
              <p className="text-sm mt-1">{certificate.restrictions}</p>
            </div>
          )}

          {certificate.recommendations && (
            <div className="mt-4">
              <p className="font-semibold text-sm">Recommendations:</p>
              <p className="text-sm mt-1">{certificate.recommendations}</p>
            </div>
          )}
        </section>

        {/* Validity */}
        <section className="mb-6">
          <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
            Certificate Validity
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Valid From:</span>
              <span className="ml-2 font-semibold">
                {certificate.valid_from 
                  ? format(new Date(certificate.valid_from), "dd MMM yyyy")
                  : format(new Date(certificate.issued_at || new Date()), "dd MMM yyyy")}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Valid Until:</span>
              <span className="ml-2 font-semibold">
                {certificate.valid_to 
                  ? format(new Date(certificate.valid_to), "dd MMM yyyy")
                  : "As per requirement"}
              </span>
            </div>
          </div>
        </section>

        {/* Certification */}
        <div className="mt-8 p-4 border-2 border-black text-sm">
          <p>
            This is to certify that I have personally examined the above-named individual and based on my
            clinical examination and review of available medical records, I am of the opinion that the
            individual is <strong>{getFitnessStatusText(certificate.fitness_status)}</strong> for the
            stated purpose.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div className="border-t border-black pt-2 px-16">
              <p className="font-semibold">
                {certificate.doctor?.profiles?.full_name || "Examining Physician"}
              </p>
              {certificate.doctor?.specialization && (
                <p className="text-sm text-gray-600">{certificate.doctor.specialization}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>
            Certificate issued on:{" "}
            {certificate.issued_at 
              ? format(new Date(certificate.issued_at), "dd MMM yyyy 'at' HH:mm")
              : "PENDING"}
          </p>
          <p className="mt-1">Print Count: {certificate.print_count}</p>
          <p className="mt-2">
            This certificate is valid only for the purpose mentioned above and is not transferable.
          </p>
        </div>
      </div>
    );
  }
);

PrintableFitnessCertificate.displayName = "PrintableFitnessCertificate";
