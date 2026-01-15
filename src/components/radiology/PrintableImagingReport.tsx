import { forwardRef } from 'react';
import { ImagingOrderWithRelations, ImagingResult, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { format } from 'date-fns';

interface PrintableImagingReportProps {
  order: ImagingOrderWithRelations;
  result: ImagingResult;
  organization?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

export const PrintableImagingReport = forwardRef<HTMLDivElement, PrintableImagingReportProps>(
  ({ order, result, organization }, ref) => {
    const modalityLabel = IMAGING_MODALITIES.find(m => m.value === order.modality)?.label || order.modality;
    
    const patientName = order.patient 
      ? `${order.patient.first_name} ${order.patient.last_name}` 
      : 'Unknown';

    const patientAge = order.patient?.date_of_birth
      ? `${Math.floor((new Date().getTime() - new Date(order.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
      : '';

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4" style={{ fontFamily: 'serif' }}>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          {organization?.logo_url && (
            <img src={organization.logo_url} alt="Logo" className="h-16 mx-auto mb-2" />
          )}
          <h1 className="text-2xl font-bold">{organization?.name || 'Hospital Name'}</h1>
          {organization?.address && <p className="text-sm">{organization.address}</p>}
          {(organization?.phone || organization?.email) && (
            <p className="text-sm">
              {organization.phone && `Tel: ${organization.phone}`}
              {organization.phone && organization.email && ' | '}
              {organization.email && `Email: ${organization.email}`}
            </p>
          )}
          <h2 className="text-xl font-bold mt-4">{modalityLabel} REPORT</h2>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-b pb-4">
          <div>
            <p><strong>Patient Name:</strong> {patientName}</p>
            <p><strong>Patient ID:</strong> {order.patient?.patient_number || 'N/A'}</p>
            <p><strong>Age/Gender:</strong> {patientAge} / {order.patient?.gender || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p><strong>Order No:</strong> {order.order_number}</p>
            <p><strong>Study Date:</strong> {order.performed_at ? format(new Date(order.performed_at), 'dd/MM/yyyy') : 'N/A'}</p>
            <p><strong>Report Date:</strong> {order.reported_at ? format(new Date(order.reported_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
        </div>

        {/* Study Details */}
        <div className="mb-6">
          <h3 className="font-bold text-lg border-b mb-2">STUDY DETAILS</h3>
          <p><strong>Examination:</strong> {order.procedure_name}</p>
          {result.technique && <p><strong>Technique:</strong> {result.technique}</p>}
          {order.clinical_indication && (
            <p><strong>Clinical Indication:</strong> {order.clinical_indication}</p>
          )}
          {result.comparison && <p><strong>Comparison:</strong> {result.comparison}</p>}
        </div>

        {/* Findings */}
        <div className="mb-6">
          <h3 className="font-bold text-lg border-b mb-2">FINDINGS</h3>
          <div className="whitespace-pre-wrap">{result.findings || 'No findings recorded.'}</div>
        </div>

        {/* Impression */}
        <div className="mb-6">
          <h3 className="font-bold text-lg border-b mb-2">IMPRESSION</h3>
          <div className="whitespace-pre-wrap font-semibold">
            {result.impression || 'No impression recorded.'}
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations && (
          <div className="mb-6">
            <h3 className="font-bold text-lg border-b mb-2">RECOMMENDATIONS</h3>
            <div className="whitespace-pre-wrap">{result.recommendations}</div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between">
            <div>
              {order.technician && (
                <div className="text-sm">
                  <p><strong>Technician:</strong> {order.technician.full_name}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              {order.radiologist?.employee && (
                <div>
                  <p className="font-bold">
                    Dr. {order.radiologist.employee.first_name} {order.radiologist.employee.last_name}
                  </p>
                  <p className="text-sm">Radiologist</p>
                  {order.verified_at && (
                    <p className="text-xs text-gray-600">
                      Verified: {format(new Date(order.verified_at), 'dd/MM/yyyy h:mm a')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>This report is electronically generated and is valid without signature.</p>
          <p>Printed on: {format(new Date(), 'dd/MM/yyyy h:mm a')}</p>
        </div>
      </div>
    );
  }
);

PrintableImagingReport.displayName = 'PrintableImagingReport';
