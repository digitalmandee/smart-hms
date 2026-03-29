import { forwardRef } from 'react';
import { ImagingOrderWithRelations, ImagingResult, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { format } from 'date-fns';
import { generateQRCodeUrl } from '@/lib/qrcode';

interface PrintableImagingReportProps {
  order: ImagingOrderWithRelations;
  result: ImagingResult;
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
    slug?: string;
    registration_number?: string | null;
    tax_id?: string | null;
  };
}

const styles = {
  container: {
    backgroundColor: "white",
    padding: "12mm 15mm",
    minHeight: "297mm",
    maxWidth: "210mm",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "8pt",
    lineHeight: 1.5,
    color: "#1f2937",
    position: "relative" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #1e40af",
    paddingBottom: "8pt",
    marginBottom: "10pt",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10pt",
  },
  logo: {
    width: "55px",
    height: "55px",
    objectFit: "contain" as const,
  },
  orgInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  orgName: {
    fontSize: "16pt",
    fontWeight: "bold" as const,
    color: "#1e40af",
    margin: "0 0 2pt 0",
    letterSpacing: "0.3px",
  },
  contactInfo: {
    fontSize: "7pt",
    color: "#4b5563",
    lineHeight: 1.4,
  },
  headerRight: {
    textAlign: "right" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: "12pt",
    fontWeight: "bold" as const,
    color: "#1e40af",
    marginBottom: "4pt",
    letterSpacing: "1px",
  },
  reportNumber: {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    color: "#374151",
    marginBottom: "4pt",
  },
  qrContainer: {
    marginTop: "4pt",
    textAlign: "right" as const,
  },
  qrImage: {
    width: "45px",
    height: "45px",
  },
  qrText: {
    fontSize: "6pt",
    color: "#6b7280",
    marginTop: "1pt",
  },
  patientSection: {
    border: "1px solid #d1d5db",
    marginBottom: "10pt",
  },
  patientHeader: {
    backgroundColor: "#1e40af",
    color: "white",
    padding: "4pt 10pt",
    fontSize: "9pt",
    fontWeight: "bold" as const,
  },
  patientGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    fontSize: "8pt",
  },
  patientRow: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    padding: "4pt 10pt",
  },
  patientRowAlt: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    padding: "4pt 10pt",
    backgroundColor: "#f9fafb",
  },
  patientLabel: {
    fontSize: "8pt",
    fontWeight: "bold" as const,
    color: "#374151",
    width: "35%",
    minWidth: "80px",
  },
  patientValue: {
    fontSize: "8pt",
    fontWeight: "600" as const,
    color: "#1f2937",
    flex: 1,
  },
  clinicalNotes: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "6pt 10pt",
    fontSize: "8pt",
    color: "#1e40af",
    marginBottom: "10pt",
  },
  sectionHeader: {
    fontSize: "10pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
    backgroundColor: "#f3f4f6",
    borderBottom: "2px solid #374151",
    padding: "5pt 8pt",
    marginTop: "12pt",
    marginBottom: "6pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  sectionContent: {
    padding: "6pt 8pt",
    fontSize: "9pt",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
    color: "#1f2937",
  },
  impressionContent: {
    padding: "6pt 8pt",
    fontSize: "9pt",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
    color: "#1f2937",
    fontWeight: "600" as const,
    backgroundColor: "#fefce8",
    border: "1px solid #fde68a",
  },
  imagesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8pt",
    padding: "6pt 8pt",
  },
  imageContainer: {
    border: "1px solid #d1d5db",
    padding: "4pt",
    textAlign: "center" as const,
  },
  image: {
    maxWidth: "100%",
    maxHeight: "200px",
    objectFit: "contain" as const,
  },
  signatureSection: {
    marginTop: "30pt",
    paddingTop: "10pt",
    borderTop: "1px solid #d1d5db",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    textAlign: "right" as const,
  },
  signatureName: {
    fontSize: "10pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
  },
  signatureTitle: {
    fontSize: "8pt",
    color: "#4b5563",
  },
  signatureDate: {
    fontSize: "7pt",
    color: "#6b7280",
    marginTop: "2pt",
  },
  footer: {
    marginTop: "20pt",
    paddingTop: "6pt",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontSize: "7pt",
    color: "#9ca3af",
  },
  statusBadge: {
    display: "inline-block",
    padding: "2pt 8pt",
    borderRadius: "3px",
    fontSize: "8pt",
    fontWeight: "bold" as const,
    marginBottom: "4pt",
  },
};

export const PrintableImagingReport = forwardRef<HTMLDivElement, PrintableImagingReportProps>(
  ({ order, result, organization }, ref) => {
    const modalityLabel = IMAGING_MODALITIES.find(m => m.value === order.modality)?.label || order.modality;

    const patientName = order.patient
      ? `${order.patient.first_name} ${order.patient.last_name}`
      : 'Unknown';

    const patientAge = order.patient?.date_of_birth
      ? `${Math.floor((new Date().getTime() - new Date(order.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
      : '';

    const orgName = organization?.name || 'Hospital Name';
    const qrUrl = organization?.slug
      ? generateQRCodeUrl(`https://${organization.slug}.lovable.app/verify/imaging/${order.order_number}`)
      : null;

    const findingStatusColors: Record<string, { bg: string; color: string }> = {
      normal: { bg: '#dcfce7', color: '#166534' },
      abnormal: { bg: '#fef9c3', color: '#854d0e' },
      critical: { bg: '#fee2e2', color: '#991b1b' },
    };

    const statusStyle = result.finding_status
      ? findingStatusColors[result.finding_status] || { bg: '#f3f4f6', color: '#374151' }
      : null;

    const images = Array.isArray(result.images) ? result.images as Array<{ url?: string; caption?: string; file_name?: string }> : [];

    return (
      <div ref={ref} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {organization?.logo_url && (
              <img src={organization.logo_url} alt="Logo" style={styles.logo} />
            )}
            <div style={styles.orgInfo}>
              <div style={styles.orgName}>{orgName}</div>
              {organization?.address && (
                <div style={styles.contactInfo}>{organization.address}</div>
              )}
              <div style={styles.contactInfo}>
                {organization?.phone && `Tel: ${organization.phone}`}
                {organization?.phone && organization?.email && ' | '}
                {organization?.email && `Email: ${organization.email}`}
              </div>
              {(organization?.registration_number || organization?.tax_id) && (
                <div style={{ ...styles.contactInfo, marginTop: "2pt" }}>
                  {organization.registration_number && `Reg: ${organization.registration_number}`}
                  {organization.registration_number && organization.tax_id && ' | '}
                  {organization.tax_id && `Tax ID: ${organization.tax_id}`}
                </div>
              )}
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.reportTitle}>{modalityLabel} REPORT</div>
            <div style={styles.reportNumber}>Order #: {order.order_number}</div>
            {statusStyle && result.finding_status && (
              <div style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                {result.finding_status.toUpperCase()}
              </div>
            )}
            {qrUrl && (
              <div style={styles.qrContainer}>
                <img src={qrUrl} alt="QR" style={styles.qrImage} />
                <div style={styles.qrText}>Scan to verify</div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info */}
        <div style={styles.patientSection}>
          <div style={styles.patientHeader}>PATIENT INFORMATION</div>
          <div style={styles.patientGrid}>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Patient Name:</span>
              <span style={styles.patientValue}>{patientName}</span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>Patient ID:</span>
              <span style={styles.patientValue}>{order.patient?.patient_number || 'N/A'}</span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>Age / Gender:</span>
              <span style={styles.patientValue}>{patientAge} / {order.patient?.gender || 'N/A'}</span>
            </div>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Study Date:</span>
              <span style={styles.patientValue}>
                {order.performed_at ? format(new Date(order.performed_at), 'dd/MM/yyyy') : 'N/A'}
              </span>
            </div>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Report Date:</span>
              <span style={styles.patientValue}>
                {order.reported_at ? format(new Date(order.reported_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}
              </span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>Referring Dr:</span>
              <span style={styles.patientValue}>
                {order.ordered_by_profile?.full_name || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Indication */}
        {order.clinical_indication && (
          <div style={styles.clinicalNotes}>
            <strong>Clinical Indication: </strong>{order.clinical_indication}
          </div>
        )}

        {/* Study Details */}
        <div style={styles.sectionHeader}>STUDY DETAILS</div>
        <div style={styles.sectionContent}>
          <div><strong>Examination:</strong> {order.procedure_name}</div>
          {result.technique && <div><strong>Technique:</strong> {result.technique}</div>}
          {result.comparison && <div><strong>Comparison:</strong> {result.comparison}</div>}
        </div>

        {/* Findings */}
        <div style={styles.sectionHeader}>FINDINGS</div>
        <div style={styles.sectionContent}>
          {result.findings || 'No findings recorded.'}
        </div>

        {/* Impression */}
        <div style={styles.sectionHeader}>IMPRESSION</div>
        <div style={styles.impressionContent}>
          {result.impression || 'No impression recorded.'}
        </div>

        {/* Recommendations */}
        {result.recommendations && (
          <>
            <div style={styles.sectionHeader}>RECOMMENDATIONS</div>
            <div style={styles.sectionContent}>{result.recommendations}</div>
          </>
        )}

        {/* Images */}
        {images.length > 0 && (
          <>
            <div style={styles.sectionHeader}>IMAGES</div>
            <div style={styles.imagesGrid}>
              {images.map((img, idx) => (
                <div key={idx} style={styles.imageContainer}>
                  {img.url && <img src={img.url} alt={img.caption || `Image ${idx + 1}`} style={styles.image} />}
                  {img.caption && (
                    <div style={{ fontSize: "7pt", color: "#6b7280", marginTop: "2pt" }}>{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Signature */}
        <div style={styles.signatureSection}>
          <div>
            {order.technician && (
              <div>
                <div style={{ fontSize: "8pt", color: "#4b5563" }}>
                  <strong>Technician:</strong> {order.technician.full_name}
                </div>
              </div>
            )}
          </div>
          <div style={styles.signatureBlock}>
            {order.radiologist?.employee && (
              <div>
                <div style={styles.signatureName}>
                  Dr. {order.radiologist.employee.first_name} {order.radiologist.employee.last_name}
                </div>
                <div style={styles.signatureTitle}>Radiologist</div>
                {order.verified_at && (
                  <div style={styles.signatureDate}>
                    Verified: {format(new Date(order.verified_at), 'dd/MM/yyyy h:mm a')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div>This report is electronically generated and is valid without signature.</div>
          <div>Printed on: {format(new Date(), 'dd/MM/yyyy h:mm a')}</div>
        </div>
      </div>
    );
  }
);

PrintableImagingReport.displayName = 'PrintableImagingReport';
