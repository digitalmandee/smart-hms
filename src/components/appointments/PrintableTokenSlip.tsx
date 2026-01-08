import { forwardRef } from 'react';
import { format } from 'date-fns';

interface Patient {
  first_name: string;
  last_name?: string | null;
  patient_number: string;
}

interface Doctor {
  profile?: {
    full_name?: string;
  };
  specialization?: string | null;
}

interface Appointment {
  token_number?: number | null;
  appointment_date: string;
  appointment_time?: string | null;
  appointment_type?: string | null;
  priority?: number | null;
}

interface Organization {
  name: string;
  address?: string | null;
  phone?: string | null;
}

interface PrintableTokenSlipProps {
  appointment: Appointment;
  patient: Patient;
  doctor?: Doctor | null;
  organization?: Organization;
}

const priorityLabels: Record<number, string> = {
  0: 'NORMAL',
  1: 'URGENT',
  2: 'EMERGENCY',
};

const formatTime = (time: string | null): string => {
  if (!time) return 'Walk-in';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const PrintableTokenSlip = forwardRef<HTMLDivElement, PrintableTokenSlipProps>(
  ({ appointment, patient, doctor, organization }, ref) => {
    const priority = appointment.priority ?? 0;
    const fullName = `${patient.first_name} ${patient.last_name || ''}`.trim();
    
    return (
      <div ref={ref} className="hidden print:block">
        {/* Token Slip - Small receipt size (80mm width typical) */}
        <div 
          className="bg-white text-black mx-auto"
          style={{ 
            width: '80mm', 
            padding: '4mm',
            fontSize: '9pt',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-2 mb-3">
            <div className="font-bold" style={{ fontSize: '12pt' }}>
              {organization?.name || 'Medical Center'}
            </div>
            {organization?.address && (
              <div style={{ fontSize: '8pt' }} className="text-gray-600">
                {organization.address}
              </div>
            )}
            {organization?.phone && (
              <div style={{ fontSize: '8pt' }} className="text-gray-600">
                Tel: {organization.phone}
              </div>
            )}
          </div>

          {/* OPD Token Title */}
          <div 
            className="text-center font-bold mb-3 py-1"
            style={{ 
              fontSize: '14pt',
              border: '2pt solid #000',
              background: '#f0f0f0'
            }}
          >
            OPD TOKEN
          </div>

          {/* Large Token Number */}
          <div 
            className="text-center py-4 mb-3"
            style={{ 
              fontSize: '48pt',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              lineHeight: '1',
              border: '1pt dashed #666'
            }}
          >
            {appointment.token_number || '-'}
          </div>

          {/* Priority Badge */}
          <div className="text-center mb-3">
            <span 
              className="inline-block px-3 py-1 font-bold"
              style={{ 
                fontSize: '10pt',
                border: '1pt solid #000',
                background: priority === 2 ? '#fee2e2' : priority === 1 ? '#fef3c7' : '#d1fae5'
              }}
            >
              {priorityLabels[priority] || 'NORMAL'}
            </span>
          </div>

          {/* Patient Details */}
          <div className="space-y-1 mb-3" style={{ fontSize: '9pt' }}>
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MR#:</span>
              <span className="font-mono font-medium">{patient.patient_number}</span>
            </div>
            {doctor && (
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">Dr. {doctor.profile?.full_name || 'N/A'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{formatTime(appointment.appointment_time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">
                {appointment.appointment_type?.replace('_', ' ') || 'OPD'}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div 
            className="text-center py-2 border-t border-dashed border-gray-400"
            style={{ fontSize: '8pt' }}
          >
            <div className="font-medium mb-1">Please wait for your number to be called</div>
            <div className="text-gray-500">Keep this slip for reference</div>
          </div>

          {/* Timestamp */}
          <div 
            className="text-center mt-2 text-gray-400"
            style={{ fontSize: '7pt' }}
          >
            Printed: {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      </div>
    );
  }
);

PrintableTokenSlip.displayName = 'PrintableTokenSlip';
