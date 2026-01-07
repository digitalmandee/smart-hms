import { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { LabOrderWithItems } from "@/hooks/useLabOrders";
import { TemplateField, useLabTestTemplates } from "@/hooks/useLabTestTemplates";

interface PrintableLabReportProps {
  labOrder: LabOrderWithItems;
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  performedBy?: string;
}

export const PrintableLabReport = forwardRef<HTMLDivElement, PrintableLabReportProps>(
  ({ labOrder, organization, performedBy }, ref) => {
    const { data: templates } = useLabTestTemplates();
    const patient = labOrder.patient;
    const doctor = labOrder.doctor as { profile?: { full_name: string }; specialization?: string } | undefined;

    const patientAge = patient?.date_of_birth
      ? differenceInYears(new Date(), new Date(patient.date_of_birth))
      : null;

    // Group items by category
    const itemsByCategory = labOrder.items?.reduce((acc, item) => {
      const category = item.test_category || "Other";
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

    const getCategoryTitle = (category: string): string => {
      const titles: Record<string, string> = {
        blood: "HEMATOLOGY / BIOCHEMISTRY",
        imaging: "RADIOLOGY",
        pathology: "PATHOLOGY",
        other: "OTHER INVESTIGATIONS",
      };
      return titles[category] || category.toUpperCase();
    };

    return (
      <div ref={ref} className="print-content">
        {/* Header */}
        <div className="print-header">
          <h1>{organization?.name || "Healthcare Laboratory"}</h1>
          <p>
            {[organization?.address, organization?.phone, organization?.email]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>

        {/* Report Title */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "14pt", margin: 0 }}>LABORATORY REPORT</h2>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Date: {format(new Date(labOrder.created_at), "MMMM d, yyyy")}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600 }}>Report# {labOrder.order_number}</p>
            <p style={{ fontSize: "9pt", color: "#666", textTransform: "capitalize" }}>
              Priority: {labOrder.priority}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="print-section" style={{ background: "#f9fafb", padding: "12px", borderRadius: "4px" }}>
          <div className="print-grid">
            <div className="print-row">
              <span className="print-label">Patient:</span>
              <span className="print-value">
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
            <div className="print-row">
              <span className="print-label">MR#:</span>
              <span className="print-value">{patient?.patient_number}</span>
            </div>
            {patientAge !== null && (
              <div className="print-row">
                <span className="print-label">Age:</span>
                <span className="print-value">{patientAge} years</span>
              </div>
            )}
            {patient?.gender && (
              <div className="print-row">
                <span className="print-label">Gender:</span>
                <span className="print-value" style={{ textTransform: "capitalize" }}>
                  {patient.gender}
                </span>
              </div>
            )}
            <div className="print-row">
              <span className="print-label">Referred By:</span>
              <span className="print-value">Dr. {doctor?.profile?.full_name || "Unknown"}</span>
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        {labOrder.clinical_notes && (
          <div className="print-section">
            <div className="print-row">
              <span className="print-label">Clinical Notes:</span>
              <span className="print-value">{labOrder.clinical_notes}</span>
            </div>
          </div>
        )}

        {/* Test Results by Category */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="print-section">
            <div className="print-section-title" style={{ borderBottom: "1px solid #ddd", paddingBottom: "4px", marginBottom: "8px" }}>
              {getCategoryTitle(category)}
            </div>

            {items?.map((item) => {
              const template = getTemplate(item.test_name);
              const resultValues = (item.result_values || {}) as Record<string, string | number>;

              return (
                <div key={item.id} style={{ marginBottom: "16px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>{item.test_name}</p>

                  {template ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
                      <thead>
                        <tr style={{ background: "#f3f4f6" }}>
                          <th style={{ padding: "6px", textAlign: "left", border: "1px solid #ddd" }}>Parameter</th>
                          <th style={{ padding: "6px", textAlign: "center", border: "1px solid #ddd" }}>Result</th>
                          <th style={{ padding: "6px", textAlign: "center", border: "1px solid #ddd" }}>Unit</th>
                          <th style={{ padding: "6px", textAlign: "center", border: "1px solid #ddd" }}>Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {template.fields.map((field) => {
                          const value = resultValues[field.name];
                          const isAbnormal = isValueAbnormal(field, value);

                          return (
                            <tr key={field.name}>
                              <td style={{ padding: "6px", border: "1px solid #ddd" }}>{field.name}</td>
                              <td
                                style={{
                                  padding: "6px",
                                  textAlign: "center",
                                  border: "1px solid #ddd",
                                  fontWeight: isAbnormal ? "bold" : "normal",
                                  color: isAbnormal ? "#dc2626" : "inherit",
                                }}
                              >
                                {value || "-"}
                              </td>
                              <td style={{ padding: "6px", textAlign: "center", border: "1px solid #ddd" }}>
                                {field.unit || "-"}
                              </td>
                              <td style={{ padding: "6px", textAlign: "center", border: "1px solid #ddd" }}>
                                {field.normal_min !== null && field.normal_max !== null
                                  ? `${field.normal_min} - ${field.normal_max}`
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ padding: "8px", background: "#f9fafb", borderRadius: "4px" }}>
                      {resultValues["result"] || "No result recorded"}
                    </p>
                  )}

                  {item.result_notes && (
                    <p style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>
                      Note: {item.result_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Overall Notes */}
        {labOrder.result_notes && (
          <div className="print-section" style={{ background: "#f9fafb", padding: "12px", borderRadius: "4px" }}>
            <div className="print-row">
              <span className="print-label">Lab Notes:</span>
              <span className="print-value">{labOrder.result_notes}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <div>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Report Generated: {labOrder.completed_at
                ? format(new Date(labOrder.completed_at), "MMMM d, yyyy 'at' h:mm a")
                : format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p style={{ fontSize: "8pt", color: "#999", marginTop: "4px" }}>
              * Values outside reference range are marked in bold/red
            </p>
          </div>
          <div className="signature-area">
            <p style={{ fontWeight: 600 }}>{performedBy || "Lab Technician"}</p>
            <div className="signature-line">Signature</div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableLabReport.displayName = "PrintableLabReport";
