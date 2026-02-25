import { forwardRef } from "react";
import { format } from "date-fns";
import { generateVisitId } from "@/lib/visit-id";
import { formatTokenDisplay } from "@/lib/opd-token";
import React from "react";

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
  logo_url?: string | null;
}

interface PrintableTokenSlipProps {
  appointment: Appointment;
  patient: Patient;
  doctor?: Doctor | null;
  organization?: Organization;
  customMessage?: string;
  customFooter?: string;
  showQR?: boolean;
  primaryColor?: string;
  departmentCode?: string | null;
  departmentName?: string | null;
}

const priorityLabels: Record<number, string> = {
  0: "NORMAL",
  1: "URGENT",
  2: "EMERGENCY",
};

const priorityColors: Record<number, string> = {
  0: "#d1fae5", // green
  1: "#fef3c7", // amber
  2: "#fee2e2", // red
};

const formatTime = (time: string | null): string => {
  if (!time) return "Walk-in";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const styles: Record<string, React.CSSProperties> = {
  // Wrapper for screen (hidden) - actual print styles applied via print:block
  wrapper: {
    display: "none",
  },
  container: {
    backgroundColor: "white",
    margin: "0 auto",
    padding: "16px",
    width: "80mm",
    fontSize: "12px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    borderBottom: "2px solid black",
    paddingBottom: "8px",
    marginBottom: "12px",
  },
  logo: {
    height: "40px",
    margin: "0 auto 8px",
    objectFit: "contain",
    display: "block",
  },
  orgName: {
    fontSize: "14px",
    fontWeight: "bold",
    margin: 0,
  },
  orgDetails: {
    fontSize: "10px",
    color: "#4b5563",
    margin: "2px 0 0",
  },
  tokenTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "12px",
    padding: "4px 0",
    fontSize: "14px",
    border: "2px solid black",
    backgroundColor: "#f0f0f0",
  },
  tokenNumber: {
    textAlign: "center",
    padding: "16px 0",
    marginBottom: "12px",
    fontSize: "48px",
    fontWeight: "bold",
    fontFamily: "monospace",
    lineHeight: 1,
    border: "1px dashed #666",
  },
  priorityBadge: {
    display: "inline-block",
    padding: "4px 12px",
    fontWeight: "bold",
    fontSize: "10px",
    border: "1px solid black",
    textAlign: "center",
  },
  priorityContainer: {
    textAlign: "center",
    marginBottom: "12px",
  },
  infoSection: {
    marginBottom: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "11px",
  },
  infoLabel: {
    color: "#6b7280",
  },
  infoValue: {
    fontWeight: 500,
    textAlign: "right",
  },
  infoValueMono: {
    fontFamily: "monospace",
    fontWeight: 500,
    textAlign: "right",
  },
  instructionsSection: {
    textAlign: "center",
    padding: "8px 0",
    borderTop: "1px dashed #9ca3af",
    fontSize: "10px",
  },
  instructionsText: {
    fontWeight: 500,
    margin: "0 0 4px",
  },
  subText: {
    color: "#6b7280",
    margin: 0,
  },
  timestamp: {
    textAlign: "center",
    marginTop: "8px",
    fontSize: "9px",
    color: "#9ca3af",
  },
  footer: {
    textAlign: "center",
    fontSize: "9px",
    color: "#6b7280",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px dashed #9ca3af",
  },
};

export const PrintableTokenSlip = forwardRef<HTMLDivElement, PrintableTokenSlipProps>(
  (
    {
      appointment,
      patient,
      doctor,
      organization,
      customMessage,
      customFooter,
      showQR = false,
      primaryColor,
      departmentCode,
      departmentName,
    },
    ref
  ) => {
    const priority = appointment.priority ?? 0;
    const fullName = `${patient.first_name} ${patient.last_name || ""}`.trim();
    const tokenNumber = appointment.token_number || null;
    const tokenDisplay = formatTokenDisplay(tokenNumber, departmentCode);
    
    // Generate Visit ID
    const visitId = generateVisitId({
      appointment_date: appointment.appointment_date,
      token_number: appointment.token_number,
    });

    const accentStyle: React.CSSProperties = primaryColor
      ? { borderColor: primaryColor }
      : {};

    return (
      <div ref={ref} style={styles.wrapper} className="hidden print:block">
        <div style={styles.container}>
          {/* Header */}
          <div style={{ ...styles.header, ...accentStyle }}>
            {organization?.logo_url && (
              <img
                src={organization.logo_url}
                alt={organization.name}
                style={styles.logo}
                crossOrigin="anonymous"
              />
            )}
            <p style={styles.orgName}>{organization?.name || "Medical Center"}</p>
            {organization?.address && (
              <p style={styles.orgDetails}>{organization.address}</p>
            )}
            {organization?.phone && (
              <p style={styles.orgDetails}>Tel: {organization.phone}</p>
            )}
          </div>

          {/* OPD Token Title */}
          <div style={styles.tokenTitle}>
            OPD TOKEN{departmentName ? ` — ${departmentName}` : ''}
          </div>

          {/* Large Token Number */}
          <div style={styles.tokenNumber}>{tokenDisplay}</div>
          
          {/* Visit ID */}
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", color: "#6b7280", margin: 0 }}>Visit ID</p>
            <p style={{ fontSize: "12px", fontWeight: 600, fontFamily: "monospace", margin: "2px 0 0" }}>{visitId}</p>
          </div>

          {/* Priority Badge */}
          <div style={styles.priorityContainer}>
            <span
              style={{
                ...styles.priorityBadge,
                backgroundColor: priorityColors[priority] || priorityColors[0],
              }}
            >
              {priorityLabels[priority] || "NORMAL"}
            </span>
          </div>

          {/* Patient Details */}
          <div style={styles.infoSection}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Patient:</span>
              <span style={styles.infoValue}>{fullName}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>MR#:</span>
              <span style={styles.infoValueMono}>{patient.patient_number}</span>
            </div>
            {doctor && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Doctor:</span>
                <span style={styles.infoValue}>
                  Dr. {doctor.profile?.full_name || "N/A"}
                </span>
              </div>
            )}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Date:</span>
              <span style={styles.infoValue}>
                {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Time:</span>
              <span style={styles.infoValue}>
                {formatTime(appointment.appointment_time)}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Type:</span>
              <span style={{ ...styles.infoValue, textTransform: "capitalize" }}>
                {appointment.appointment_type?.replace("_", " ") || "OPD"}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div style={styles.instructionsSection}>
            <p style={styles.instructionsText}>
              {customMessage || "Please wait for your number to be called"}
            </p>
            <p style={styles.subText}>
              {customFooter || "Keep this slip for reference"}
            </p>
          </div>

          {/* Timestamp */}
          <div style={styles.timestamp}>
            Printed: {format(new Date(), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
      </div>
    );
  }
);

PrintableTokenSlip.displayName = "PrintableTokenSlip";
