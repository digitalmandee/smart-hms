import { format } from "date-fns";
import { forwardRef } from "react";

export type StatementLanguage = "en" | "ar" | "ur";

export interface StatementEntry {
  date: string;
  type: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AgingBuckets {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90_plus: number;
}

export interface StatementPDFProps {
  language: StatementLanguage;
  organizationName: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationLogoUrl?: string | null;
  statementType: "patient" | "vendor";
  partyName: string;
  partyContact?: string;
  partyAddress?: string;
  fromDate?: string;
  toDate?: string;
  entries: StatementEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  aging?: AgingBuckets;
  formatCurrency: (n: number) => string;
}

const LABELS: Record<StatementLanguage, Record<string, string>> = {
  en: {
    statement: "Statement of Account",
    patient: "Patient",
    vendor: "Vendor",
    statementDate: "Statement Date",
    period: "Period",
    to: "to",
    contact: "Contact",
    address: "Address",
    summary: "Summary",
    totalCharges: "Total Charges",
    totalPayments: "Total Payments",
    totalReceived: "Total Received",
    totalPaid: "Total Paid",
    closingBalance: "Closing Balance",
    youOwe: "Amount Due",
    weOwe: "Outstanding Payable",
    aging: "Aging Summary",
    current: "Current",
    d1_30: "1-30 Days",
    d31_60: "31-60 Days",
    d61_90: "61-90 Days",
    d90: "90+ Days",
    transactions: "Transactions",
    date: "Date",
    type: "Type",
    reference: "Reference",
    description: "Description",
    debit: "Debit",
    credit: "Credit",
    balance: "Balance",
    total: "Total",
    noTransactions: "No transactions in selected period",
    page: "Page",
    generated: "Generated",
    notice: "This is a computer-generated statement and does not require a signature.",
  },
  ar: {
    statement: "كشف حساب",
    patient: "المريض",
    vendor: "المورد",
    statementDate: "تاريخ الكشف",
    period: "الفترة",
    to: "إلى",
    contact: "جهة الاتصال",
    address: "العنوان",
    summary: "الملخص",
    totalCharges: "إجمالي الرسوم",
    totalPayments: "إجمالي المدفوعات",
    totalReceived: "إجمالي المستلم",
    totalPaid: "إجمالي المدفوع",
    closingBalance: "الرصيد الختامي",
    youOwe: "المبلغ المستحق",
    weOwe: "الذمم الدائنة",
    aging: "ملخص الأعمار",
    current: "حالي",
    d1_30: "١-٣٠ يوم",
    d31_60: "٣١-٦٠ يوم",
    d61_90: "٦١-٩٠ يوم",
    d90: "٩٠+ يوم",
    transactions: "المعاملات",
    date: "التاريخ",
    type: "النوع",
    reference: "المرجع",
    description: "الوصف",
    debit: "مدين",
    credit: "دائن",
    balance: "الرصيد",
    total: "الإجمالي",
    noTransactions: "لا توجد معاملات في الفترة المحددة",
    page: "صفحة",
    generated: "أُنشئ",
    notice: "هذا كشف مُولَّد بواسطة الكمبيوتر ولا يتطلب توقيعًا.",
  },
  ur: {
    statement: "اسٹیٹمنٹ آف اکاؤنٹ",
    patient: "مریض",
    vendor: "وینڈر",
    statementDate: "اسٹیٹمنٹ کی تاریخ",
    period: "مدت",
    to: "تک",
    contact: "رابطہ",
    address: "پتہ",
    summary: "خلاصہ",
    totalCharges: "کل چارجز",
    totalPayments: "کل ادائیگیاں",
    totalReceived: "کل وصول",
    totalPaid: "کل ادا شدہ",
    closingBalance: "اختتامی بیلنس",
    youOwe: "واجب الادا رقم",
    weOwe: "بقایا قابل ادائیگی",
    aging: "عمر کا خلاصہ",
    current: "موجودہ",
    d1_30: "۱-۳۰ دن",
    d31_60: "۳۱-۶۰ دن",
    d61_90: "۶۱-۹۰ دن",
    d90: "۹۰+ دن",
    transactions: "لین دین",
    date: "تاریخ",
    type: "قسم",
    reference: "حوالہ",
    description: "تفصیل",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    balance: "بیلنس",
    total: "کل",
    noTransactions: "منتخب مدت میں کوئی لین دین نہیں",
    page: "صفحہ",
    generated: "تیار شدہ",
    notice: "یہ کمپیوٹر سے تیار شدہ اسٹیٹمنٹ ہے اور دستخط درکار نہیں۔",
  },
};

export const StatementPDFTemplate = forwardRef<HTMLDivElement, StatementPDFProps>(
  (props, ref) => {
    const {
      language,
      organizationName,
      organizationAddress,
      organizationPhone,
      organizationEmail,
      organizationLogoUrl,
      statementType,
      partyName,
      partyContact,
      partyAddress,
      fromDate,
      toDate,
      entries,
      totalDebit,
      totalCredit,
      closingBalance,
      aging,
      formatCurrency,
    } = props;

    const L = LABELS[language];
    const isRTL = language === "ar" || language === "ur";
    const partyLabel = statementType === "patient" ? L.patient : L.vendor;
    const totalDebitLabel = statementType === "patient" ? L.totalCharges : L.totalPaid;
    const totalCreditLabel = statementType === "patient" ? L.totalPayments : L.totalReceived;
    const closingLabel = statementType === "patient" ? L.youOwe : L.weOwe;

    return (
      <div
        ref={ref}
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          width: "794px", // A4 @ 96dpi
          padding: "40px",
          fontFamily: isRTL
            ? "'Noto Sans Arabic', 'Noto Nastaliq Urdu', 'Segoe UI', sans-serif"
            : "'Inter', 'Segoe UI', sans-serif",
          color: "#0f172a",
          backgroundColor: "#ffffff",
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: "16px",
            borderBottom: "2px solid #0f172a",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {organizationLogoUrl && (
              <img
                src={organizationLogoUrl}
                alt="logo"
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
                crossOrigin="anonymous"
              />
            )}
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>{organizationName}</div>
              {organizationAddress && (
                <div style={{ fontSize: "11px", color: "#475569" }}>{organizationAddress}</div>
              )}
              <div style={{ fontSize: "11px", color: "#475569" }}>
                {[organizationPhone, organizationEmail].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <div style={{ textAlign: isRTL ? "left" : "right" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "0.5px",
              }}
            >
              {L.statement.toUpperCase()}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
              {L.statementDate}: {format(new Date(), "dd MMM yyyy")}
            </div>
            {(fromDate || toDate) && (
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {L.period}: {fromDate || "—"} {L.to} {toDate || "—"}
              </div>
            )}
          </div>
        </div>

        {/* Party Info */}
        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            backgroundColor: "#f8fafc",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {partyLabel}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{partyName}</div>
          {partyContact && (
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
              {L.contact}: {partyContact}
            </div>
          )}
          {partyAddress && (
            <div style={{ fontSize: "11px", color: "#475569" }}>
              {L.address}: {partyAddress}
            </div>
          )}
        </div>

        {/* Summary */}
        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
          }}
        >
          <SummaryCard label={totalDebitLabel} value={formatCurrency(totalDebit)} color="#0f172a" />
          <SummaryCard label={totalCreditLabel} value={formatCurrency(totalCredit)} color="#15803d" />
          <SummaryCard
            label={closingLabel}
            value={formatCurrency(Math.abs(closingBalance))}
            color={closingBalance > 0 ? "#b91c1c" : "#15803d"}
            highlight
          />
        </div>

        {/* Aging */}
        {aging && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#0f172a",
              }}
            >
              {L.aging}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "6px",
              }}
            >
              <AgingCell label={L.current} value={formatCurrency(aging.current)} bg="#dcfce7" border="#86efac" />
              <AgingCell label={L.d1_30} value={formatCurrency(aging.days1_30)} bg="#fef9c3" border="#fde047" />
              <AgingCell label={L.d31_60} value={formatCurrency(aging.days31_60)} bg="#ffedd5" border="#fdba74" />
              <AgingCell label={L.d61_90} value={formatCurrency(aging.days61_90)} bg="#fee2e2" border="#fca5a5" />
              <AgingCell label={L.d90} value={formatCurrency(aging.days90_plus)} bg="#fecaca" border="#f87171" />
            </div>
          </div>
        )}

        {/* Transactions */}
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#0f172a",
            }}
          >
            {L.transactions}
          </div>
          {entries.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                borderRadius: "6px",
                border: "1px dashed #cbd5e1",
              }}
            >
              {L.noTransactions}
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                  <th style={thStyle(isRTL)}>{L.date}</th>
                  <th style={thStyle(isRTL)}>{L.type}</th>
                  <th style={thStyle(isRTL)}>{L.reference}</th>
                  <th style={thStyle(isRTL)}>{L.description}</th>
                  <th style={{ ...thStyle(isRTL), textAlign: "right" }}>{L.debit}</th>
                  <th style={{ ...thStyle(isRTL), textAlign: "right" }}>{L.credit}</th>
                  <th style={{ ...thStyle(isRTL), textAlign: "right" }}>{L.balance}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <td style={tdStyle(isRTL)}>{e.date ? format(new Date(e.date), "dd MMM yyyy") : "—"}</td>
                    <td style={tdStyle(isRTL)}>{e.type}</td>
                    <td style={{ ...tdStyle(isRTL), fontFamily: "monospace" }}>{e.reference}</td>
                    <td style={tdStyle(isRTL)}>{e.description}</td>
                    <td style={{ ...tdStyle(isRTL), textAlign: "right" }}>
                      {e.debit > 0 ? formatCurrency(e.debit) : "—"}
                    </td>
                    <td style={{ ...tdStyle(isRTL), textAlign: "right", color: "#15803d" }}>
                      {e.credit > 0 ? formatCurrency(e.credit) : "—"}
                    </td>
                    <td
                      style={{
                        ...tdStyle(isRTL),
                        textAlign: "right",
                        fontWeight: 600,
                        color: e.balance > 0 ? "#b91c1c" : "#15803d",
                      }}
                    >
                      {formatCurrency(e.balance)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#e2e8f0", fontWeight: 700 }}>
                  <td colSpan={4} style={{ ...tdStyle(isRTL), textAlign: "right" }}>
                    {L.total}
                  </td>
                  <td style={{ ...tdStyle(isRTL), textAlign: "right" }}>{formatCurrency(totalDebit)}</td>
                  <td style={{ ...tdStyle(isRTL), textAlign: "right", color: "#15803d" }}>
                    {formatCurrency(totalCredit)}
                  </td>
                  <td
                    style={{
                      ...tdStyle(isRTL),
                      textAlign: "right",
                      color: closingBalance > 0 ? "#b91c1c" : "#15803d",
                    }}
                  >
                    {formatCurrency(closingBalance)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "12px",
            borderTop: "1px solid #cbd5e1",
            fontSize: "10px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          <div>{L.notice}</div>
          <div style={{ marginTop: "4px" }}>
            {L.generated}: {format(new Date(), "dd MMM yyyy HH:mm")}
          </div>
        </div>
      </div>
    );
  }
);

StatementPDFTemplate.displayName = "StatementPDFTemplate";

function SummaryCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "6px",
        border: highlight ? `2px solid ${color}` : "1px solid #e2e8f0",
        backgroundColor: highlight ? `${color}10` : "#ffffff",
      }}
    >
      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "18px", fontWeight: 700, color, marginTop: "4px" }}>{value}</div>
    </div>
  );
}

function AgingCell({
  label,
  value,
  bg,
  border,
}: {
  label: string;
  value: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "6px",
      }}
    >
      <div style={{ fontSize: "10px", color: "#475569" }}>{label}</div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{value}</div>
    </div>
  );
}

function thStyle(isRTL: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    textAlign: isRTL ? "right" : "left",
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  };
}

function tdStyle(isRTL: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    textAlign: isRTL ? "right" : "left",
    verticalAlign: "top",
  };
}
