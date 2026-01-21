import { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { LabOrderWithItems } from "@/hooks/useLabOrders";
import { TemplateField, useLabTestTemplates } from "@/hooks/useLabTestTemplates";
import { generateQRCodeUrl } from "@/lib/qrcode";

interface PrintableLabReportProps {
  labOrder: LabOrderWithItems;
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
  performedBy?: string;
}

// Inline styles for A4 print compatibility (matches PrintableInvoice pattern)
const styles = {
  container: {
    backgroundColor: "white",
    padding: "20mm",
    minHeight: "297mm",
    maxWidth: "210mm",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "10pt",
    lineHeight: 1.5,
    color: "#1a1a1a",
    position: "relative" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "3px solid #0d9488",
    paddingBottom: "12pt",
    marginBottom: "16pt",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12pt",
  },
  logo: {
    width: "60px",
    height: "60px",
    objectFit: "contain" as const,
  },
  orgName: {
    fontSize: "18pt",
    fontWeight: "bold" as const,
    color: "#0d9488",
    margin: "0 0 4pt 0",
  },
  orgAddress: {
    fontSize: "9pt",
    color: "#4b5563",
    margin: "2pt 0",
  },
  contactRow: {
    display: "flex",
    gap: "12pt",
    fontSize: "9pt",
    color: "#4b5563",
    marginTop: "2pt",
  },
  regRow: {
    display: "flex",
    gap: "12pt",
    fontSize: "8pt",
    color: "#6b7280",
    marginTop: "2pt",
  },
  headerRight: {
    textAlign: "right" as const,
  },
  reportBadge: {
    display: "inline-block",
    backgroundColor: "#1e40af",
    color: "white",
    padding: "6pt 12pt",
    borderRadius: "4px",
    marginBottom: "6pt",
  },
  reportBadgeText: {
    fontSize: "14pt",
    fontWeight: "bold" as const,
    letterSpacing: "1px",
    margin: 0,
  },
  qrContainer: {
    marginTop: "8pt",
  },
  qrImage: {
    marginLeft: "auto",
    width: "60px",
    height: "60px",
  },
  qrText: {
    fontSize: "7pt",
    color: "#6b7280",
    marginTop: "2pt",
  },
  reportNumber: {
    fontSize: "11pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
    margin: "4pt 0",
  },
  patientSection: {
    backgroundColor: "#f8fafc",
    padding: "12pt",
    borderRadius: "6px",
    marginBottom: "16pt",
  },
  patientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12pt",
  },
  patientItem: {
    display: "flex",
    flexDirection: "column" as const,
  },
  label: {
    fontSize: "8pt",
    color: "#6b7280",
    marginBottom: "2pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "10pt",
    fontWeight: "500" as const,
    color: "#1f2937",
  },
  smallValue: {
    fontSize: "9pt",
    color: "#4b5563",
  },
  categoryTitle: {
    fontSize: "11pt",
    fontWeight: "bold" as const,
    color: "#1e40af",
    borderBottom: "2px solid #1e40af",
    paddingBottom: "4pt",
    marginBottom: "10pt",
    marginTop: "16pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  testName: {
    fontSize: "10pt",
    fontWeight: "600" as const,
    color: "#1f2937",
    marginBottom: "6pt",
    marginTop: "12pt",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "9pt",
    marginBottom: "8pt",
  },
  tableHeader: {
    backgroundColor: "#1e40af",
    color: "white",
  },
  th: {
    padding: "6pt 8pt",
    textAlign: "left" as const,
    fontWeight: "600" as const,
    fontSize: "8pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  thCenter: {
    padding: "6pt 8pt",
    textAlign: "center" as const,
    fontWeight: "600" as const,
    fontSize: "8pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  td: {
    padding: "6pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle" as const,
  },
  tdCenter: {
    padding: "6pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  },
  tdAbnormal: {
    padding: "6pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    color: "#dc2626",
    verticalAlign: "middle" as const,
  },
  abnormalIndicator: {
    display: "inline-block",
    fontSize: "7pt",
    fontWeight: "bold" as const,
    color: "#dc2626",
    marginLeft: "4pt",
  },
  notesBox: {
    backgroundColor: "#fef3c7",
    padding: "8pt 12pt",
    borderRadius: "4px",
    fontSize: "9pt",
    color: "#92400e",
    marginTop: "8pt",
    marginBottom: "12pt",
  },
  clinicalNotes: {
    backgroundColor: "#f0f9ff",
    padding: "10pt 12pt",
    borderRadius: "4px",
    fontSize: "9pt",
    color: "#0369a1",
    marginBottom: "16pt",
  },
  noTemplate: {
    backgroundColor: "#f9fafb",
    padding: "8pt 12pt",
    borderRadius: "4px",
    fontSize: "9pt",
    color: "#374151",
    fontStyle: "italic" as const,
  },
  footer: {
    marginTop: "24pt",
    paddingTop: "16pt",
    borderTop: "1px solid #e5e7eb",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24pt",
  },
  footerLeft: {
    fontSize: "8pt",
    color: "#6b7280",
  },
  footerRight: {
    textAlign: "right" as const,
  },
  signatureArea: {
    marginTop: "12pt",
  },
  signatureName: {
    fontSize: "10pt",
    fontWeight: "600" as const,
    color: "#1f2937",
  },
  signatureTitle: {
    fontSize: "8pt",
    color: "#6b7280",
    marginTop: "2pt",
  },
  signatureLine: {
    borderTop: "1px solid #374151",
    width: "150px",
    marginTop: "30pt",
    marginLeft: "auto",
  },
  legend: {
    fontSize: "7pt",
    color: "#6b7280",
    marginTop: "8pt",
  },
  watermark: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: "72pt",
    fontWeight: "bold" as const,
    color: "rgba(34, 197, 94, 0.08)",
    pointerEvents: "none" as const,
    zIndex: 0,
  },
};

export const PrintableLabReport = forwardRef<HTMLDivElement, PrintableLabReportProps>(
  ({ labOrder, organization, performedBy }, ref) => {
    const { data: templates } = useLabTestTemplates();
    const patient = labOrder.patient;
    const doctor = labOrder.doctor as { profile?: { full_name: string }; specialization?: string } | undefined;

    const patientAge = patient?.date_of_birth
      ? differenceInYears(new Date(), new Date(patient.date_of_birth))
      : null;

    // Generate verification URL and QR code
    const verificationUrl = organization?.slug
      ? `https://smart-hms.lovable.app/lab-reports?order=${labOrder.order_number}`
      : "";
    const qrCodeUrl = verificationUrl ? generateQRCodeUrl(verificationUrl, 60) : "";

    // Group items by category
    const itemsByCategory = labOrder.items?.reduce((acc, item) => {
      const category = item.test_category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof labOrder.items>) || {};

    const getTemplate = (testName: string) => {
      return templates?.find((t) =>
        testName.toLowerCase().includes(t.test_name.toLowerCase()) ||
        t.test_name.toLowerCase().includes(testName.toLowerCase())
      );
    };

    const isValueAbnormal = (field: TemplateField, value: string | number): boolean => {
      if (field.type === "text" || !value) return false;
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return false;
      if (field.normal_min !== null && numValue < field.normal_min) return true;
      if (field.normal_max !== null && numValue > field.normal_max) return true;
      return false;
    };

    const getAbnormalIndicator = (field: TemplateField, value: string | number): string => {
      if (!isValueAbnormal(field, value)) return "";
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (field.normal_min !== null && numValue < field.normal_min) return "L";
      if (field.normal_max !== null && numValue > field.normal_max) return "H";
      return "";
    };

    const getCategoryTitle = (category: string): string => {
      const titles: Record<string, string> = {
        blood: "Hematology / Biochemistry",
        imaging: "Radiology",
        pathology: "Pathology",
        other: "Other Investigations",
        general: "General Tests",
      };
      return titles[category.toLowerCase()] || category;
    };

    const isCompleted = labOrder.status === "completed";

    return (
      <div ref={ref} style={styles.container}>
        {/* Completed Watermark */}
        {isCompleted && <div style={styles.watermark}>VERIFIED</div>}

        {/* ===== LETTERHEAD HEADER ===== */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {organization?.logo_url && (
              <img
                src={organization.logo_url}
                alt={organization.name}
                style={styles.logo}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div>
              <h1 style={styles.orgName}>
                {organization?.name || "Healthcare Laboratory"}
              </h1>
              {organization?.address && (
                <p style={styles.orgAddress}>{organization.address}</p>
              )}
              <div style={styles.contactRow}>
                {organization?.phone && <span>Tel: {organization.phone}</span>}
                {organization?.phone && organization?.email && <span>|</span>}
                {organization?.email && <span>{organization.email}</span>}
              </div>
              {(organization?.registration_number || organization?.tax_id) && (
                <div style={styles.regRow}>
                  {organization?.registration_number && (
                    <span>Reg: {organization.registration_number}</span>
                  )}
                  {organization?.tax_id && (
                    <span>Tax ID: {organization.tax_id}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.reportBadge}>
              <p style={styles.reportBadgeText}>LAB REPORT</p>
            </div>
            <p style={styles.reportNumber}>{labOrder.order_number}</p>
            <p style={{ fontSize: "9pt", color: "#6b7280" }}>
              {labOrder.priority !== "routine" && (
                <span style={{ color: labOrder.priority === "stat" ? "#dc2626" : "#ea580c", fontWeight: "bold" }}>
                  [{labOrder.priority.toUpperCase()}]{" "}
                </span>
              )}
              {format(new Date(labOrder.created_at), "dd MMM yyyy")}
            </p>
            {qrCodeUrl && (
              <div style={styles.qrContainer}>
                <img
                  src={qrCodeUrl}
                  alt="Verification QR"
                  style={styles.qrImage}
                />
                <p style={styles.qrText}>Scan to verify</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== PATIENT INFORMATION ===== */}
        <div style={styles.patientSection}>
          <div style={styles.patientGrid}>
            <div style={styles.patientItem}>
              <span style={styles.label}>Patient Name</span>
              <span style={styles.value}>
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
            <div style={styles.patientItem}>
              <span style={styles.label}>MR Number</span>
              <span style={styles.value}>{patient?.patient_number}</span>
            </div>
            <div style={styles.patientItem}>
              <span style={styles.label}>Age / Gender</span>
              <span style={styles.value}>
                {patientAge !== null ? `${patientAge} Years` : "-"} / {patient?.gender ? patient.gender.charAt(0).toUpperCase() : "-"}
              </span>
            </div>
            <div style={styles.patientItem}>
              <span style={styles.label}>Referred By</span>
              <span style={styles.value}>Dr. {doctor?.profile?.full_name || "Unknown"}</span>
              {doctor?.specialization && (
                <span style={styles.smallValue}>{doctor.specialization}</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== CLINICAL NOTES ===== */}
        {labOrder.clinical_notes && (
          <div style={styles.clinicalNotes}>
            <strong>Clinical Notes:</strong> {labOrder.clinical_notes}
          </div>
        )}

        {/* ===== TEST RESULTS BY CATEGORY ===== */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category}>
            <div style={styles.categoryTitle}>{getCategoryTitle(category)}</div>

            {items?.map((item) => {
              const template = getTemplate(item.test_name);
              const resultValues = (item.result_values || {}) as Record<string, string | number>;

              return (
                <div key={item.id}>
                  <p style={styles.testName}>{item.test_name}</p>

                  {template ? (
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Parameter</th>
                          <th style={styles.thCenter}>Result</th>
                          <th style={styles.thCenter}>Unit</th>
                          <th style={styles.thCenter}>Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {template.fields.map((field, idx) => {
                          const value = resultValues[field.name];
                          const abnormal = isValueAbnormal(field, value);
                          const indicator = getAbnormalIndicator(field, value);
                          const rowBg = idx % 2 === 1 ? { backgroundColor: "#f9fafb" } : {};

                          return (
                            <tr key={field.name} style={rowBg}>
                              <td style={styles.td}>{field.name}</td>
                              <td style={abnormal ? styles.tdAbnormal : styles.tdCenter}>
                                {value || "-"}
                                {indicator && (
                                  <span style={styles.abnormalIndicator}>{indicator}</span>
                                )}
                              </td>
                              <td style={styles.tdCenter}>{field.unit || "-"}</td>
                              <td style={styles.tdCenter}>
                                {field.normal_min !== null && field.normal_max !== null
                                  ? `${field.normal_min} - ${field.normal_max}`
                                  : field.normal_min !== null
                                  ? `> ${field.normal_min}`
                                  : field.normal_max !== null
                                  ? `< ${field.normal_max}`
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={styles.noTemplate}>
                      {resultValues["result"] || "No result recorded"}
                    </p>
                  )}

                  {item.result_notes && (
                    <div style={styles.notesBox}>
                      <strong>Note:</strong> {item.result_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* ===== OVERALL NOTES ===== */}
        {labOrder.result_notes && (
          <div style={{ ...styles.clinicalNotes, marginTop: "16pt" }}>
            <strong>Lab Notes:</strong> {labOrder.result_notes}
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div style={styles.footer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerLeft}>
              <p>
                <strong>Report Generated:</strong>{" "}
                {labOrder.completed_at
                  ? format(new Date(labOrder.completed_at), "dd MMM yyyy 'at' hh:mm a")
                  : format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
              </p>
              <p style={styles.legend}>
                * Values marked in <span style={{ color: "#dc2626", fontWeight: "bold" }}>red</span> are outside normal range.
                <br />
                H = High, L = Low
              </p>
              <p style={{ marginTop: "8pt", fontSize: "8pt" }}>
                This is a computer-generated report.
              </p>
            </div>
            <div style={styles.footerRight}>
              <div style={styles.signatureArea}>
                <div style={styles.signatureLine} />
                <p style={styles.signatureName}>{performedBy || "Lab Technician"}</p>
                <p style={styles.signatureTitle}>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableLabReport.displayName = "PrintableLabReport";
