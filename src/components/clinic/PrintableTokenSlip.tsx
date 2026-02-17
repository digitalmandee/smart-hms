import { forwardRef } from "react";
import { format } from "date-fns";
import { generateQRCodeUrl, getAppointmentVerificationUrl } from "@/lib/qrcode";
import { generateVisitId } from "@/lib/visit-id";
import React from "react";

interface PrintableTokenSlipProps {
  tokenNumber: number;
  appointmentDate?: string;
  patient: {
    name: string;
    mrNumber?: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
  invoiceNumber?: string;
  amountPaid?: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "waived";
  organization: {
    name: string;
    address?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    slug?: string;
  };
  tokenDisplay?: string;
  showQR?: boolean;
  showPayment?: boolean;
  customMessage?: string;
  customFooter?: string;
  primaryColor?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "white",
    padding: "16px",
    maxWidth: "80mm",
    margin: "0 auto",
    fontSize: "12px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    borderBottom: "2px dashed black",
    paddingBottom: "12px",
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
    marginBottom: "12px",
  },
  tokenLabel: {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  tokenNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "16px 0",
    fontFamily: "monospace",
    lineHeight: 1,
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
    textAlign: "right",
  },
  dashedBorder: {
    borderTop: "1px dashed #9ca3af",
    paddingTop: "8px",
    marginTop: "8px",
    marginBottom: "12px",
  },
  paymentSection: {
    borderTop: "1px dashed #9ca3af",
    paddingTop: "8px",
    marginBottom: "12px",
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "11px",
  },
  paymentAmount: {
    fontWeight: "bold",
  },
  qrSection: {
    textAlign: "center",
    borderTop: "1px dashed #9ca3af",
    paddingTop: "12px",
    marginTop: "12px",
  },
  qrImage: {
    width: "80px",
    height: "80px",
    margin: "0 auto",
    display: "block",
  },
  qrLabel: {
    fontSize: "9px",
    color: "#9ca3af",
    marginTop: "4px",
  },
  dateTimeSection: {
    textAlign: "center",
    fontSize: "10px",
    borderTop: "1px dashed #9ca3af",
    paddingTop: "8px",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    fontSize: "9px",
    color: "#6b7280",
    marginTop: "12px",
    paddingTop: "8px",
    borderTop: "1px dashed #9ca3af",
  },
};

export const PrintableTokenSlip = forwardRef<HTMLDivElement, PrintableTokenSlipProps>(
  (
    {
      tokenNumber,
      appointmentDate,
      patient,
      doctor,
      invoiceNumber,
      amountPaid,
      paymentMethod,
      paymentStatus = "paid",
      organization,
      tokenDisplay,
      showQR = true,
      showPayment = true,
      customMessage,
      customFooter,
      primaryColor,
    },
    ref
  ) => {
    const qrData = getAppointmentVerificationUrl(tokenNumber, organization.slug);
    const currentDate = format(new Date(), "dd MMM yyyy");
    const currentTime = format(new Date(), "hh:mm a");
    
    // Generate Visit ID for display
    const visitId = generateVisitId({
      appointment_date: appointmentDate || format(new Date(), "yyyy-MM-dd"),
      token_number: tokenNumber,
    });

    const accentStyle: React.CSSProperties = primaryColor
      ? { borderColor: primaryColor }
      : {};

    return (
      <div ref={ref} style={styles.container}>
        {/* Header with Organization Branding */}
        <div style={{ ...styles.header, ...accentStyle }}>
          {organization.logo_url && (
            <img
              src={organization.logo_url}
              alt={organization.name}
              style={styles.logo}
              crossOrigin="anonymous"
            />
          )}
          <p style={styles.orgName}>{organization.name}</p>
          {organization.address && <p style={styles.orgDetails}>{organization.address}</p>}
          {organization.phone && <p style={styles.orgDetails}>Tel: {organization.phone}</p>}
        </div>

        {/* Token Title */}
        <div style={styles.tokenTitle}>
          <p style={styles.tokenLabel}>OPD Token</p>
        </div>

        {/* Large Token Number */}
        <div style={styles.tokenNumber}>{tokenDisplay || `#${tokenNumber}`}</div>
        
        {/* Visit ID */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", color: "#6b7280", margin: 0 }}>Visit ID</p>
          <p style={{ fontSize: "12px", fontWeight: 600, fontFamily: "monospace", margin: "2px 0 0" }}>{visitId}</p>
        </div>

        {/* Patient & Doctor Info */}
        <div style={styles.infoSection}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Patient:</span>
            <span style={styles.infoValue}>{patient.name}</span>
          </div>
          {patient.mrNumber && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>MR#:</span>
              <span style={styles.infoValueMono}>{patient.mrNumber}</span>
            </div>
          )}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Doctor:</span>
            <span style={styles.infoValue}>{doctor.name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Specialty:</span>
            <span style={styles.infoValue}>{doctor.specialty}</span>
          </div>
        </div>

        {/* Payment Info */}
        {showPayment && (
          <div style={styles.paymentSection}>
            {paymentStatus === "paid" && invoiceNumber ? (
              <>
                <div style={styles.paymentRow}>
                  <span style={styles.infoLabel}>Invoice:</span>
                  <span style={styles.infoValueMono}>{invoiceNumber}</span>
                </div>
                {amountPaid !== undefined && (
                  <div style={styles.paymentRow}>
                    <span style={styles.infoLabel}>Paid:</span>
                    <span style={styles.paymentAmount}>Rs. {amountPaid.toLocaleString()}</span>
                  </div>
                )}
                {paymentMethod && (
                  <div style={styles.paymentRow}>
                    <span style={styles.infoLabel}>Method:</span>
                    <span style={{ ...styles.infoValue, textTransform: "capitalize" }}>
                      {paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                )}
              </>
            ) : paymentStatus === "pending" ? (
              <div style={{ 
                backgroundColor: "#fef3c7", 
                border: "1px solid #f59e0b", 
                padding: "8px", 
                borderRadius: "4px",
                textAlign: "center" 
              }}>
                <p style={{ margin: 0, fontWeight: "bold", color: "#b45309", fontSize: "11px" }}>
                  ⚠️ PAYMENT PENDING
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#92400e" }}>
                  Please pay at billing counter after consultation
                </p>
              </div>
            ) : paymentStatus === "waived" ? (
              <div style={{ 
                backgroundColor: "#f3f4f6", 
                border: "1px solid #9ca3af", 
                padding: "8px", 
                borderRadius: "4px",
                textAlign: "center" 
              }}>
                <p style={{ margin: 0, fontWeight: "bold", color: "#4b5563", fontSize: "11px" }}>
                  ✓ FEE WAIVED
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#6b7280" }}>
                  Consultation fee has been waived
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* QR Code */}
        {showQR && (
          <div style={styles.qrSection}>
            <img
              src={generateQRCodeUrl(qrData, 80)}
              alt="Token QR Code"
              style={styles.qrImage}
            />
            <p style={styles.qrLabel}>Scan to verify</p>
          </div>
        )}

        {/* Date/Time */}
        <div style={styles.dateTimeSection}>
          <p style={{ margin: 0 }}>
            <strong>Date:</strong> {currentDate} &nbsp;|&nbsp;
            <strong>Time:</strong> {currentTime}
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ margin: 0 }}>
            {customMessage || "Please wait for your token to be called"}
          </p>
          {customFooter && (
            <p style={{ margin: "4px 0 0", fontSize: "8px" }}>{customFooter}</p>
          )}
        </div>
      </div>
    );
  }
);

PrintableTokenSlip.displayName = "PrintableTokenSlip";
