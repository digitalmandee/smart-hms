import { forwardRef } from "react";
import type { GoodsReceivedNote } from "@/hooks/useGRN";
import type { OrganizationBranding } from "@/hooks/useOrganizationBranding";
import { format } from "date-fns";

interface PrintableGRNProps {
  grn: GoodsReceivedNote;
  branding?: OrganizationBranding;
  currencySymbol?: string;
}

const s = {
  page: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#1a1a1a", fontSize: "13px", lineHeight: "1.5", padding: "32px", maxWidth: "800px", margin: "0 auto" } as React.CSSProperties,
  headerRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" } as React.CSSProperties,
  logo: { width: "64px", height: "64px", objectFit: "contain", borderRadius: "4px" } as React.CSSProperties,
  orgName: { fontSize: "22px", fontWeight: 700, margin: 0, color: "#0d9488" } as React.CSSProperties,
  orgDetail: { fontSize: "11px", color: "#666", margin: 0 } as React.CSSProperties,
  accentBar: (color: string) => ({ height: "3px", background: color, margin: "12px 0 16px" }) as React.CSSProperties,
  docTitle: { textAlign: "center" as const, fontSize: "16px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 16px", textTransform: "uppercase" as const },
  infoGrid: { display: "flex", justifyContent: "space-between", marginBottom: "20px" } as React.CSSProperties,
  infoBox: { border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px 16px", flex: "0 0 48%" } as React.CSSProperties,
  infoLabel: { fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, margin: "0 0 2px" },
  infoValue: { fontSize: "13px", margin: "0 0 6px", fontWeight: 500 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: "20px", fontSize: "12px" },
  th: (color: string) => ({ background: color, color: "#fff", padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.5px" }),
  thRight: (color: string) => ({ background: color, color: "#fff", padding: "8px 10px", textAlign: "right" as const, fontWeight: 600, fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.5px" }),
  thCenter: (color: string) => ({ background: color, color: "#fff", padding: "8px 10px", textAlign: "center" as const, fontWeight: 600, fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.5px" }),
  td: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0" } as React.CSSProperties,
  tdRight: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "right" as const },
  tdCenter: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" as const },
  rowEven: { background: "#f8fafc" } as React.CSSProperties,
  totalBox: { display: "flex", justifyContent: "flex-end", marginBottom: "20px" } as React.CSSProperties,
  totalInner: { width: "260px", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" } as React.CSSProperties,
  totalRow: { display: "flex", justifyContent: "space-between", padding: "8px 14px", fontSize: "13px" } as React.CSSProperties,
  totalRowBold: (color: string) => ({ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: "14px", fontWeight: 700, background: color, color: "#fff" }) as React.CSSProperties,
  sigGrid: { display: "flex", justifyContent: "space-between", marginTop: "48px", gap: "24px" } as React.CSSProperties,
  sigBlock: { flex: 1, textAlign: "center" as const },
  sigLine: { borderTop: "1px solid #333", marginTop: "48px", paddingTop: "8px" } as React.CSSProperties,
  sigLabel: { fontSize: "12px", fontWeight: 600, margin: 0 } as React.CSSProperties,
  sigName: { fontSize: "11px", color: "#666", margin: "2px 0 0" } as React.CSSProperties,
  footer: { textAlign: "center" as const, fontSize: "10px", color: "#94a3b8", borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "32px" },
  notesBox: { border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px" } as React.CSSProperties,
  notesTitle: { fontSize: "12px", fontWeight: 600, margin: "0 0 4px" } as React.CSSProperties,
  notesText: { fontSize: "12px", color: "#555", margin: 0, whiteSpace: "pre-line" as const },
};

export const PrintableGRN = forwardRef<HTMLDivElement, PrintableGRNProps>(
  ({ grn, branding, currencySymbol = "Rs." }, ref) => {
    const orgName = branding?.name || "Organization";
    const primaryColor = branding?.primary_color || "#0d9488";
    const totalValue = grn.items?.reduce((sum, item) => sum + (item.quantity_accepted * item.unit_cost), 0) || 0;
    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
      <div ref={ref} style={s.page}>
        {/* Header */}
        <div style={s.headerRow}>
          {branding?.logo_url && (
            <img src={branding.logo_url} alt="Logo" style={s.logo} />
          )}
          <div>
            <h1 style={{ ...s.orgName, color: primaryColor }}>{orgName}</h1>
            {branding?.address && <p style={s.orgDetail}>{branding.address}</p>}
            <p style={s.orgDetail}>
              {[branding?.phone, branding?.email].filter(Boolean).join(" | ")}
              {branding?.registration_number && ` | Reg: ${branding.registration_number}`}
            </p>
          </div>
        </div>
        <div style={s.accentBar(primaryColor)} />

        <h2 style={s.docTitle}>Goods Received Note</h2>

        {/* Info Grid */}
        <div style={s.infoGrid}>
          <div style={s.infoBox}>
            <p style={s.infoLabel}>GRN Number</p>
            <p style={s.infoValue}>{grn.grn_number}</p>
            <p style={s.infoLabel}>Received Date</p>
            <p style={s.infoValue}>{format(new Date(grn.received_date), "dd MMM yyyy")}</p>
            {grn.purchase_order && (
              <>
                <p style={s.infoLabel}>PO Reference</p>
                <p style={s.infoValue}>{grn.purchase_order.po_number}</p>
              </>
            )}
            <p style={s.infoLabel}>Status</p>
            <p style={s.infoValue}>{grn.status.replace("_", " ").toUpperCase()}</p>
            {grn.invoice_number && (
              <>
                <p style={s.infoLabel}>Invoice #</p>
                <p style={s.infoValue}>{grn.invoice_number}</p>
              </>
            )}
          </div>
          <div style={s.infoBox}>
            <p style={s.infoLabel}>Vendor</p>
            <p style={s.infoValue}>{grn.vendor?.name || "-"}</p>
            <p style={s.infoLabel}>Vendor Code</p>
            <p style={s.infoValue}>{grn.vendor?.vendor_code || "-"}</p>
            <p style={s.infoLabel}>Branch</p>
            <p style={s.infoValue}>{grn.branch?.name || "-"}</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th(primaryColor)}>#</th>
              <th style={s.th(primaryColor)}>Item</th>
              <th style={s.thCenter(primaryColor)}>Batch</th>
              <th style={s.thCenter(primaryColor)}>Expiry</th>
              <th style={s.thCenter(primaryColor)}>Received</th>
              <th style={s.thCenter(primaryColor)}>Accepted</th>
              <th style={s.thCenter(primaryColor)}>Rejected</th>
              <th style={s.thRight(primaryColor)}>Unit Cost</th>
              <th style={s.thRight(primaryColor)}>Value</th>
            </tr>
          </thead>
          <tbody>
            {grn.items?.map((item, index) => (
              <tr key={item.id || index} style={index % 2 === 1 ? s.rowEven : undefined}>
                <td style={s.td}>{index + 1}</td>
                <td style={s.td}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.item?.name || item.medicine?.name || "Unknown Item"}</div>
                    <div style={{ fontSize: "10px", color: "#888" }}>{item.item?.item_code || ""}</div>
                  </div>
                </td>
                <td style={s.tdCenter}>{item.batch_number || "-"}</td>
                <td style={s.tdCenter}>{item.expiry_date ? format(new Date(item.expiry_date), "MM/yyyy") : "-"}</td>
                <td style={s.tdCenter}>{item.quantity_received}</td>
                <td style={{ ...s.tdCenter, color: "#16a34a", fontWeight: 600 }}>{item.quantity_accepted}</td>
                <td style={{ ...s.tdCenter, color: "#dc2626", fontWeight: 600 }}>{item.quantity_rejected}</td>
                <td style={s.tdRight}>{fc(item.unit_cost)}</td>
                <td style={s.tdRight}>{fc(item.quantity_accepted * item.unit_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={s.totalBox}>
          <div style={s.totalInner}>
            {grn.invoice_amount != null && (
              <div style={s.totalRow}>
                <span>Invoice Amount:</span>
                <span>{fc(grn.invoice_amount)}</span>
              </div>
            )}
            <div style={s.totalRowBold(primaryColor)}>
              <span>Total Value:</span>
              <span>{fc(totalValue)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {grn.notes && (
          <div style={s.notesBox}>
            <p style={s.notesTitle}>Notes</p>
            <p style={s.notesText}>{grn.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div style={s.sigGrid}>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Received By</p>
              <p style={s.sigName}>{grn.received_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Verified By</p>
              <p style={s.sigName}>{grn.verified_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Store In-Charge</p>
              <p style={s.sigName}>&nbsp;</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <p style={{ margin: 0 }}>This is a computer-generated document and does not require a physical signature.</p>
          {branding?.address && <p style={{ margin: "4px 0 0" }}>{orgName} — {branding.address}</p>}
        </div>
      </div>
    );
  }
);

PrintableGRN.displayName = "PrintableGRN";
