import { forwardRef } from "react";
import { format } from "date-fns";
import { formatCurrency as formatCurrencyDefault } from "@/lib/currency";

interface AdmissionSlipPrintProps {
  admission: {
    admission_number: string;
    admission_date: string;
    admission_time?: string;
    admission_type?: string;
    deposit_amount?: number;
    payment_mode?: string;
    expected_discharge_date?: string;
    patient?: {
      first_name: string;
      last_name: string;
      patient_number: string;
      gender?: string;
      date_of_birth?: string;
      phone?: string;
      address?: string;
    };
    ward?: {
      name: string;
      code?: string;
    };
    bed?: {
      bed_number: string;
      bed_type?: string;
    };
    attending_doctor?: {
      profile?: {
        full_name: string;
      };
    };
    chief_complaint?: string;
    diagnosis_on_admission?: string;
  };
  organizationName?: string;
  branchName?: string;
  currencySymbol?: string;
}

export const AdmissionSlipPrint = forwardRef<HTMLDivElement, AdmissionSlipPrintProps>(
  ({ admission, organizationName = "Hospital", branchName, currencySymbol }, ref) => {
    const fc = (amount: number) => currencySymbol ? `${currencySymbol} ${amount.toLocaleString()}` : formatCurrencyDefault(amount);
    const patient = admission.patient;
    const patientAge = patient?.date_of_birth
      ? Math.floor(
          (Date.now() - new Date(patient.date_of_birth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] w-[210mm] mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">{organizationName}</h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-lg font-semibold mt-2 bg-black text-white py-1">
            ADMISSION SLIP
          </h2>
        </div>

        {/* Admission Info */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p>
              <strong>Admission No:</strong> {admission.admission_number}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {format(new Date(admission.admission_date), "dd/MM/yyyy")}
            </p>
            <p>
              <strong>Time:</strong> {admission.admission_time || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p>
              <strong>Type:</strong>{" "}
              <span className="uppercase">{admission.admission_type || "Elective"}</span>
            </p>
            <p>
              <strong>Payment:</strong>{" "}
              <span className="uppercase">{admission.payment_mode || "Cash"}</span>
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="border border-black p-4 mb-6">
          <h3 className="font-bold text-lg mb-3 border-b pb-1">Patient Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Name:</strong> {patient?.first_name} {patient?.last_name}
            </p>
            <p>
              <strong>MR No:</strong> {patient?.patient_number}
            </p>
            <p>
              <strong>Gender:</strong> {patient?.gender || "N/A"}
            </p>
            <p>
              <strong>Age:</strong> {patientAge ? `${patientAge} years` : "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {patient?.phone || "N/A"}
            </p>
            <p className="col-span-2">
              <strong>Address:</strong> {patient?.address || "N/A"}
            </p>
          </div>
        </div>

        {/* Ward & Bed */}
        <div className="border border-black p-4 mb-6">
          <h3 className="font-bold text-lg mb-3 border-b pb-1">Ward & Bed Assignment</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Ward:</strong> {admission.ward?.name || "Not assigned"}
            </p>
            <p>
              <strong>Bed:</strong>{" "}
              {admission.bed?.bed_number
                ? `${admission.bed.bed_number} (${admission.bed.bed_type || "Standard"})`
                : "Not assigned"}
            </p>
            <p>
              <strong>Attending Doctor:</strong>{" "}
              Dr. {admission.attending_doctor?.profile?.full_name || "Not assigned"}
            </p>
            <p>
              <strong>Expected Discharge:</strong>{" "}
              {admission.expected_discharge_date
                ? format(new Date(admission.expected_discharge_date), "dd/MM/yyyy")
                : "TBD"}
            </p>
          </div>
        </div>

        {/* Clinical Info */}
        {(admission.chief_complaint || admission.diagnosis_on_admission) && (
          <div className="border border-black p-4 mb-6">
            <h3 className="font-bold text-lg mb-3 border-b pb-1">Clinical Information</h3>
            <div className="text-sm space-y-2">
              {admission.chief_complaint && (
                <p>
                  <strong>Chief Complaint:</strong> {admission.chief_complaint}
                </p>
              )}
              {admission.diagnosis_on_admission && (
                <p>
                  <strong>Provisional Diagnosis:</strong> {admission.diagnosis_on_admission}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Financial */}
        <div className="border border-black p-4 mb-6">
          <h3 className="font-bold text-lg mb-3 border-b pb-1">Financial Details</h3>
          <div className="text-sm">
            <p className="text-lg font-bold">
              <strong>Deposit Collected:</strong>{" "}
              {fc(admission.deposit_amount || 0)}
            </p>
          </div>
        </div>

        {/* Barcode area */}
        <div className="flex justify-center my-6">
          <div className="text-center">
            <div className="font-mono text-2xl tracking-wider border-2 border-black px-4 py-2">
              {admission.admission_number}
            </div>
            <p className="text-xs mt-1">Scan for patient details</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-black text-sm">
          <div className="flex justify-between">
            <div>
              <p className="mb-8">_______________________</p>
              <p>Patient/Attendant Signature</p>
            </div>
            <div className="text-right">
              <p className="mb-8">_______________________</p>
              <p>Admission Staff Signature</p>
            </div>
          </div>
          <p className="text-center text-xs mt-6 text-gray-500">
            Printed on: {format(new Date(), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
      </div>
    );
  }
);

AdmissionSlipPrint.displayName = "AdmissionSlipPrint";
