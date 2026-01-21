import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface PrintableDischargeFormProps {
  admission: any;
  summary: any;
  organization?: any;
  invoice?: {
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
    status: string;
  } | null;
}

export function PrintableDischargeForm({
  admission,
  summary,
  organization,
  invoice,
}: PrintableDischargeFormProps) {
  const patient = admission?.patient || admission?.patients;
  const today = new Date();

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const years = Math.floor(
      (today.getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return `${years} years`;
  };

  return (
    <div className="p-8 bg-white text-black print:p-4 min-h-[297mm]" id="discharge-form-print">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase">
          {organization?.name || "Hospital Name"}
        </h1>
        {organization?.address && (
          <p className="text-sm">{organization.address}</p>
        )}
        <p className="text-sm">
          {organization?.phone && `Tel: ${organization.phone}`}
          {organization?.email && ` | Email: ${organization.email}`}
        </p>
        {organization?.registration_number && (
          <p className="text-xs mt-1">Reg. No: {organization.registration_number}</p>
        )}
        <div className="mt-4 py-2 bg-gray-100 border border-gray-300">
          <h2 className="text-xl font-bold">DISCHARGE FORM</h2>
        </div>
      </div>

      {/* Patient Information Box */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Patient Information
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex">
            <span className="font-semibold w-32">Patient Name:</span>
            <span>{patient?.first_name} {patient?.last_name}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">MR No:</span>
            <span>{patient?.patient_number}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Age / Gender:</span>
            <span>{calculateAge(patient?.date_of_birth)} / {patient?.gender}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Admission No:</span>
            <span>{admission?.admission_number}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Contact:</span>
            <span>{patient?.phone || "N/A"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Ward / Bed:</span>
            <span>{admission?.ward?.name || admission?.wards?.name} / Bed {admission?.bed?.bed_number || admission?.beds?.bed_number || "N/A"}</span>
          </div>
          <div className="flex col-span-2">
            <span className="font-semibold w-32">Address:</span>
            <span>{patient?.address || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Admission Details Box */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Admission Details
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex">
            <span className="font-semibold w-40">Date of Admission:</span>
            <span>{format(new Date(admission?.admission_date), "dd/MM/yyyy")}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Time of Admission:</span>
            <span>{admission?.admission_time || "N/A"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Date of Discharge:</span>
            <span>
              {admission?.actual_discharge_date
                ? format(new Date(admission.actual_discharge_date), "dd/MM/yyyy")
                : format(today, "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Time of Discharge:</span>
            <span>{admission?.discharge_time || format(today, "HH:mm")}</span>
          </div>
          <div className="flex col-span-2">
            <span className="font-semibold w-40">Attending Doctor:</span>
            <span>
              Dr. {admission?.attending_doctor?.profiles?.full_name || 
                   admission?.attending_doctor?.profile?.full_name || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnosis Box */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Diagnosis
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Admission Diagnosis:</p>
            <p className="mt-1 min-h-[40px] border-b border-dashed border-gray-300 pb-1">
              {summary?.admission_diagnosis || admission?.diagnosis_on_admission || "________________"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Discharge Diagnosis:</p>
            <p className="mt-1 min-h-[40px] border-b border-dashed border-gray-300 pb-1">
              {summary?.discharge_diagnosis || admission?.discharge_diagnosis || "________________"}
            </p>
          </div>
        </div>
      </div>

      {/* Condition Box */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Condition
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Condition at Admission:</p>
            <p className="mt-1">{summary?.condition_at_admission || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold">Condition at Discharge:</p>
            <p className="mt-1">{summary?.condition_at_discharge || admission?.condition_at_discharge || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Billing Summary Box */}
      {invoice && (
        <div className="border border-gray-400 p-4 mb-6">
          <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
            Billing Summary
          </h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold">Invoice No:</p>
              <p>{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="font-semibold">Total Amount:</p>
              <p>Rs. {invoice.total_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Amount Paid:</p>
              <p>Rs. {invoice.paid_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Balance:</p>
              <p className={invoice.total_amount - invoice.paid_amount > 0 ? "text-red-600 font-bold" : ""}>
                Rs. {(invoice.total_amount - invoice.paid_amount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Instructions Box */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Follow-up Instructions
        </h3>
        <div className="text-sm space-y-2">
          <p>{summary?.follow_up_instructions || admission?.follow_up_instructions || "As advised by the doctor."}</p>
          {(summary?.follow_up_appointments?.[0]?.date || admission?.follow_up_date) && (
            <p className="font-semibold">
              Next Appointment: {format(
                new Date(summary?.follow_up_appointments?.[0]?.date || admission?.follow_up_date),
                "dd/MM/yyyy"
              )}
            </p>
          )}
        </div>
      </div>

      {/* Patient Belongings Checklist */}
      <div className="border border-gray-400 p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 uppercase bg-gray-100 -m-4 mb-3 p-2 border-b">
          Patient Belongings & Documents Returned
        </h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>Original Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>Lab Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>X-Ray / Imaging CDs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>Personal Belongings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>Valuables</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-400"></div>
            <span>Medicines</span>
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="mt-8">
        <h3 className="font-bold text-sm mb-4 uppercase border-b border-gray-400 pb-2">
          Authorization & Signatures
        </h3>
        <div className="grid grid-cols-4 gap-4 mt-12 text-sm">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="font-semibold">Billing / Cashier</p>
              <p className="text-xs text-gray-600 mt-1">Date: ___________</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="font-semibold">Nursing In-Charge</p>
              <p className="text-xs text-gray-600 mt-1">Date: ___________</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="font-semibold">Attending Doctor</p>
              <p className="text-xs text-gray-600 mt-1">
                Dr. {admission?.attending_doctor?.profiles?.full_name || 
                     admission?.attending_doctor?.profile?.full_name || "___________"}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="font-semibold">Patient / Attendant</p>
              <p className="text-xs text-gray-600 mt-1">Date: ___________</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="mt-8 p-4 border border-gray-400 text-xs">
        <p className="font-semibold mb-2">Patient / Attendant Acknowledgment:</p>
        <p>
          I hereby acknowledge that I have received all the belongings, documents, and reports of the patient. 
          The discharge instructions and follow-up care have been explained to me, and I understand them clearly. 
          I am taking the patient at my own risk and will follow the prescribed treatment plan.
        </p>
        <div className="mt-4 flex justify-between">
          <span>Name: _______________________________</span>
          <span>Relation: _______________</span>
          <span>Signature: _______________</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t pt-2">
        <p>
          Generated on {format(today, "dd/MM/yyyy HH:mm")} | This is a computer-generated document
        </p>
      </div>
    </div>
  );
}
