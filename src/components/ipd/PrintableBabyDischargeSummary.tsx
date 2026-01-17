import React from "react";
import { format } from "date-fns";

interface BabyDischargeSummaryProps {
  birthRecord: {
    certificate_number?: string;
    birth_date: string;
    birth_time: string;
    gender?: string;
    delivery_type?: string;
    birth_weight_grams?: number;
    birth_length_cm?: number;
    head_circumference_cm?: number;
    chest_circumference_cm?: number;
    apgar_1min?: number;
    apgar_5min?: number;
    apgar_10min?: number;
    condition_at_birth?: string;
    resuscitation_required?: boolean;
    nicu_admission?: boolean;
    bcg_given?: boolean;
    opv0_given?: boolean;
    hep_b_given?: boolean;
    vitamin_k_given?: boolean;
    notes?: string;
  };
  baby?: {
    first_name: string;
    last_name?: string;
    patient_number: string;
  };
  mother: {
    first_name: string;
    last_name?: string;
    patient_number: string;
  };
  father?: {
    name?: string;
  };
  doctor?: {
    name: string;
    qualification?: string;
  };
  organization: {
    name: string;
    address?: string;
    phone?: string;
    logo_url?: string;
  };
  dischargeDate?: string;
  dischargeTime?: string;
  followUpDate?: string;
  feedingStatus?: string;
  newbornScreening?: string;
}

export function PrintableBabyDischargeSummary({
  birthRecord,
  baby,
  mother,
  father,
  doctor,
  organization,
  dischargeDate,
  dischargeTime,
  followUpDate,
  feedingStatus,
  newbornScreening,
}: BabyDischargeSummaryProps) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{organization.name}</h1>
        {organization.address && (
          <p className="text-sm text-gray-600">{organization.address}</p>
        )}
        {organization.phone && (
          <p className="text-sm text-gray-600">Tel: {organization.phone}</p>
        )}
        <h2 className="text-xl font-semibold mt-4 text-gray-700">
          NEWBORN DISCHARGE SUMMARY
        </h2>
      </div>

      {/* Baby Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Baby Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Baby Name:</span>
            <span className="ml-2 font-medium">
              {baby ? `${baby.first_name} ${baby.last_name || ''}` : `Baby of ${mother.first_name}`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Baby MR#:</span>
            <span className="ml-2 font-medium">{baby?.patient_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium capitalize">{birthRecord.gender || 'Not recorded'}</span>
          </div>
          <div>
            <span className="text-gray-600">Birth Certificate#:</span>
            <span className="ml-2 font-medium">{birthRecord.certificate_number || 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* Birth Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Birth Details</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Date of Birth:</span>
            <span className="ml-2 font-medium">
              {format(new Date(birthRecord.birth_date), 'MMMM dd, yyyy')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Time of Birth:</span>
            <span className="ml-2 font-medium">{birthRecord.birth_time}</span>
          </div>
          <div>
            <span className="text-gray-600">Delivery Type:</span>
            <span className="ml-2 font-medium capitalize">
              {birthRecord.delivery_type?.replace('_', ' ') || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Measurements at Birth</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-gray-600 text-xs">Birth Weight</p>
            <p className="text-lg font-bold">
              {birthRecord.birth_weight_grams ? `${birthRecord.birth_weight_grams}g` : '-'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-gray-600 text-xs">Length</p>
            <p className="text-lg font-bold">
              {birthRecord.birth_length_cm ? `${birthRecord.birth_length_cm}cm` : '-'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-gray-600 text-xs">Head Circumference</p>
            <p className="text-lg font-bold">
              {birthRecord.head_circumference_cm ? `${birthRecord.head_circumference_cm}cm` : '-'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-gray-600 text-xs">Chest Circumference</p>
            <p className="text-lg font-bold">
              {birthRecord.chest_circumference_cm ? `${birthRecord.chest_circumference_cm}cm` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* APGAR Scores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">APGAR Scores</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-gray-600 text-xs">1 Minute</p>
            <p className="text-2xl font-bold text-blue-600">
              {birthRecord.apgar_1min ?? '-'}<span className="text-sm font-normal">/10</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-gray-600 text-xs">5 Minutes</p>
            <p className="text-2xl font-bold text-blue-600">
              {birthRecord.apgar_5min ?? '-'}<span className="text-sm font-normal">/10</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-gray-600 text-xs">10 Minutes</p>
            <p className="text-2xl font-bold text-blue-600">
              {birthRecord.apgar_10min ?? '-'}<span className="text-sm font-normal">/10</span>
            </p>
          </div>
        </div>
      </div>

      {/* Vaccinations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Vaccinations Given at Birth</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className={`p-3 rounded text-center ${birthRecord.bcg_given ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="font-medium">BCG</p>
            <p className={birthRecord.bcg_given ? 'text-green-600' : 'text-gray-400'}>
              {birthRecord.bcg_given ? '✓ Given' : '✗ Not Given'}
            </p>
          </div>
          <div className={`p-3 rounded text-center ${birthRecord.opv0_given ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="font-medium">OPV-0</p>
            <p className={birthRecord.opv0_given ? 'text-green-600' : 'text-gray-400'}>
              {birthRecord.opv0_given ? '✓ Given' : '✗ Not Given'}
            </p>
          </div>
          <div className={`p-3 rounded text-center ${birthRecord.hep_b_given ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="font-medium">Hepatitis B</p>
            <p className={birthRecord.hep_b_given ? 'text-green-600' : 'text-gray-400'}>
              {birthRecord.hep_b_given ? '✓ Given' : '✗ Not Given'}
            </p>
          </div>
          <div className={`p-3 rounded text-center ${birthRecord.vitamin_k_given ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="font-medium">Vitamin K</p>
            <p className={birthRecord.vitamin_k_given ? 'text-green-600' : 'text-gray-400'}>
              {birthRecord.vitamin_k_given ? '✓ Given' : '✗ Not Given'}
            </p>
          </div>
        </div>
      </div>

      {/* Condition & Feeding */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Condition</h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="text-gray-600">Condition at Birth:</span>
              <span className="ml-2">{birthRecord.condition_at_birth || 'Good'}</span>
            </p>
            <p>
              <span className="text-gray-600">Resuscitation:</span>
              <span className="ml-2">{birthRecord.resuscitation_required ? 'Required' : 'Not Required'}</span>
            </p>
            <p>
              <span className="text-gray-600">NICU Admission:</span>
              <span className="ml-2">{birthRecord.nicu_admission ? 'Yes' : 'No'}</span>
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Feeding Status</h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="text-gray-600">Feeding:</span>
              <span className="ml-2">{feedingStatus || 'Breastfeeding initiated'}</span>
            </p>
            <p>
              <span className="text-gray-600">Newborn Screening:</span>
              <span className="ml-2">{newbornScreening || 'Completed / Pending'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Parents Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Parents Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Mother:</span>
            <span className="ml-2 font-medium">
              {mother.first_name} {mother.last_name || ''} ({mother.patient_number})
            </span>
          </div>
          {father?.name && (
            <div>
              <span className="text-gray-600">Father:</span>
              <span className="ml-2 font-medium">{father.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discharge Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Discharge Details</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Discharge Date:</span>
            <span className="ml-2 font-medium">
              {dischargeDate ? format(new Date(dischargeDate), 'MMMM dd, yyyy') : '_____________'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Discharge Time:</span>
            <span className="ml-2 font-medium">{dischargeTime || '_____________'}</span>
          </div>
          <div>
            <span className="text-gray-600">Follow-up Date:</span>
            <span className="ml-2 font-medium">
              {followUpDate ? format(new Date(followUpDate), 'MMMM dd, yyyy') : '_____________'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Signs */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-lg font-semibold text-red-700 mb-3">⚠️ Warning Signs - Seek Immediate Medical Attention If:</h3>
        <ul className="text-sm text-red-600 grid grid-cols-2 gap-2">
          <li>• Baby not feeding well or refusing feeds</li>
          <li>• Baby is lethargic or difficult to wake</li>
          <li>• High fever (&gt;38°C) or very low temperature</li>
          <li>• Yellow color of skin or eyes (jaundice)</li>
          <li>• Breathing problems or fast breathing</li>
          <li>• Blue or gray skin color</li>
          <li>• Repeated vomiting or diarrhea</li>
          <li>• Umbilical cord redness, discharge, or smell</li>
        </ul>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-4 border-t">
        <div className="flex justify-between items-end">
          <div className="text-sm">
            <p className="text-gray-600">Discharged By:</p>
            <p className="font-medium">{doctor?.name || '_________________________'}</p>
            {doctor?.qualification && <p className="text-xs text-gray-500">{doctor.qualification}</p>}
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-48 mb-2"></div>
            <p className="text-sm text-gray-600">Signature & Stamp</p>
          </div>
          <div className="text-sm text-right">
            <p className="text-gray-600">Date:</p>
            <p className="font-medium">{format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
