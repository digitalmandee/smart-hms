import { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { ConsultationWithRelations } from "@/hooks/useConsultations";
import { PrescriptionWithItems } from "@/hooks/usePrescriptions";

interface PrintablePrescriptionProps {
  consultation: ConsultationWithRelations;
  prescription: PrescriptionWithItems;
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export const PrintablePrescription = forwardRef<HTMLDivElement, PrintablePrescriptionProps>(
  ({ consultation, prescription, organization }, ref) => {
    const patient = consultation.patient;
    const doctor = consultation.doctor;
    const doctorProfile = (doctor as any)?.profile;

    const patientAge = patient?.date_of_birth
      ? differenceInYears(new Date(), new Date(patient.date_of_birth))
      : null;

    return (
      <div ref={ref} className="print-content">
        {/* Header */}
        <div className="print-header">
          <h1>{organization?.name || "Healthcare Clinic"}</h1>
          <p>
            {[organization?.address, organization?.phone, organization?.email]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>

        {/* Prescription Title */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "14pt", margin: 0 }}>PRESCRIPTION</h2>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Date: {format(new Date(consultation.created_at), "MMMM d, yyyy")}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 600 }}>Rx# {prescription.prescription_number}</p>
            {consultation.appointment?.token_number && (
              <p style={{ fontSize: "9pt", color: "#666" }}>
                Token #{consultation.appointment.token_number}
              </p>
            )}
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
            {patient?.phone && (
              <div className="print-row">
                <span className="print-label">Phone:</span>
                <span className="print-value">{patient.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        {(consultation.chief_complaint || consultation.diagnosis) && (
          <div className="print-section">
            {consultation.chief_complaint && (
              <div className="print-row">
                <span className="print-label">Chief Complaint:</span>
                <span className="print-value">{consultation.chief_complaint}</span>
              </div>
            )}
            {consultation.diagnosis && (
              <div className="print-row">
                <span className="print-label">Diagnosis:</span>
                <span className="print-value">{consultation.diagnosis}</span>
              </div>
            )}
          </div>
        )}

        {/* Prescription Items */}
        <div className="print-section">
          <div className="print-section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16pt" }}>℞</span>
            Medications
          </div>
          {prescription.items.map((item, index) => (
            <div key={item.id} className="prescription-item">
              <div className="prescription-number">{index + 1}</div>
              <div className="prescription-details">
                <div className="medicine-name">{item.medicine_name}</div>
                <div className="medicine-info">
                  {[item.dosage, item.frequency, item.duration, item.quantity && `Qty: ${item.quantity}`]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
                {item.instructions && (
                  <div className="medicine-instructions">{item.instructions}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Notes & Follow-up */}
        {(prescription.notes || consultation.follow_up_date) && (
          <div className="print-section" style={{ background: "#f9fafb", padding: "12px", borderRadius: "4px" }}>
            {prescription.notes && (
              <div className="print-row">
                <span className="print-label">Notes:</span>
                <span className="print-value">{prescription.notes}</span>
              </div>
            )}
            {consultation.follow_up_date && (
              <div className="print-row">
                <span className="print-label">Follow-up:</span>
                <span className="print-value" style={{ color: "#0d9488", fontWeight: 600 }}>
                  {format(new Date(consultation.follow_up_date), "MMMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <div>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Issued on: {format(new Date(prescription.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="signature-area">
            <p style={{ fontWeight: 600 }}>Dr. {doctorProfile?.full_name || "Doctor"}</p>
            {doctor?.specialization && (
              <p style={{ fontSize: "9pt", color: "#666" }}>{doctor.specialization}</p>
            )}
            {doctor?.qualification && (
              <p style={{ fontSize: "9pt", color: "#666" }}>{doctor.qualification}</p>
            )}
            {doctor?.license_number && (
              <p style={{ fontSize: "9pt", color: "#666" }}>License: {doctor.license_number}</p>
            )}
            <div className="signature-line">Signature</div>
          </div>
        </div>
      </div>
    );
  }
);

PrintablePrescription.displayName = "PrintablePrescription";
