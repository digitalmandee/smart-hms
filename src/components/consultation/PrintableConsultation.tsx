import { forwardRef } from "react";
import { format, differenceInYears } from "date-fns";
import { ConsultationWithRelations, Vitals } from "@/hooks/useConsultations";
import { PrescriptionWithItems } from "@/hooks/usePrescriptions";

interface PrintableConsultationProps {
  consultation: ConsultationWithRelations;
  prescription?: PrescriptionWithItems | null;
  organization?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export const PrintableConsultation = forwardRef<HTMLDivElement, PrintableConsultationProps>(
  ({ consultation, prescription, organization }, ref) => {
    const patient = consultation.patient;
    const doctor = consultation.doctor;
    const doctorProfile = (doctor as any)?.profile;
    const vitals = consultation.vitals as Vitals | null;

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

        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "14pt", margin: 0 }}>CONSULTATION SUMMARY</h2>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Date: {format(new Date(consultation.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {consultation.appointment?.token_number && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 600 }}>Token #{consultation.appointment.token_number}</p>
            </div>
          )}
        </div>

        {/* Patient & Doctor Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Patient */}
          <div className="print-section" style={{ background: "#f9fafb", padding: "12px", borderRadius: "4px" }}>
            <div className="print-section-title">Patient Information</div>
            <div className="print-row">
              <span className="print-label">Name:</span>
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
            {patient?.blood_group && (
              <div className="print-row">
                <span className="print-label">Blood Group:</span>
                <span className="print-value">{patient.blood_group}</span>
              </div>
            )}
          </div>

          {/* Doctor */}
          <div className="print-section" style={{ background: "#f9fafb", padding: "12px", borderRadius: "4px" }}>
            <div className="print-section-title">Attending Physician</div>
            <div className="print-row">
              <span className="print-label">Doctor:</span>
              <span className="print-value">Dr. {doctorProfile?.full_name || "Doctor"}</span>
            </div>
            {doctor?.specialization && (
              <div className="print-row">
                <span className="print-label">Specialization:</span>
                <span className="print-value">{doctor.specialization}</span>
              </div>
            )}
            {doctor?.qualification && (
              <div className="print-row">
                <span className="print-label">Qualification:</span>
                <span className="print-value">{doctor.qualification}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vitals */}
        {vitals && Object.keys(vitals).length > 0 && (
          <div className="print-section">
            <div className="print-section-title">Vitals</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {vitals.blood_pressure && (
                <div>
                  <span className="print-label">BP:</span>
                  <p className="print-value">
                    {vitals.blood_pressure.systolic}/{vitals.blood_pressure.diastolic} mmHg
                  </p>
                </div>
              )}
              {vitals.pulse && (
                <div>
                  <span className="print-label">Pulse:</span>
                  <p className="print-value">{vitals.pulse} bpm</p>
                </div>
              )}
              {vitals.temperature && (
                <div>
                  <span className="print-label">Temp:</span>
                  <p className="print-value">
                    {vitals.temperature}°{vitals.temperature_unit || "F"}
                  </p>
                </div>
              )}
              {vitals.spo2 && (
                <div>
                  <span className="print-label">SpO2:</span>
                  <p className="print-value">{vitals.spo2}%</p>
                </div>
              )}
              {vitals.weight && (
                <div>
                  <span className="print-label">Weight:</span>
                  <p className="print-value">{vitals.weight} kg</p>
                </div>
              )}
              {vitals.height && (
                <div>
                  <span className="print-label">Height:</span>
                  <p className="print-value">{vitals.height} cm</p>
                </div>
              )}
              {vitals.bmi && (
                <div>
                  <span className="print-label">BMI:</span>
                  <p className="print-value">{vitals.bmi}</p>
                </div>
              )}
              {vitals.respiratory_rate && (
                <div>
                  <span className="print-label">Resp Rate:</span>
                  <p className="print-value">{vitals.respiratory_rate}/min</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clinical Info */}
        <div className="print-section">
          <div className="print-section-title">Clinical Information</div>
          {consultation.chief_complaint && (
            <div style={{ marginBottom: "8px" }}>
              <span className="print-label">Chief Complaint:</span>
              <p className="print-value">{consultation.chief_complaint}</p>
            </div>
          )}
          {consultation.symptoms && (
            <div style={{ marginBottom: "8px" }}>
              <span className="print-label">Symptoms:</span>
              <p className="print-value">{consultation.symptoms}</p>
            </div>
          )}
          {consultation.diagnosis && (
            <div style={{ marginBottom: "8px" }}>
              <span className="print-label">Diagnosis:</span>
              <p className="print-value" style={{ fontWeight: 600 }}>{consultation.diagnosis}</p>
            </div>
          )}
          {consultation.clinical_notes && (
            <div style={{ marginBottom: "8px" }}>
              <span className="print-label">Clinical Notes:</span>
              <p className="print-value" style={{ whiteSpace: "pre-wrap" }}>{consultation.clinical_notes}</p>
            </div>
          )}
        </div>

        {/* Prescription */}
        {prescription && prescription.items && prescription.items.length > 0 && (
          <div className="print-section">
            <div className="print-section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16pt" }}>℞</span>
              Prescription ({prescription.prescription_number})
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
            {prescription.notes && (
              <p style={{ fontSize: "9pt", color: "#666", marginTop: "8px" }}>
                <strong>Notes:</strong> {prescription.notes}
              </p>
            )}
          </div>
        )}

        {/* Follow-up */}
        {consultation.follow_up_date && (
          <div className="print-section" style={{ background: "#f0fdfa", padding: "12px", borderRadius: "4px", border: "1px solid #0d9488" }}>
            <strong style={{ color: "#0d9488" }}>Follow-up Date:</strong>{" "}
            {format(new Date(consultation.follow_up_date), "MMMM d, yyyy")}
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <div>
            <p style={{ fontSize: "9pt", color: "#666" }}>
              Generated on: {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="signature-area">
            <p style={{ fontWeight: 600 }}>Dr. {doctorProfile?.full_name || "Doctor"}</p>
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

PrintableConsultation.displayName = "PrintableConsultation";
