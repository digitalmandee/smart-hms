import { forwardRef } from 'react';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
}

interface Organization {
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

interface PrintablePatientCardProps {
  patient: Patient;
  organization?: Organization;
}

const getAge = (dob: string | null | undefined): string => {
  if (!dob) return '-';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} yrs`;
};

export const PrintablePatientCard = forwardRef<HTMLDivElement, PrintablePatientCardProps>(
  ({ patient, organization }, ref) => {
    const fullName = `${patient.first_name} ${patient.last_name || ''}`.trim();
    const currentYear = new Date().getFullYear();
    
    return (
      <div ref={ref} className="hidden print:block">
        {/* Patient ID Card - Credit Card Size (85.6mm x 53.98mm) */}
        <div 
          className="bg-white text-black mx-auto"
          style={{ 
            width: '85.6mm', 
            height: '53.98mm',
            fontSize: '8pt',
            border: '1pt solid #000',
            borderRadius: '3mm',
            overflow: 'hidden',
            pageBreakAfter: 'always'
          }}
        >
          {/* Card Header */}
          <div 
            className="text-white px-3 py-1.5 flex items-center justify-between"
            style={{ 
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              borderBottom: '2pt solid #0d9488'
            }}
          >
            <div className="font-bold" style={{ fontSize: '10pt' }}>
              {organization?.name || 'Medical Center'}
            </div>
            <div style={{ fontSize: '7pt' }}>PATIENT ID CARD</div>
          </div>

          {/* Card Body */}
          <div className="px-3 py-2 flex gap-3" style={{ height: 'calc(100% - 24pt - 16pt)' }}>
            {/* Photo Placeholder */}
            <div 
              className="flex-shrink-0 border-2 border-gray-300 flex items-center justify-center bg-gray-50"
              style={{ 
                width: '18mm', 
                height: '22mm',
                borderRadius: '2mm'
              }}
            >
              <span className="text-gray-400" style={{ fontSize: '6pt' }}>PHOTO</span>
            </div>

            {/* Patient Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="font-bold" style={{ fontSize: '10pt', lineHeight: '1.2' }}>
                  {fullName}
                </div>
                <div 
                  className="font-mono font-bold text-teal-700"
                  style={{ fontSize: '11pt', marginTop: '2pt' }}
                >
                  MR# {patient.patient_number}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5" style={{ fontSize: '7pt' }}>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-medium capitalize">{patient.gender || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium">{getAge(patient.date_of_birth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Blood:</span>
                  <span className="font-bold text-red-600">{patient.blood_group || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{patient.phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer - Emergency Contact */}
          <div 
            className="px-3 py-1 flex items-center justify-between border-t border-gray-200"
            style={{ fontSize: '7pt', background: '#fafafa' }}
          >
            <div>
              <span className="text-gray-500">Emergency: </span>
              <span className="font-medium">
                {patient.emergency_contact_name || 'Not Set'}
                {patient.emergency_contact_relation && ` (${patient.emergency_contact_relation})`}
              </span>
              {patient.emergency_contact_phone && (
                <span className="ml-1">• {patient.emergency_contact_phone}</span>
              )}
            </div>
            <div className="text-gray-400">Valid: {currentYear}</div>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="bg-white text-black mx-auto mt-4"
          style={{ 
            width: '85.6mm', 
            height: '53.98mm',
            fontSize: '8pt',
            border: '1pt solid #000',
            borderRadius: '3mm',
            overflow: 'hidden',
            padding: '3mm'
          }}
        >
          <div className="font-bold mb-2 text-center border-b border-gray-300 pb-1" style={{ fontSize: '9pt' }}>
            IMPORTANT INFORMATION
          </div>

          <div className="space-y-2" style={{ fontSize: '7pt' }}>
            <div>
              <span className="font-medium">Blood Group: </span>
              <span className="font-bold text-red-600">{patient.blood_group || 'Unknown'}</span>
            </div>
            
            <div className="border border-gray-300 rounded p-2 bg-gray-50">
              <div className="font-medium mb-1">In case of emergency, please contact:</div>
              <div>
                {patient.emergency_contact_name || 'Contact not set'}
                {patient.emergency_contact_relation && ` (${patient.emergency_contact_relation})`}
              </div>
              {patient.emergency_contact_phone && (
                <div className="font-bold">{patient.emergency_contact_phone}</div>
              )}
            </div>
          </div>

          <div 
            className="absolute bottom-2 left-2 right-2 text-center border-t border-gray-200 pt-1"
            style={{ fontSize: '6pt', position: 'relative', marginTop: '8pt' }}
          >
            <div className="font-medium">{organization?.name || 'Medical Center'}</div>
            <div className="text-gray-500">
              {organization?.address && `${organization.address}, `}
              {organization?.city}
              {organization?.phone && ` | ${organization.phone}`}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintablePatientCard.displayName = 'PrintablePatientCard';
