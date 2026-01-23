import { format } from "date-fns";

interface PrintableDischargeSummaryProps {
  admission: any;
  summary: any;
  organization?: any;
}

export function PrintableDischargeSummary({
  admission,
  summary,
  organization,
}: PrintableDischargeSummaryProps) {
  const patient = admission?.patients || admission?.patient;

  return (
    <div 
      className="bg-white text-black min-h-[297mm] w-[210mm] mx-auto" 
      id="discharge-summary-print"
      style={{ 
        padding: "15mm",
        fontFamily: "'Times New Roman', serif",
        fontSize: "11pt",
        lineHeight: "1.4",
      }}
    >
      {/* Professional Letterhead Header */}
      <div className="border-b-2 border-blue-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          {/* Logo placeholder */}
          <div className="w-20 h-20 border border-gray-300 flex items-center justify-center text-xs text-gray-400">
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              "LOGO"
            )}
          </div>
          
          {/* Organization Info */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-wide">
              {organization?.name || "Hospital Name"}
            </h1>
            <p className="text-sm mt-1">{organization?.address}</p>
            <p className="text-sm">
              {organization?.phone && `Tel: ${organization.phone}`}
              {organization?.email && ` | Email: ${organization.email}`}
            </p>
            {organization?.registration_number && (
              <p className="text-xs mt-1 text-gray-600">
                Reg. No: {organization.registration_number}
              </p>
            )}
          </div>
          
          {/* Empty space for symmetry */}
          <div className="w-20"></div>
        </div>
        
        {/* Document Title */}
        <div className="mt-4 py-2 bg-blue-800 text-white text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider">Discharge Summary</h2>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p>
            <span className="font-semibold">Patient Name:</span>{" "}
            {patient?.first_name} {patient?.last_name}
          </p>
          <p>
            <span className="font-semibold">Patient ID:</span> {patient?.patient_number}
          </p>
          <p>
            <span className="font-semibold">Age/Gender:</span>{" "}
            {patient?.date_of_birth
              ? `${Math.floor(
                  (new Date().getTime() - new Date(patient.date_of_birth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )} years`
              : "N/A"}{" "}
            / {patient?.gender}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {patient?.address || "N/A"}
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Admission No:</span> {admission?.admission_number}
          </p>
          <p>
            <span className="font-semibold">Admission Date:</span>{" "}
            {format(new Date(admission?.admission_date), "dd/MM/yyyy")}
          </p>
          <p>
            <span className="font-semibold">Discharge Date:</span>{" "}
            {admission?.actual_discharge_date
              ? format(new Date(admission.actual_discharge_date), "dd/MM/yyyy")
              : format(new Date(), "dd/MM/yyyy")}
          </p>
          <p>
            <span className="font-semibold">Ward/Bed:</span>{" "}
            {admission?.wards?.name} / {admission?.beds?.bed_number || "N/A"}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Diagnosis */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">DIAGNOSIS</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Admission Diagnosis:</p>
            <p className="text-gray-700 whitespace-pre-line">
              {summary?.admission_diagnosis || admission?.diagnosis_on_admission || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-medium">Discharge Diagnosis:</p>
            <p className="text-gray-700 whitespace-pre-line">
              {summary?.discharge_diagnosis || admission?.discharge_diagnosis || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">CONDITION</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">At Admission:</p>
            <p className="text-gray-700">{summary?.condition_at_admission || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium">At Discharge:</p>
            <p className="text-gray-700">
              {summary?.condition_at_discharge || admission?.condition_at_discharge || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Hospital Course */}
      {summary?.hospital_course && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">HOSPITAL COURSE</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{summary.hospital_course}</p>
        </div>
      )}

      {/* Significant Findings */}
      {summary?.significant_findings && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">SIGNIFICANT FINDINGS</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary.significant_findings}
          </p>
        </div>
      )}

      <div className="border-t border-gray-300 my-4"></div>

      {/* Medications */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">MEDICATIONS ON DISCHARGE</h3>
        {summary?.medications_on_discharge ? (
          <div className="text-sm">
            {Array.isArray(summary.medications_on_discharge) ? (
              <table className="w-full border-collapse border text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Medication</th>
                    <th className="border p-2 text-left">Dosage</th>
                    <th className="border p-2 text-left">Frequency</th>
                    <th className="border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.medications_on_discharge.map((med: any, index: number) => (
                    <tr key={index}>
                      <td className="border p-2">{med.name}</td>
                      <td className="border p-2">{med.dosage}</td>
                      <td className="border p-2">{med.frequency}</td>
                      <td className="border p-2">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">
                {summary.medications_on_discharge}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No medications prescribed</p>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">DIET INSTRUCTIONS</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary?.diet_instructions || admission?.discharge_instructions || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">ACTIVITY INSTRUCTIONS</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary?.activity_instructions || "N/A"}
          </p>
        </div>
      </div>

      {/* Warning Signs */}
      {summary?.warning_signs && (
        <div className="mb-6 p-3 border-2 border-red-300 bg-red-50 rounded">
          <h3 className="font-semibold text-lg mb-2 text-red-700">⚠️ WARNING SIGNS</h3>
          <p className="text-sm text-red-700 whitespace-pre-line">{summary.warning_signs}</p>
        </div>
      )}

      {/* Follow-up */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">FOLLOW-UP</h3>
        <p className="text-sm text-gray-700">
          {summary?.follow_up_instructions ||
            admission?.follow_up_instructions ||
            "Please follow up as advised."}
        </p>
        {(summary?.follow_up_appointments?.[0]?.date || admission?.follow_up_date) && (
          <p className="text-sm font-medium mt-2">
            Follow-up Date:{" "}
            {format(
              new Date(summary?.follow_up_appointments?.[0]?.date || admission?.follow_up_date),
              "dd/MM/yyyy"
            )}
          </p>
        )}
      </div>

      <div className="border-t border-gray-300 my-6"></div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2 mt-8">
            <p className="font-medium">Prepared By</p>
            <p className="text-gray-600">{summary?.prepared_by?.full_name || "Nurse"}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2 mt-8">
            <p className="font-medium">Attending Doctor</p>
            <p className="text-gray-600">
              Dr. {admission?.attending_doctor?.profiles?.full_name || "N/A"}
            </p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2 mt-8">
            <p className="font-medium">Patient/Attendant</p>
            <p className="text-gray-600">Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>
          Generated on {format(new Date(), "dd/MM/yyyy HH:mm")} | This is a computer-generated document
        </p>
        <p className="mt-1">
          {organization?.name} • {organization?.address}
        </p>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          #discharge-summary-print {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
