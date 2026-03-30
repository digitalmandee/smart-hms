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

// Professional A4 styles matching Chughtai Lab reference
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
  // Header Section
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
  tagline: {
    fontSize: "7pt",
    fontWeight: "600" as const,
    color: "#6b7280",
    fontStyle: "italic" as const,
    marginBottom: "3pt",
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
  priorityBadge: {
    fontSize: "8pt",
    fontWeight: "bold" as const,
    padding: "2pt 6pt",
    borderRadius: "2px",
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

  // Patient Section - Bordered Box
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

  // Clinical Notes
  clinicalNotes: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "6pt 10pt",
    fontSize: "8pt",
    color: "#1e40af",
    marginBottom: "10pt",
  },

  // Department/Category Header
  departmentHeader: {
    fontSize: "10pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
    backgroundColor: "#f3f4f6",
    borderBottom: "2px solid #374151",
    padding: "5pt 8pt",
    marginTop: "12pt",
    marginBottom: "2pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  collectionInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "7pt",
    color: "#4b5563",
    padding: "3pt 8pt",
    backgroundColor: "#f9fafb",
    marginBottom: "6pt",
    fontWeight: "500" as const,
  },

  // Test Name
  testName: {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    color: "#1e40af",
    padding: "6pt 0 4pt 0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "4pt",
  },

  // Table Styles
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "6pt",
  },
  tableHeader: {
    backgroundColor: "#1e40af",
    color: "white",
  },
  th: {
    padding: "5pt 8pt",
    textAlign: "left" as const,
    fontWeight: "bold" as const,
    fontSize: "8pt",
    borderBottom: "1px solid #1e40af",
  },
  thCenter: {
    padding: "5pt 8pt",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    fontSize: "8pt",
    borderBottom: "1px solid #1e40af",
  },
  td: {
    padding: "4pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "8pt",
    fontWeight: "500" as const,
    verticalAlign: "middle" as const,
  },
  tdParameter: {
    padding: "4pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "8pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
    verticalAlign: "middle" as const,
  },
  tdCenter: {
    padding: "4pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontSize: "8pt",
    fontWeight: "500" as const,
    verticalAlign: "middle" as const,
  },
  tdAbnormal: {
    padding: "4pt 8pt",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    color: "#dc2626",
    fontSize: "8pt",
    verticalAlign: "middle" as const,
  },
  abnormalIndicator: {
    display: "inline-block",
    fontSize: "7pt",
    fontWeight: "bold" as const,
    color: "#dc2626",
    marginLeft: "3pt",
  },
  rowEven: {
    backgroundColor: "#f9fafb",
  },

  // Notes Box
  notesBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fcd34d",
    padding: "5pt 10pt",
    fontSize: "8pt",
    color: "#92400e",
    marginTop: "4pt",
    marginBottom: "6pt",
  },
  noTemplate: {
    backgroundColor: "#f9fafb",
    padding: "6pt 10pt",
    fontSize: "8pt",
    color: "#374151",
    fontStyle: "italic" as const,
    border: "1px solid #e5e7eb",
  },

  // Footer Section
  footer: {
    marginTop: "auto",
    paddingTop: "10pt",
    borderTop: "1px solid #d1d5db",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16pt",
  },
  footerLeft: {
    fontSize: "7pt",
    color: "#4b5563",
  },
  footerRight: {
    textAlign: "right" as const,
  },
  signatureArea: {
    marginTop: "6pt",
  },
  signatureLine: {
    borderTop: "1px solid #374151",
    width: "100px",
    marginTop: "20pt",
    marginLeft: "auto",
  },
  signatureName: {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    color: "#1f2937",
    marginTop: "3pt",
  },
  signatureTitle: {
    fontSize: "7pt",
    color: "#6b7280",
    marginTop: "1pt",
  },
  legend: {
    fontSize: "6pt",
    color: "#6b7280",
    marginTop: "6pt",
    lineHeight: 1.4,
  },
  disclaimer: {
    fontSize: "7pt",
    color: "#6b7280",
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    marginTop: "8pt",
    paddingTop: "6pt",
    borderTop: "1px dotted #d1d5db",
  },

  // Watermark
  watermark: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: "42pt",
    fontWeight: "bold" as const,
    color: "rgba(34, 197, 94, 0.05)",
    pointerEvents: "none" as const,
    zIndex: 0,
    letterSpacing: "8px",
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

    const verificationUrl = organization?.slug
      ? `https://smart-hms.lovable.app/lab-reports?order=${labOrder.order_number}`
      : "";
    const qrCodeUrl = verificationUrl ? generateQRCodeUrl(verificationUrl, 55) : "";

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

    const isValueCritical = (field: TemplateField, value: string | number): boolean => {
      if (field.type === "text" || !value) return false;
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return false;
      if (field.critical_min != null && numValue < field.critical_min) return true;
      if (field.critical_max != null && numValue > field.critical_max) return true;
      return false;
    };

    const getAbnormalIndicator = (field: TemplateField, value: string | number): string => {
      if (isValueCritical(field, value)) return "C";
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
        {isCompleted && <div style={styles.watermark}>VERIFIED</div>}

        {/* ===== HEADER ===== */}
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
            <div style={styles.orgInfo}>
              <h1 style={styles.orgName}>
                {organization?.name || "Healthcare Laboratory"}
              </h1>
              <p style={styles.tagline}>Quality Healthcare Services</p>
              <div style={styles.contactInfo}>
                {organization?.address && <div>{organization.address}</div>}
                <div>
                  {organization?.phone && <span>Tel: {organization.phone}</span>}
                  {organization?.phone && organization?.email && <span> | </span>}
                  {organization?.email && <span>{organization.email}</span>}
                </div>
                {(organization?.registration_number || organization?.tax_id) && (
                  <div>
                    {organization?.registration_number && <span>Reg: {organization.registration_number}</span>}
                    {organization?.registration_number && organization?.tax_id && <span> | </span>}
                    {organization?.tax_id && <span>Tax: {organization.tax_id}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.reportTitle}>LABORATORY REPORT</div>
            <div style={styles.reportNumber}>Case #: {labOrder.order_number}</div>
            {labOrder.priority !== "routine" && (
              <div style={{
                ...styles.priorityBadge,
                backgroundColor: labOrder.priority === "stat" ? "#dc2626" : "#ea580c",
                color: "white",
              }}>
                {labOrder.priority.toUpperCase()}
              </div>
            )}
            <div style={{ fontSize: "8pt", color: "#6b7280" }}>
              {format(new Date(labOrder.created_at), "dd MMM yyyy")}
            </div>
            {qrCodeUrl && (
              <div style={styles.qrContainer}>
                <img src={qrCodeUrl} alt="Verify" style={styles.qrImage} />
                <div style={styles.qrText}>Scan to verify</div>
              </div>
            )}
          </div>
        </div>

        {/* ===== PATIENT INFORMATION ===== */}
        <div style={styles.patientSection}>
          <div style={styles.patientHeader}>Patient Information</div>
          <div style={styles.patientGrid}>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Patient Name:</span>
              <span style={styles.patientValue}>
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>MR Number:</span>
              <span style={styles.patientValue}>{patient?.patient_number}</span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>Age / Gender:</span>
              <span style={styles.patientValue}>
                {patientAge !== null ? `${patientAge} Years` : "-"} / {patient?.gender ? patient.gender.charAt(0).toUpperCase() : "-"}
              </span>
            </div>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Registration:</span>
              <span style={styles.patientValue}>
                {format(new Date(labOrder.created_at), "dd/MM/yyyy hh:mm a")}
              </span>
            </div>
            <div style={styles.patientRow}>
              <span style={styles.patientLabel}>Referred By:</span>
              <span style={styles.patientValue}>
                Dr. {doctor?.profile?.full_name || "Self"}
                {doctor?.specialization && ` (${doctor.specialization})`}
              </span>
            </div>
            <div style={styles.patientRowAlt}>
              <span style={styles.patientLabel}>Report Status:</span>
              <span style={{
                ...styles.patientValue,
                color: isCompleted ? "#059669" : "#ea580c",
                fontWeight: "bold",
              }}>
                {isCompleted ? "FINAL" : "PENDING"}
              </span>
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
            <div style={styles.departmentHeader}>{getCategoryTitle(category)}</div>
            <div style={styles.collectionInfo}>
              <span>Collection: {format(new Date(labOrder.created_at), "dd/MM/yyyy hh:mm a")}</span>
              <span>Reported: {labOrder.completed_at 
                ? format(new Date(labOrder.completed_at), "dd/MM/yyyy hh:mm a")
                : "Pending"}</span>
            </div>

            {items?.map((item) => {
              const template = getTemplate(item.test_name);
              const resultValues = (item.result_values || {}) as Record<string, string | number>;

              return (
                <div key={item.id}>
                  <div style={styles.testName}>{item.test_name}</div>

                  {template ? (
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={{ ...styles.th, width: "35%" }}>Test Parameter</th>
                          <th style={{ ...styles.thCenter, width: "20%" }}>Result</th>
                          <th style={{ ...styles.thCenter, width: "15%" }}>Unit</th>
                          <th style={{ ...styles.thCenter, width: "30%" }}>Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {template.fields.map((field, idx) => {
                          const value = resultValues[field.name];
                          const abnormal = isValueAbnormal(field, value);
                          const critical = isValueCritical(field, value);
                          const indicator = getAbnormalIndicator(field, value);
                          const rowStyle = idx % 2 === 1 ? styles.rowEven : {};

                          return (
                            <tr key={field.name} style={rowStyle}>
                              <td style={styles.tdParameter}>{field.name}</td>
                              <td style={critical ? { ...styles.tdAbnormal, backgroundColor: "#fef2f2", fontWeight: "900" } : abnormal ? styles.tdAbnormal : styles.tdCenter}>
                                {value || "-"}
                                {indicator && (
                                  <span style={{
                                    ...styles.abnormalIndicator,
                                    ...(indicator === "C" ? { color: "#991b1b", fontWeight: "900", fontSize: "8pt" } : {}),
                                  }}>
                                    {indicator === "C" ? " ‼" : ` ${indicator}`}
                                  </span>
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
                    <div style={styles.noTemplate}>
                      {resultValues["result"] || "No result recorded"}
                    </div>
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
          <div style={{ ...styles.clinicalNotes, marginTop: "12pt" }}>
            <strong>Lab Comments:</strong> {labOrder.result_notes}
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div style={styles.footer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerLeft}>
              <div>
                <strong>Report Generated:</strong>{" "}
                {labOrder.completed_at
                  ? format(new Date(labOrder.completed_at), "dd MMM yyyy 'at' hh:mm a")
                  : format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
              </div>
              <div style={styles.legend}>
                <strong>Legend:</strong> Values in <span style={{ color: "#dc2626", fontWeight: "bold" }}>red</span> are outside normal range.
                <br />H = High | L = Low
              </div>
            </div>
            <div style={styles.footerRight}>
              <div style={styles.signatureArea}>
                <div style={styles.signatureLine} />
                <div style={styles.signatureName}>{performedBy || "Lab Technician"}</div>
                <div style={styles.signatureTitle}>Authorized Signatory</div>
              </div>
            </div>
          </div>
          <div style={styles.disclaimer}>
            This is an electronically verified report. Results relate only to the sample tested.
          </div>
        </div>
      </div>
    );
  }
);

PrintableLabReport.displayName = "PrintableLabReport";
