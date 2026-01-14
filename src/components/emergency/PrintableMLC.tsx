import { forwardRef } from "react";
import { EmergencyRegistration, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { format } from "date-fns";

interface PrintableMLCProps {
  registration: EmergencyRegistration;
  organizationName?: string;
  branchName?: string;
  doctorName?: string;
}

export const PrintableMLC = forwardRef<HTMLDivElement, PrintableMLCProps>(
  ({ registration, organizationName = "Hospital", branchName, doctorName }, ref) => {
    const patientName = registration.patient
      ? `${registration.patient.first_name} ${registration.patient.last_name}`
      : "Unknown Patient";

    const patientAge = registration.patient?.date_of_birth
      ? new Date().getFullYear() - new Date(registration.patient.date_of_birth).getFullYear()
      : "Unknown";

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "Times New Roman, serif" }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">{organizationName}</h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-xl font-bold mt-3 bg-red-600 text-white py-2">
            MEDICO-LEGAL CASE REPORT
          </h2>
          <p className="text-sm mt-2">Confidential Document - For Official Use Only</p>
        </div>

        {/* Case Information */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">CASE INFORMATION</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">ER Number:</td>
                <td className="w-1/4 py-1">{registration.er_number}</td>
                <td className="w-1/4 py-1 font-semibold">MLC Number:</td>
                <td className="w-1/4 py-1">{registration.er_number}-MLC</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Date & Time of Arrival:</td>
                <td className="py-1" colSpan={3}>
                  {format(new Date(registration.arrival_time), "dd/MM/yyyy 'at' HH:mm:ss")}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Mode of Arrival:</td>
                <td className="py-1" colSpan={3}>
                  {registration.arrival_mode?.replace("_", " ").toUpperCase() || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">PATIENT INFORMATION</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">Patient Name:</td>
                <td className="w-1/4 py-1">{patientName}</td>
                <td className="w-1/4 py-1 font-semibold">MRN:</td>
                <td className="w-1/4 py-1">{registration.patient?.patient_number || "Not Registered"}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Age:</td>
                <td className="py-1">{patientAge} years</td>
                <td className="py-1 font-semibold">Gender:</td>
                <td className="py-1">{registration.patient?.gender || "Unknown"}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Address:</td>
                <td className="py-1" colSpan={3}>{registration.patient?.address || "Not available"}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Phone:</td>
                <td className="py-1">{registration.patient?.phone || "N/A"}</td>
                <td className="py-1 font-semibold">CNIC:</td>
                <td className="py-1">{registration.patient?.cnic || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Brought By Information */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">BROUGHT BY / INFORMANT</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">Name:</td>
                <td className="w-1/4 py-1">{registration.brought_by_name || "Unknown"}</td>
                <td className="w-1/4 py-1 font-semibold">Relation:</td>
                <td className="w-1/4 py-1">{registration.brought_by_relation || "Unknown"}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Phone:</td>
                <td className="py-1" colSpan={3}>{registration.brought_by_phone || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Police Information */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">POLICE INFORMATION</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">FIR Number:</td>
                <td className="w-1/4 py-1">{registration.fir_number || "Pending"}</td>
                <td className="w-1/4 py-1 font-semibold">Police Station:</td>
                <td className="w-1/4 py-1">{registration.police_station || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Incident Details */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">INCIDENT DETAILS</h3>
          <div className="border border-gray-300 p-3 min-h-[100px]">
            <p className="font-semibold mb-1">Mechanism of Injury / History:</p>
            <p>{registration.mechanism_of_injury || "Not documented"}</p>
          </div>
        </div>

        {/* Clinical Findings */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">CLINICAL FINDINGS ON EXAMINATION</h3>
          <div className="border border-gray-300 p-3 min-h-[80px]">
            <p className="font-semibold mb-1">Chief Complaint:</p>
            <p>{registration.chief_complaint || "Not documented"}</p>
          </div>
          
          <div className="border border-gray-300 border-t-0 p-3">
            <p className="font-semibold mb-1">Vitals on Arrival:</p>
            {registration.vitals ? (
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td>BP: {(registration.vitals as any).bp_systolic}/{(registration.vitals as any).bp_diastolic} mmHg</td>
                    <td>HR: {(registration.vitals as any).heart_rate} bpm</td>
                    <td>Temp: {(registration.vitals as any).temperature}°F</td>
                    <td>SpO2: {(registration.vitals as any).spo2}%</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>Not recorded</p>
            )}
          </div>

          <div className="border border-gray-300 border-t-0 p-3 min-h-[120px]">
            <p className="font-semibold mb-1">Description of Injuries (Type, Site, Size, Nature):</p>
            <p className="text-gray-500 italic">To be documented by examining physician</p>
          </div>
        </div>

        {/* Triage Level */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">TRIAGE ASSESSMENT</h3>
          <div className="border border-gray-300 p-3">
            <p>
              <span className="font-semibold">Triage Level: </span>
              {registration.triage_level ? (
                <>Level {registration.triage_level} - {TRIAGE_LEVELS.find(t => t.level === registration.triage_level)?.name}</>
              ) : (
                "Not triaged"
              )}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Is Trauma Case: </span>
              {registration.is_trauma ? "YES" : "NO"}
            </p>
          </div>
        </div>

        {/* Treatment Timeline */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">TREATMENT GIVEN</h3>
          <div className="border border-gray-300 p-3 min-h-[100px]">
            <p className="text-gray-500 italic">To be documented by treating physician</p>
          </div>
        </div>

        {/* Disposition */}
        <div className="mb-6">
          <h3 className="font-bold bg-gray-200 px-2 py-1 mb-3">DISPOSITION</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> Discharged
                </td>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> Admitted (Ward: _________)
                </td>
              </tr>
              <tr>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> Referred to: ___________
                </td>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> Brought Dead
                </td>
              </tr>
              <tr>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> LAMA/DAMA
                </td>
                <td className="py-1">
                  <input type="checkbox" className="mr-2" /> Expired
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-16 border-b border-black mb-2"></div>
            <p className="font-semibold">Examining Doctor</p>
            <p className="text-sm">{doctorName || "(Name & Signature)"}</p>
            <p className="text-sm">Date: ____________</p>
          </div>
          <div className="text-center">
            <div className="h-16 border-b border-black mb-2"></div>
            <p className="font-semibold">Police Officer</p>
            <p className="text-sm">(Name, Rank & Signature)</p>
            <p className="text-sm">Badge #: ____________</p>
          </div>
          <div className="text-center">
            <div className="h-16 border-b border-black mb-2"></div>
            <p className="font-semibold">Witness</p>
            <p className="text-sm">(Name & Signature)</p>
            <p className="text-sm">CNIC: ____________</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
          <p>This is a legal document. Any false information is punishable under law.</p>
          <p>Generated on: {format(new Date(), "dd/MM/yyyy 'at' HH:mm:ss")}</p>
        </div>
      </div>
    );
  }
);

PrintableMLC.displayName = "PrintableMLC";
