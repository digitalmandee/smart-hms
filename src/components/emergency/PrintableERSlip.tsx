import { forwardRef } from "react";
import { EmergencyRegistration, TRIAGE_LEVELS } from "@/hooks/useEmergency";
import { format } from "date-fns";

interface PrintableERSlipProps {
  registration: EmergencyRegistration;
  organizationName?: string;
  branchName?: string;
}

export const PrintableERSlip = forwardRef<HTMLDivElement, PrintableERSlipProps>(
  ({ registration, organizationName = "Hospital", branchName }, ref) => {
    const triageInfo = TRIAGE_LEVELS.find(t => t.level === registration.triage_level);
    
    const patientName = registration.patient
      ? `${registration.patient.first_name} ${registration.patient.last_name}`
      : "Unknown Patient";

    const triageColorClass = triageInfo?.color
      ? {
          red: "bg-red-500",
          orange: "bg-orange-500",
          yellow: "bg-yellow-400",
          green: "bg-green-500",
          blue: "bg-blue-500",
        }[triageInfo.color]
      : "bg-gray-300";

    return (
      <div
        ref={ref}
        className="w-[400px] bg-white text-black p-6 print:p-4"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h1 className="text-xl font-bold uppercase">{organizationName}</h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <p className="text-lg font-bold mt-2 bg-red-600 text-white py-1">
            EMERGENCY DEPARTMENT
          </p>
        </div>

        {/* ER Number - Large */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold font-mono tracking-wider">
            {registration.er_number}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {format(new Date(registration.arrival_time), "dd MMM yyyy • HH:mm")}
          </div>
        </div>

        {/* Triage Band */}
        {triageInfo && (
          <div
            className={`${triageColorClass} text-white text-center py-3 mb-4 font-bold text-lg`}
          >
            TRIAGE LEVEL {triageInfo.level} - {triageInfo.name.toUpperCase()}
          </div>
        )}

        {/* Patient Info */}
        <div className="border border-gray-300 p-3 mb-4">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="font-semibold w-1/3">Patient:</td>
                <td>{patientName}</td>
              </tr>
              {registration.patient?.patient_number && (
                <tr>
                  <td className="font-semibold">MRN:</td>
                  <td>{registration.patient.patient_number}</td>
                </tr>
              )}
              {registration.patient?.gender && (
                <tr>
                  <td className="font-semibold">Gender/Age:</td>
                  <td>
                    {registration.patient.gender}
                    {registration.patient.date_of_birth && 
                      ` / ${new Date().getFullYear() - new Date(registration.patient.date_of_birth).getFullYear()} yrs`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chief Complaint */}
        {registration.chief_complaint && (
          <div className="border border-gray-300 p-3 mb-4">
            <div className="font-semibold text-sm mb-1">Chief Complaint:</div>
            <p className="text-sm">{registration.chief_complaint}</p>
          </div>
        )}

        {/* Zone Assignment */}
        {registration.assigned_zone && (
          <div className="text-center bg-gray-100 py-2 mb-4">
            <div className="text-sm text-gray-600">Assigned Zone</div>
            <div className="text-lg font-bold">{registration.assigned_zone}</div>
          </div>
        )}

        {/* Flags */}
        <div className="flex justify-center gap-4 mb-4">
          {registration.is_trauma && (
            <span className="bg-orange-500 text-white px-3 py-1 text-sm font-bold">
              TRAUMA
            </span>
          )}
          {registration.is_mlc && (
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold">
              MLC
            </span>
          )}
        </div>

        {/* Barcode placeholder */}
        <div className="text-center border-t pt-3 mt-4">
          <div className="font-mono text-xs tracking-widest">
            ||||| {registration.er_number} |||||
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-4 border-t pt-2">
          <p>Please keep this slip with you at all times</p>
          <p>Present to staff when called</p>
        </div>
      </div>
    );
  }
);

PrintableERSlip.displayName = "PrintableERSlip";
