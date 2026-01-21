import { forwardRef } from "react";
import { format } from "date-fns";

interface WristbandPrintProps {
  admission: {
    admission_number: string;
    admission_date: string;
    patient?: {
      first_name: string;
      last_name: string;
      patient_number: string;
      gender?: string;
      date_of_birth?: string;
      blood_group?: string;
    };
    ward?: {
      name: string;
    };
    bed?: {
      bed_number: string;
    };
    attending_doctor?: {
      profile?: {
        full_name: string;
      };
    };
  };
}

export const WristbandPrint = forwardRef<HTMLDivElement, WristbandPrintProps>(
  ({ admission }, ref) => {
    const patient = admission.patient;
    const patientAge = patient?.date_of_birth
      ? Math.floor(
          (Date.now() - new Date(patient.date_of_birth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    return (
      <div ref={ref} className="p-2 bg-white text-black">
        {/* Wristband format - typically 25mm x 280mm */}
        <div className="w-[280mm] h-[25mm] border-2 border-black flex items-center px-4 gap-6 overflow-hidden">
          {/* Patient ID & Barcode */}
          <div className="flex-shrink-0 text-center">
            <div className="font-mono text-sm font-bold tracking-wide border border-black px-2 py-1">
              {admission.admission_number}
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-xs">
              MR: {patient?.patient_number} | {patient?.gender?.charAt(0) || "?"} |{" "}
              {patientAge ? `${patientAge}Y` : "Age N/A"}
              {patient?.blood_group && ` | ${patient.blood_group}`}
            </p>
          </div>

          {/* Ward/Bed */}
          <div className="flex-shrink-0 text-center border-l border-black pl-4">
            <p className="font-bold text-sm">
              {admission.ward?.name || "Ward"}
            </p>
            <p className="text-lg font-bold">
              {admission.bed?.bed_number ? `B-${admission.bed.bed_number}` : "---"}
            </p>
          </div>

          {/* Doctor */}
          <div className="flex-shrink-0 text-right border-l border-black pl-4">
            <p className="text-xs text-gray-600">Doctor</p>
            <p className="text-sm font-medium truncate max-w-[80px]">
              {admission.attending_doctor?.profile?.full_name || "N/A"}
            </p>
          </div>

          {/* Date */}
          <div className="flex-shrink-0 text-right border-l border-black pl-4">
            <p className="text-xs">Admitted</p>
            <p className="text-sm font-medium">
              {format(new Date(admission.admission_date), "dd/MM/yy")}
            </p>
          </div>
        </div>

        {/* Print 2 copies for cutting */}
        <div className="mt-2 border-t border-dashed pt-2">
          <div className="w-[280mm] h-[25mm] border-2 border-black flex items-center px-4 gap-6 overflow-hidden">
            <div className="flex-shrink-0 text-center">
              <div className="font-mono text-sm font-bold tracking-wide border border-black px-2 py-1">
                {admission.admission_number}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">
                {patient?.first_name} {patient?.last_name}
              </p>
              <p className="text-xs">
                MR: {patient?.patient_number} | {patient?.gender?.charAt(0) || "?"} |{" "}
                {patientAge ? `${patientAge}Y` : "Age N/A"}
                {patient?.blood_group && ` | ${patient.blood_group}`}
              </p>
            </div>
            <div className="flex-shrink-0 text-center border-l border-black pl-4">
              <p className="font-bold text-sm">
                {admission.ward?.name || "Ward"}
              </p>
              <p className="text-lg font-bold">
                {admission.bed?.bed_number ? `B-${admission.bed.bed_number}` : "---"}
              </p>
            </div>
            <div className="flex-shrink-0 text-right border-l border-black pl-4">
              <p className="text-xs text-gray-600">Doctor</p>
              <p className="text-sm font-medium truncate max-w-[80px]">
                {admission.attending_doctor?.profile?.full_name || "N/A"}
              </p>
            </div>
            <div className="flex-shrink-0 text-right border-l border-black pl-4">
              <p className="text-xs">Admitted</p>
              <p className="text-sm font-medium">
                {format(new Date(admission.admission_date), "dd/MM/yy")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WristbandPrint.displayName = "WristbandPrint";
