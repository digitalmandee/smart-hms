import { forwardRef } from "react";
import type { PurchaseOrder } from "@/hooks/usePurchaseOrders";
import type { OrganizationBranding } from "@/hooks/useOrganizationBranding";
import { format } from "date-fns";

interface PrintablePOProps {
  po: PurchaseOrder;
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

export const PrintablePO = forwardRef<HTMLDivElement, PrintablePOProps>(
  ({ po, branding, currencySymbol = "Rs." }, ref) => {
    const orgName = branding?.name || "Organization";
    const primaryColor = branding?.primary_color || "#0d9488";
    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const subtotal = po.items?.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount = itemSubtotal * (item.discount_percent / 100);
      return sum + (itemSubtotal - discount);
    }, 0) || 0;

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

        <h2 style={s.docTitle}>Purchase Order</h2>

        {/* Info Grid */}
        <div style={s.infoGrid}>
          <div style={s.infoBox}>
            <p style={s.infoLabel}>PO Number</p>
            <p style={s.infoValue}>{po.po_number}</p>
            <p style={s.infoLabel}>Order Date</p>
            <p style={s.infoValue}>{format(new Date(po.order_date), "dd MMM yyyy")}</p>
            {po.expected_delivery_date && (
              <>
                <p style={s.infoLabel}>Expected Delivery</p>
                <p style={s.infoValue}>{format(new Date(po.expected_delivery_date), "dd MMM yyyy")}</p>
              </>
            )}
            <p style={s.infoLabel}>Status</p>
            <p style={s.infoValue}>{po.status.replace("_", " ").toUpperCase()}</p>
            <p style={s.infoLabel}>Branch</p>
            <p style={s.infoValue}>{po.branch?.name || "-"}</p>
          </div>
          <div style={s.infoBox}>
            <p style={s.infoLabel}>Vendor</p>
            <p style={s.infoValue}>{po.vendor?.name || "-"}</p>
            <p style={s.infoLabel}>Vendor Code</p>
            <p style={s.infoValue}>{po.vendor?.vendor_code || "-"}</p>
            {po.vendor?.address && (
              <>
                <p style={s.infoLabel}>Address</p>
                <p style={s.infoValue}>{po.vendor.address}</p>
              </>
            )}
            {po.vendor?.phone && (
              <>
                <p style={s.infoLabel}>Phone</p>
                <p style={s.infoValue}>{po.vendor.phone}</p>
              </>
            )}
            {po.vendor?.email && (
              <>
                <p style={s.infoLabel}>Email</p>
                <p style={s.infoValue}>{po.vendor.email}</p>
              </>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th(primaryColor)}>#</th>
              <th style={s.th(primaryColor)}>Item</th>
              <th style={s.thCenter(primaryColor)}>Qty</th>
              <th style={s.thRight(primaryColor)}>Unit Price</th>
              <th style={s.thCenter(primaryColor)}>Tax %</th>
              <th style={s.thCenter(primaryColor)}>Disc %</th>
              <th style={s.thRight(primaryColor)}>Total</th>
            </tr>
          </thead>
          <tbody>
            {po.items?.map((item, index) => (
              <tr key={item.id || index} style={index % 2 === 1 ? s.rowEven : undefined}>
                <td style={s.td}>{index + 1}</td>
                <td style={s.td}>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {item.item_type === "medicine" ? item.medicine?.name : item.item?.name || "Unknown Item"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#888" }}>
                      {item.item_type === "medicine" ? item.medicine?.generic_name : item.item?.item_code}
                    </div>
                  </div>
                </td>
                <td style={s.tdCenter}>
                  {item.quantity} {item.item_type === "medicine" ? item.medicine?.unit : item.item?.unit_of_measure}
                </td>
                <td style={s.tdRight}>{fc(item.unit_price)}</td>
                <td style={s.tdCenter}>{item.tax_percent}%</td>
                <td style={s.tdCenter}>{item.discount_percent}%</td>
                <td style={s.tdRight}>{fc(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={s.totalBox}>
          <div style={s.totalInner}>
            <div style={s.totalRow}>
              <span>Subtotal:</span>
              <span>{fc(subtotal)}</span>
            </div>
            <div style={s.totalRow}>
              <span>Tax:</span>
              <span>{fc(po.tax_amount)}</span>
            </div>
            <div style={s.totalRow}>
              <span>Discount:</span>
              <span>{fc(po.discount_amount)}</span>
            </div>
            <div style={s.totalRowBold(primaryColor)}>
              <span>Grand Total:</span>
              <span>{fc(po.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {po.terms && (
          <div style={s.notesBox}>
            <p style={s.notesTitle}>Terms & Conditions</p>
            <p style={s.notesText}>{po.terms}</p>
          </div>
        )}

        {/* Notes */}
        {po.notes && (
          <div style={s.notesBox}>
            <p style={s.notesTitle}>Notes</p>
            <p style={s.notesText}>{po.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div style={s.sigGrid}>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Prepared By</p>
              <p style={s.sigName}>{po.created_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Approved By</p>
              <p style={s.sigName}>{po.approved_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div style={s.sigBlock}>
            <div style={s.sigLine}>
              <p style={s.sigLabel}>Vendor Signature</p>
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

PrintablePO.displayName = "PrintablePO";
