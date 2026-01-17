import React, { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { BirthRecord } from "@/hooks/useBirthRecords";

interface PrintableBirthCertificateProps {
  birthRecord: BirthRecord;
  organizationName?: string;
  branchName?: string;
}

export const PrintableBirthCertificate = forwardRef<HTMLDivElement, PrintableBirthCertificateProps>(
  ({ birthRecord, organizationName, branchName }, ref) => {
    const motherName = birthRecord.mother 
      ? `${birthRecord.mother.first_name} ${birthRecord.mother.last_name}` 
      : "N/A";
    
    const motherAge = birthRecord.mother?.date_of_birth
      ? differenceInYears(new Date(), new Date(birthRecord.mother.date_of_birth))
      : null;

    return (
      <div ref={ref} className="bg-white p-8 text-black print:p-4" style={{ width: "210mm", minHeight: "297mm" }}>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {organizationName || "Hospital Name"}
          </h1>
          {branchName && <p className="text-sm">{branchName}</p>}
          <h2 className="text-xl font-bold mt-4 uppercase border-2 border-black inline-block px-8 py-2">
            Birth Certificate
          </h2>
          <p className="text-sm mt-2">
            Certificate No: <strong>{birthRecord.certificate_number || "PENDING"}</strong>
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-sm">
          {/* Baby Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Child Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Name of Child:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.baby 
                    ? `${birthRecord.baby.first_name} ${birthRecord.baby.last_name}`
                    : "Baby of " + motherName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <span className="ml-2 font-semibold capitalize">{birthRecord.gender || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <span className="ml-2 font-semibold">
                  {format(new Date(birthRecord.birth_date), "dd MMMM yyyy")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Time of Birth:</span>
                <span className="ml-2 font-semibold">{birthRecord.birth_time}</span>
              </div>
              <div>
                <span className="text-gray-600">Place of Birth:</span>
                <span className="ml-2 font-semibold capitalize">
                  {birthRecord.place_of_birth || "Hospital"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Birth Weight:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.birth_weight_grams 
                    ? `${(birthRecord.birth_weight_grams / 1000).toFixed(2)} kg` 
                    : "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* Mother Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Mother's Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Mother's Name:</span>
                <span className="ml-2 font-semibold">{motherName}</span>
              </div>
              <div>
                <span className="text-gray-600">Mother's Age:</span>
                <span className="ml-2 font-semibold">{motherAge ? `${motherAge} years` : "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Mother's Address:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.mother?.address || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Hospital Registration No:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.mother?.patient_number || "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* Father Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Father's Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Father's Name:</span>
                <span className="ml-2 font-semibold">{birthRecord.father_name || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-600">Father's CNIC:</span>
                <span className="ml-2 font-semibold">{birthRecord.father_cnic || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-600">Father's Occupation:</span>
                <span className="ml-2 font-semibold">{birthRecord.father_occupation || "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Father's Address:</span>
                <span className="ml-2 font-semibold">{birthRecord.father_address || "N/A"}</span>
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Delivery Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Type of Delivery:</span>
                <span className="ml-2 font-semibold capitalize">
                  {birthRecord.delivery_type?.replace('_', ' ') || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Delivered By:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.doctor?.profiles?.full_name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Birth Length:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.birth_length_cm ? `${birthRecord.birth_length_cm} cm` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Head Circumference:</span>
                <span className="ml-2 font-semibold">
                  {birthRecord.head_circumference_cm ? `${birthRecord.head_circumference_cm} cm` : "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* APGAR Scores */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              APGAR Scores
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{birthRecord.apgar_1min ?? "-"}</div>
                <div className="text-xs text-gray-600">1 Minute</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{birthRecord.apgar_5min ?? "-"}</div>
                <div className="text-xs text-gray-600">5 Minutes</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{birthRecord.apgar_10min ?? "-"}</div>
                <div className="text-xs text-gray-600">10 Minutes</div>
              </div>
            </div>
          </section>

          {/* Vaccinations */}
          <section>
            <h3 className="font-bold text-base border-b border-gray-400 pb-1 mb-3">
              Vaccinations Given at Birth
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border ${birthRecord.bcg_given ? 'bg-green-500' : 'bg-white'}`}></div>
                <span>BCG</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border ${birthRecord.opv0_given ? 'bg-green-500' : 'bg-white'}`}></div>
                <span>OPV-0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border ${birthRecord.hep_b_given ? 'bg-green-500' : 'bg-white'}`}></div>
                <span>Hepatitis B</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border ${birthRecord.vitamin_k_given ? 'bg-green-500' : 'bg-white'}`}></div>
                <span>Vitamin K</span>
              </div>
            </div>
          </section>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 mx-8">
              <p className="font-semibold">Attending Physician</p>
              <p className="text-sm text-gray-600">
                {birthRecord.doctor?.profiles?.full_name || "________________"}
              </p>
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
            {birthRecord.certificate_issued_at 
              ? format(new Date(birthRecord.certificate_issued_at), "dd MMM yyyy 'at' HH:mm")
              : "PENDING"}
          </p>
          <p className="mt-2">
            This is a computer-generated certificate. Valid only with hospital seal and authorized signature.
          </p>
        </div>
      </div>
    );
  }
);

PrintableBirthCertificate.displayName = "PrintableBirthCertificate";
