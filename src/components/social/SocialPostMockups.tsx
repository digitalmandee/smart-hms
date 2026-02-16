import type { ScreenType } from "./socialPostsData";

/**
 * All mockups use INLINE STYLES only (no Tailwind)
 * because they render inside a 1080x1080 canvas for html-to-image PNG export.
 */

const s = {
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" } as React.CSSProperties,
  header: (color: string) => ({ background: color + "18", padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", fontWeight: 600, color: "#334155" }) as React.CSSProperties,
  body: { padding: "20px", display: "flex", flexDirection: "column" as const, gap: "16px" },
  statRow: { display: "flex", gap: "12px" },
  stat: (color: string) => ({ flex: 1, background: color + "15", borderRadius: "12px", padding: "14px", textAlign: "center" as const }),
  statNum: (color: string) => ({ fontSize: "28px", fontWeight: 700, color }),
  statLabel: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  fieldLabel: { fontSize: "13px", color: "#94a3b8" },
  fieldValue: { height: "36px", background: "#f1f5f9", borderRadius: "8px", padding: "0 12px", display: "flex", alignItems: "center", fontSize: "15px", color: "#334155" },
  row: (bg = "#f8fafc") => ({ background: bg, borderRadius: "10px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }) as React.CSSProperties,
  badge: (bg: string, text: string) => ({ background: bg, color: text, fontSize: "13px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px" }),
  btn: (bg: string) => ({ height: "38px", background: bg, color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 600 }),
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  dot: (color: string) => ({ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }) as React.CSSProperties,
};

// ── MODULE MOCKUPS (1-10) ──

const PatientsScreen = () => (
  <div style={s.card}>
    <div style={s.header("#0d9488")}>🏥 Patient Registration</div>
    <div style={s.body}>
      <div style={s.grid2}>
        <div style={s.field}><span style={s.fieldLabel}>First Name</span><div style={s.fieldValue}>Ahmed</div></div>
        <div style={s.field}><span style={s.fieldLabel}>Last Name</span><div style={s.fieldValue}>Khan</div></div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}><span style={s.fieldLabel}>CNIC</span><div style={s.fieldValue}>35201-1234567-1</div></div>
        <div style={s.field}><span style={s.fieldLabel}>Phone</span><div style={s.fieldValue}>+92 300 1234567</div></div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}><span style={s.fieldLabel}>Insurance</span><div style={s.fieldValue}>State Life</div></div>
        <div style={s.field}><span style={s.fieldLabel}>Policy #</span><div style={s.fieldValue}>SL-2024-78901</div></div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={s.btn("#0d9488")}>Register Patient</div>
      </div>
    </div>
  </div>
);

const AppointmentsScreen = () => (
  <div style={s.card}>
    <div style={s.header("#0284c7")}>📅 Appointments</div>
    <div style={s.body}>
      <div style={{ display: "flex", gap: "6px" }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
          <div key={d} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: "8px", fontSize: "14px", fontWeight: 600, background: i === 2 ? "#0284c7" : "#f1f5f9", color: i === 2 ? "#fff" : "#64748b" }}>{d}</div>
        ))}
      </div>
      {[
        { time: "09:00", name: "Ali Hassan", type: "Follow-up" },
        { time: "09:30", name: "Sana Riaz", type: "New" },
        { time: "10:00", name: "Usman Ahmed", type: "Walk-in" },
      ].map((a, i) => (
        <div key={i} style={s.row()}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>{a.name}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{a.time} AM</div>
          </div>
          <span style={s.badge("#e0f2fe", "#0369a1")}>{a.type}</span>
        </div>
      ))}
    </div>
  </div>
);

const OPDScreen = () => (
  <div style={s.card}>
    <div style={s.header("#7c3aed")}>🩺 Doctor Dashboard</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#7c3aed")}><div style={s.statNum("#7c3aed")}>12</div><div style={s.statLabel}>Queue</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>8</div><div style={s.statLabel}>Done</div></div>
      </div>
      <div style={{ ...s.row("#f5f3ff"), flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b" }}>Fatima Malik</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Token #5 • Fever, Headache</div>
          </div>
          <div style={s.btn("#7c3aed")}>Start</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={s.badge("#fee2e2", "#dc2626")}>⚠ Penicillin Allergy</span>
          <span style={s.badge("#fef3c7", "#b45309")}>Diabetic</span>
        </div>
      </div>
    </div>
  </div>
);

const EmergencyMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#dc2626"), background: "#fee2e2" }}>🚨 Emergency Dashboard</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#dc2626")}><div style={s.statNum("#dc2626")}>3</div><div style={s.statLabel}>Critical</div></div>
        <div style={s.stat("#d97706")}><div style={s.statNum("#d97706")}>7</div><div style={s.statLabel}>Urgent</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>12</div><div style={s.statLabel}>Stable</div></div>
      </div>
      {[
        { id: "ER-0045", patient: "Unknown Male", triage: "#dc2626", complaint: "Road accident - Multiple trauma", time: "5 min ago" },
        { id: "ER-0044", patient: "Fatima Bibi", triage: "#d97706", complaint: "Chest pain, shortness of breath", time: "18 min ago" },
      ].map((c, i) => (
        <div key={i} style={{ ...s.row(), flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={s.dot(c.triage)} />
              <span style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>{c.id}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{c.time}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>{c.patient}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>{c.complaint}</div>
        </div>
      ))}
      <div style={{ ...s.row("#dbeafe"), gap: "10px" }}>
        <span>🚑</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Incoming Ambulance</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>ETA: 3 mins • Cardiac arrest</div>
        </div>
      </div>
    </div>
  </div>
);

const PharmacyMockup = () => (
  <div style={s.card}>
    <div style={s.header("#059669")}>💊 Pharmacy Dispensing</div>
    <div style={s.body}>
      <div style={{ ...s.row("#fef3c7"), fontSize: "14px" }}>
        <span>Prescription #RX-2024-0892</span>
        <span style={s.badge("#fde68a", "#92400e")}>Pending</span>
      </div>
      {[
        { name: "Paracetamol 500mg", qty: "20 tablets", alert: false },
        { name: "Amoxicillin 250mg", qty: "14 capsules", alert: true },
      ].map((m, i) => (
        <div key={i} style={{ ...s.row(), flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>{m.qty}</div>
            </div>
            <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>In Stock</span>
          </div>
          {m.alert && (
            <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: "13px", padding: "6px 12px", borderRadius: "8px" }}>
              ⚠ Check: Patient has Penicillin allergy
            </div>
          )}
        </div>
      ))}
      <div style={s.btn("#059669")}>Dispense All</div>
    </div>
  </div>
);

const LabMockup = () => (
  <div style={s.card}>
    <div style={s.header("#0891b2")}>🧪 Laboratory Queue</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#d97706")}><div style={s.statNum("#d97706")}>8</div><div style={s.statLabel}>Pending</div></div>
        <div style={s.stat("#0891b2")}><div style={s.statNum("#0891b2")}>3</div><div style={s.statLabel}>Processing</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>15</div><div style={s.statLabel}>Done</div></div>
      </div>
      {[
        { id: "LO-0042", patient: "Ahmed Khan", tests: "CBC, LFT, RFT", priority: "Urgent", btn: "Enter Results" },
        { id: "LO-0041", patient: "Fatima Malik", tests: "Thyroid Panel", priority: "Normal", btn: "View Report" },
      ].map((l, i) => (
        <div key={i} style={{ ...s.row(), flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>{l.id}</span>
            <span style={s.badge(l.priority === "Urgent" ? "#fee2e2" : "#f1f5f9", l.priority === "Urgent" ? "#dc2626" : "#64748b")}>{l.priority}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{l.patient}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>{l.tests}</div>
          <div style={s.btn(i === 0 ? "#0891b2" : "#94a3b8")}>{l.btn}</div>
        </div>
      ))}
    </div>
  </div>
);

const OTMockup = () => (
  <div style={s.card}>
    <div style={s.header("#ea580c")}>✂️ Operation Theatre</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#ea580c")}><div style={s.statNum("#ea580c")}>4</div><div style={s.statLabel}>OT Rooms</div></div>
        <div style={s.stat("#d97706")}><div style={s.statNum("#d97706")}>2</div><div style={s.statLabel}>In Use</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>2</div><div style={s.statLabel}>Free</div></div>
      </div>
      {[
        { ot: "OT-1", patient: "Ahmed Khan", surgery: "Appendectomy", time: "10:00 AM", status: "In Progress", statusColor: "#d97706" },
        { ot: "OT-2", patient: "Fatima Malik", surgery: "Cataract Surgery", time: "2:00 PM", status: "Pre-Op", statusColor: "#0284c7" },
      ].map((s2, i) => (
        <div key={i} style={{ ...s.row(), flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={s.badge("#fff7ed", "#ea580c")}>{s2.ot}</span>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>{s2.time}</span>
            </div>
            <span style={s.badge(s2.statusColor + "20", s2.statusColor)}>{s2.status}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{s2.patient}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>{s2.surgery}</div>
        </div>
      ))}
    </div>
  </div>
);

const IPDMockup = () => (
  <div style={s.card}>
    <div style={s.header("#4f46e5")}>🏨 IPD Dashboard</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#4f46e5")}><div style={s.statNum("#4f46e5")}>48</div><div style={s.statLabel}>Total Beds</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>36</div><div style={s.statLabel}>Occupied</div></div>
        <div style={s.stat("#94a3b8")}><div style={s.statNum("#64748b")}>12</div><div style={s.statLabel}>Available</div></div>
      </div>
      {[
        { room: "Room 201", patient: "Ahmed Khan", doctor: "Dr. Ali Ahmed", day: 3, status: "Pending" },
        { room: "Room 105", patient: "Fatima Malik", doctor: "Dr. Sara Khan", day: 5, status: "Completed" },
      ].map((r, i) => (
        <div key={i} style={s.row()}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>{r.patient}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{r.room} • {r.doctor}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={s.badge(r.status === "Completed" ? "#dcfce7" : "#fef3c7", r.status === "Completed" ? "#16a34a" : "#d97706")}>{r.status}</span>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Day {r.day}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AccountsMockup = () => (
  <div style={s.card}>
    <div style={s.header("#475569")}>📊 Accounts Dashboard</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>Rs. 1.2M</div><div style={s.statLabel}>Receivables</div></div>
        <div style={s.stat("#dc2626")}><div style={s.statNum("#dc2626")}>Rs. 450K</div><div style={s.statLabel}>Payables</div></div>
      </div>
      {[
        { type: "+", desc: "Patient Payment", ref: "INV-1234", amount: "5,500", color: "#16a34a" },
        { type: "-", desc: "Supplier Payment", ref: "PO-0892", amount: "12,000", color: "#dc2626" },
        { type: "+", desc: "Insurance Claim", ref: "CLM-456", amount: "25,000", color: "#16a34a" },
      ].map((t, i) => (
        <div key={i} style={s.row()}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: t.color }}>{t.type}</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{t.desc}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.ref}</div>
            </div>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: t.color }}>Rs. {t.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const ProcurementMockup = () => (
  <div style={s.card}>
    <div style={s.header("#65a30d")}>🚚 Procurement Workflow</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#d97706")}><div style={s.statNum("#d97706")}>5</div><div style={s.statLabel}>Pending POs</div></div>
        <div style={s.stat("#0284c7")}><div style={s.statNum("#0284c7")}>3</div><div style={s.statLabel}>Awaiting GRN</div></div>
      </div>
      {[
        { po: "PO-0156", vendor: "Medical Supplies Ltd", items: "Syringes, Gloves", amount: "85,000", stage: "GRN Pending", stageColor: "#d97706" },
        { po: "PO-0155", vendor: "Pharma Distributors", items: "Paracetamol, Amoxicillin", amount: "125,000", stage: "Payment Due", stageColor: "#dc2626" },
      ].map((o, i) => (
        <div key={i} style={{ ...s.row(), flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>{o.po}</span>
            <span style={s.badge(o.stageColor + "20", o.stageColor)}>{o.stage}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{o.vendor}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>{o.items}</div>
          <div style={{ fontSize: "15px", fontWeight: 700, textAlign: "right" }}>Rs. {o.amount}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── AI MOCKUPS (11-15) ──

const AIChatMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#ec4899"), background: "#fce7f3" }}>🤖 Tabeebi AI Assistant</div>
    <div style={s.body}>
      <div style={{ background: "#fce7f3", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#9d174d", maxWidth: "85%" }}>
        Hello! I'm Tabeebi. How can I help you today? آپ کی کیا تکلیف ہے؟
      </div>
      <div style={{ background: "#f1f5f9", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#334155", maxWidth: "80%", alignSelf: "flex-end" }}>
        Mujhe sar mein dard hai aur bukhar bhi hai
      </div>
      <div style={{ background: "#fce7f3", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#9d174d", maxWidth: "85%" }}>
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>📋 Assessment Summary</div>
        <div>• Symptoms: Headache, Fever</div>
        <div>• Duration: How long?</div>
        <div>• Severity: Moderate</div>
        <div style={{ marginTop: "8px", fontWeight: 600 }}>Recommended: Visit OPD</div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, ...s.btn("#ec4899") }}>Urdu 🇵🇰</div>
        <div style={{ flex: 1, ...s.btn("#94a3b8") }}>English</div>
      </div>
    </div>
  </div>
);

const AIAlertsMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#e11d48"), background: "#ffe4e6" }}>🛡️ Drug Interaction Alerts</div>
    <div style={s.body}>
      <div style={{ background: "#fee2e2", borderRadius: "12px", padding: "16px", borderLeft: "4px solid #dc2626" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#dc2626", marginBottom: "6px" }}>⚠ CRITICAL ALERT</div>
        <div style={{ fontSize: "14px", color: "#7f1d1d" }}>Amoxicillin + Penicillin Allergy detected</div>
        <div style={{ fontSize: "13px", color: "#991b1b", marginTop: "4px" }}>Patient: Ahmed Khan • MRN: P-2024-0123</div>
      </div>
      <div style={{ background: "#fef3c7", borderRadius: "12px", padding: "16px", borderLeft: "4px solid #d97706" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#92400e" }}>⚡ Moderate Interaction</div>
        <div style={{ fontSize: "14px", color: "#78350f" }}>Metformin + Insulin — Monitor glucose levels</div>
      </div>
      <div style={{ background: "#dcfce7", borderRadius: "12px", padding: "16px", borderLeft: "4px solid #16a34a" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#166534" }}>✅ Safe to Dispense</div>
        <div style={{ fontSize: "14px", color: "#14532d" }}>Paracetamol 500mg — No interactions found</div>
      </div>
    </div>
  </div>
);

const AIPrescreenMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#c026d3"), background: "#fae8ff" }}>🧠 AI Pre-Screening</div>
    <div style={s.body}>
      <div style={s.row("#faf5ff")}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>Fatima Malik</div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>Token #5 • 35 yrs • Female</div>
        </div>
        <span style={s.badge("#fae8ff", "#c026d3")}>AI Screened</span>
      </div>
      <div style={{ background: "#faf5ff", borderRadius: "12px", padding: "16px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#86198f", marginBottom: "8px" }}>📋 AI Summary for Doctor</div>
        <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
          <div>• Chief Complaint: Fever (3 days), Headache</div>
          <div>• Vitals: BP 120/80, Temp 101°F, HR 88</div>
          <div>• History: Diabetic, Penicillin allergy</div>
          <div>• AI Triage: <span style={{ fontWeight: 600, color: "#d97706" }}>Moderate Priority</span></div>
        </div>
      </div>
      <div style={s.btn("#c026d3")}>Doctor Review →</div>
    </div>
  </div>
);

const AIBillingMockup = () => (
  <div style={s.card}>
    <div style={s.header("#7c3aed")}>🧾 AI Billing Codes</div>
    <div style={s.body}>
      <div style={{ background: "#f5f3ff", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#4c1d95" }}>
        <div style={{ fontWeight: 600, marginBottom: "4px" }}>Clinical Note:</div>
        <div>"Patient presents with acute appendicitis, recommended appendectomy"</div>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#7c3aed" }}>🤖 AI Suggested Codes:</div>
      {[
        { code: "K35.80", desc: "Acute appendicitis, unspecified", confidence: "98%" },
        { code: "0DTJ4ZZ", desc: "Resection of Appendix", confidence: "95%" },
        { code: "99213", desc: "E&M Level 3", confidence: "92%" },
      ].map((c, i) => (
        <div key={i} style={s.row()}>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", color: "#7c3aed" }}>{c.code}</span>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{c.desc}</div>
          </div>
          <span style={s.badge("#dcfce7", "#16a34a")}>{c.confidence}</span>
        </div>
      ))}
    </div>
  </div>
);

const AIAnalyticsMockup = () => (
  <div style={s.card}>
    <div style={s.header("#9333ea")}>📈 Predictive Analytics</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#9333ea")}><div style={s.statNum("#9333ea")}>↑ 18%</div><div style={s.statLabel}>Revenue Trend</div></div>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>92%</div><div style={s.statLabel}>Bed Util.</div></div>
      </div>
      <div style={{ background: "#faf5ff", borderRadius: "12px", padding: "16px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#7e22ce", marginBottom: "8px" }}>🔮 AI Predictions</div>
        <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.8" }}>
          <div>📊 Next week: ~145 OPD visits expected</div>
          <div>🏥 ICU beds: High demand Thu-Sat</div>
          <div>💰 Revenue forecast: Rs. 2.8M this month</div>
          <div>⚠ Supply alert: Gloves reorder by Wed</div>
        </div>
      </div>
    </div>
  </div>
);

// ── WORKFLOW MOCKUPS (16-20) ──

const WorkflowSteps = ({ steps, color }: { steps: { label: string; icon: string }[]; color: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    {steps.map((step, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
          {step.icon}
        </div>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#334155", minWidth: "120px" }}>{step.label}</span>
      </div>
    ))}
  </div>
);

const WorkflowOPDMockup = () => (
  <div style={s.card}>
    <div style={s.header("#2563eb")}>🔄 OPD Patient Flow</div>
    <div style={s.body}>
      <WorkflowSteps color="#2563eb" steps={[
        { icon: "1", label: "Registration" },
        { icon: "2", label: "Token & Queue" },
        { icon: "3", label: "AI Pre-Screen" },
        { icon: "4", label: "Consultation" },
        { icon: "5", label: "Prescription" },
        { icon: "6", label: "Billing" },
      ]} />
      <div style={{ ...s.row("#dbeafe"), fontSize: "14px", color: "#1d4ed8", fontWeight: 600, justifyContent: "center" }}>
        ⏱ Average: 15 minutes end-to-end
      </div>
    </div>
  </div>
);

const WorkflowProcurementMockup = () => (
  <div style={s.card}>
    <div style={s.header("#059669")}>📦 Procurement Cycle</div>
    <div style={s.body}>
      <WorkflowSteps color="#059669" steps={[
        { icon: "1", label: "Requisition" },
        { icon: "2", label: "Approval" },
        { icon: "3", label: "Purchase Order" },
        { icon: "4", label: "GRN" },
        { icon: "5", label: "3-Way Match" },
        { icon: "6", label: "Payment" },
      ]} />
      <div style={{ ...s.row("#dcfce7"), fontSize: "14px", color: "#166534", fontWeight: 600, justifyContent: "center" }}>
        ✅ Fully automated with audit trail
      </div>
    </div>
  </div>
);

const WorkflowRxMockup = () => (
  <div style={s.card}>
    <div style={s.header("#0d9488")}>💊 Prescription Flow</div>
    <div style={s.body}>
      <WorkflowSteps color="#0d9488" steps={[
        { icon: "1", label: "Doctor Prescribes" },
        { icon: "2", label: "Pharmacy Receives" },
        { icon: "3", label: "Stock Checked" },
        { icon: "4", label: "Dispensed" },
        { icon: "5", label: "Auto Billed" },
      ]} />
      <div style={{ ...s.row("#ccfbf1"), fontSize: "14px", color: "#0f766e", fontWeight: 600, justifyContent: "center" }}>
        🔗 Seamless doctor-to-pharmacy link
      </div>
    </div>
  </div>
);

const WorkflowBloodMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#dc2626"), background: "#fee2e2" }}>🩸 Blood Bank Flow</div>
    <div style={s.body}>
      <WorkflowSteps color="#dc2626" steps={[
        { icon: "1", label: "Donation" },
        { icon: "2", label: "Testing" },
        { icon: "3", label: "Cross-Match" },
        { icon: "4", label: "Issue" },
        { icon: "5", label: "Transfusion" },
      ]} />
      <div style={{ ...s.row("#fee2e2"), fontSize: "14px", color: "#991b1b", fontWeight: 600, justifyContent: "center" }}>
        🛡️ Zero-error verification at every step
      </div>
    </div>
  </div>
);

const WorkflowNursingMockup = () => (
  <div style={s.card}>
    <div style={s.header("#0284c7")}>👩‍⚕️ Nurse Shift Handover</div>
    <div style={s.body}>
      {[
        { task: "Vitals check — Bed 101", time: "8:00 AM", done: true },
        { task: "Medication: Insulin — Bed 103", time: "10:00 AM", done: true },
        { task: "Wound dressing — Bed 105", time: "11:00 AM", done: false },
      ].map((t, i) => (
        <div key={i} style={s.row()}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: t.done ? "#16a34a" : "#e2e8f0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
              {t.done ? "✓" : ""}
            </div>
            <span style={{ fontSize: "14px", fontWeight: 500, color: t.done ? "#94a3b8" : "#1e293b", textDecoration: t.done ? "line-through" : "none" }}>{t.task}</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t.time}</span>
        </div>
      ))}
      <div style={{ background: "#fee2e2", borderRadius: "12px", padding: "14px", borderLeft: "4px solid #dc2626" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>⚠ Vital Alert — Bed 105</div>
        <div style={{ fontSize: "13px", color: "#7f1d1d" }}>High BP: 160/100 mmHg</div>
      </div>
      <div style={s.btn("#0284c7")}>Complete Handover</div>
    </div>
  </div>
);

// ── STATS MOCKUPS (21-25) ──

const StatSpeedMockup = () => (
  <div style={s.card}>
    <div style={s.header("#d97706")}>⚡ Speed Impact</div>
    <div style={s.body}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#dc2626", textDecoration: "line-through" }}>45</div>
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>minutes before</div>
          </div>
          <div style={{ fontSize: "32px", color: "#d97706" }}>→</div>
          <div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#16a34a" }}>15</div>
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>minutes now</div>
          </div>
        </div>
      </div>
      <div style={{ ...s.row("#fef3c7"), justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#92400e" }}>
        3x Faster Patient Throughput
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#16a34a")}><div style={s.statNum("#16a34a")}>AI</div><div style={s.statLabel}>Pre-screening</div></div>
        <div style={s.stat("#0284c7")}><div style={s.statNum("#0284c7")}>Live</div><div style={s.statLabel}>Queue Display</div></div>
        <div style={s.stat("#d97706")}><div style={s.statNum("#d97706")}>0</div><div style={s.statLabel}>Paper Forms</div></div>
      </div>
    </div>
  </div>
);

const StatModulesMockup = () => (
  <div style={s.card}>
    <div style={s.header("#0d9488")}>🧩 Platform Overview</div>
    <div style={s.body}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px", fontWeight: 800, color: "#0d9488" }}>20+</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>Modules • 1 Platform</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {["OPD", "IPD", "ER", "Lab", "Pharmacy", "OT", "HR", "Accounts", "Blood Bank"].map((m) => (
          <div key={m} style={{ background: "#f0fdfa", borderRadius: "8px", padding: "10px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#0f766e" }}>{m}</div>
        ))}
      </div>
      <div style={{ ...s.row("#ccfbf1"), justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#0f766e" }}>
        Zero Paper • Fully Connected
      </div>
    </div>
  </div>
);

const StatNoshowMockup = () => (
  <div style={s.card}>
    <div style={s.header("#ea580c")}>📉 No-Show Reduction</div>
    <div style={s.body}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: "56px", fontWeight: 800, color: "#ea580c" }}>40%</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>Fewer No-Shows</div>
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#ea580c")}><div style={{ fontSize: "22px" }}>📱</div><div style={s.statLabel}>SMS Reminders</div></div>
        <div style={s.stat("#16a34a")}><div style={{ fontSize: "22px" }}>💬</div><div style={s.statLabel}>WhatsApp</div></div>
        <div style={s.stat("#0284c7")}><div style={{ fontSize: "22px" }}>🔄</div><div style={s.statLabel}>Easy Reschedule</div></div>
      </div>
    </div>
  </div>
);

const StatMatchingMockup = () => (
  <div style={s.card}>
    <div style={s.header("#059669")}>🎯 3-Way Match Accuracy</div>
    <div style={s.body}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: "56px", fontWeight: 800, color: "#059669" }}>99.5%</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>Auto Reconciliation</div>
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#059669")}><div style={{ fontSize: "16px", fontWeight: 700, color: "#059669" }}>PO</div><div style={s.statLabel}>Purchase Order</div></div>
        <div style={s.stat("#0284c7")}><div style={{ fontSize: "16px", fontWeight: 700, color: "#0284c7" }}>GRN</div><div style={s.statLabel}>Goods Receipt</div></div>
        <div style={s.stat("#d97706")}><div style={{ fontSize: "16px", fontWeight: 700, color: "#d97706" }}>INV</div><div style={s.statLabel}>Invoice</div></div>
      </div>
      <div style={{ ...s.row("#dcfce7"), justifyContent: "center", fontSize: "15px", fontWeight: 600, color: "#166534" }}>
        ✅ Virtually zero reconciliation errors
      </div>
    </div>
  </div>
);

const StatUptimeMockup = () => (
  <div style={s.card}>
    <div style={s.header("#dc2626")}>🔒 24/7 Operations</div>
    <div style={s.body}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: "56px", fontWeight: 800, color: "#dc2626" }}>24/7</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#334155" }}>Always Available</div>
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#dc2626")}><div style={{ fontSize: "22px" }}>☁️</div><div style={s.statLabel}>Cloud-Based</div></div>
        <div style={s.stat("#16a34a")}><div style={{ fontSize: "22px" }}>🔒</div><div style={s.statLabel}>Encrypted</div></div>
        <div style={s.stat("#0284c7")}><div style={{ fontSize: "22px" }}>🔄</div><div style={s.statLabel}>Auto Backup</div></div>
      </div>
    </div>
  </div>
);

// ── BRAND MOCKUPS (26-30) ──

const BrandPakistanMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#059669"), background: "#dcfce7" }}>🇵🇰 Built for Pakistan</div>
    <div style={s.body}>
      {[
        { icon: "🪪", label: "CNIC Integration", desc: "Auto-fill from national ID" },
        { icon: "💰", label: "PKR Currency", desc: "Localized billing & invoicing" },
        { icon: "🗣️", label: "Urdu Support", desc: "AI assistant speaks Urdu" },
        { icon: "📱", label: "JazzCash / Easypaisa", desc: "Mobile payments built-in" },
      ].map((f, i) => (
        <div key={i} style={s.row()}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{f.label}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{f.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BrandFutureMockup = () => (
  <div style={s.card}>
    <div style={{ ...s.header("#9333ea"), background: "#f3e8ff" }}>🚀 The Future of Healthcare</div>
    <div style={s.body}>
      <div style={s.statRow}>
        <div style={s.stat("#9333ea")}><div style={{ fontSize: "24px" }}>🤖</div><div style={s.statLabel}>AI Diagnostics</div></div>
        <div style={s.stat("#0284c7")}><div style={{ fontSize: "24px" }}>⚡</div><div style={s.statLabel}>Smart Workflows</div></div>
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#d97706")}><div style={{ fontSize: "24px" }}>📊</div><div style={s.statLabel}>Predictive Analytics</div></div>
        <div style={s.stat("#16a34a")}><div style={{ fontSize: "24px" }}>🔗</div><div style={s.statLabel}>Connected Systems</div></div>
      </div>
      <div style={{ ...s.row("#f3e8ff"), justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#7e22ce" }}>
        All in One Platform
      </div>
    </div>
  </div>
);

const BrandOrderMockup = () => (
  <div style={s.card}>
    <div style={s.header("#d97706")}>⚡ Order from Chaos</div>
    <div style={s.body}>
      {[
        { emoji: "🏥", label: "Every Department", desc: "20+ modules unified" },
        { emoji: "⏰", label: "Every Shift", desc: "24/7 cloud operations" },
        { emoji: "👤", label: "Every Patient", desc: "Complete journey tracking" },
      ].map((f, i) => (
        <div key={i} style={s.row()}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>{f.emoji}</span>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{f.label}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{f.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BrandScaleMockup = () => (
  <div style={s.card}>
    <div style={s.header("#2563eb")}>🏗️ Scales With You</div>
    <div style={s.body}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "20px", padding: "10px 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", background: "#dbeafe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🏥</div>
          <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "6px" }}>5-bed</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>Clinic</div>
        </div>
        <div style={{ fontSize: "24px", color: "#2563eb", marginBottom: "30px" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#bfdbfe", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}>🏥</div>
          <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "6px" }}>50-bed</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>Hospital</div>
        </div>
        <div style={{ fontSize: "24px", color: "#2563eb", marginBottom: "40px" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "100px", height: "100px", background: "#93c5fd", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "42px" }}>🏥</div>
          <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "6px" }}>500-bed</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>Multi-Branch</div>
        </div>
      </div>
      <div style={s.statRow}>
        <div style={s.stat("#2563eb")}><div style={s.statLabel}>Multi-Branch</div></div>
        <div style={s.stat("#2563eb")}><div style={s.statLabel}>Multi-Role</div></div>
        <div style={s.stat("#2563eb")}><div style={s.statLabel}>Multi-Location</div></div>
      </div>
    </div>
  </div>
);

const BrandDemoMockup = () => (
  <div style={s.card}>
    <div style={s.header("#0d9488")}>🌐 Get Started</div>
    <div style={s.body}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🚀</div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#0d9488" }}>Book Your Free Demo</div>
        <div style={{ fontSize: "15px", color: "#64748b", marginTop: "6px" }}>See HealthOS 24 transform your hospital</div>
      </div>
      {[
        { icon: "🎯", label: "Free Demo", desc: "No commitment required" },
        { icon: "🖥️", label: "Live Walkthrough", desc: "See every module in action" },
        { icon: "⚙️", label: "Custom Setup", desc: "Tailored to your hospital" },
      ].map((f, i) => (
        <div key={i} style={s.row()}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{f.label}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{f.desc}</div>
            </div>
          </div>
        </div>
      ))}
      <div style={s.btn("#0d9488")}>Visit healthos.com →</div>
    </div>
  </div>
);

// ── EXPORT MAP ──

const screenMap: Record<ScreenType, React.FC> = {
  patients: PatientsScreen,
  appointments: AppointmentsScreen,
  opd: OPDScreen,
  emergency: EmergencyMockup,
  pharmacy: PharmacyMockup,
  lab: LabMockup,
  ot: OTMockup,
  ipd: IPDMockup,
  accounts: AccountsMockup,
  procurement: ProcurementMockup,
  "ai-chat": AIChatMockup,
  "ai-alerts": AIAlertsMockup,
  "ai-prescreen": AIPrescreenMockup,
  "ai-billing": AIBillingMockup,
  "ai-analytics": AIAnalyticsMockup,
  "workflow-opd": WorkflowOPDMockup,
  "workflow-procurement": WorkflowProcurementMockup,
  "workflow-rx": WorkflowRxMockup,
  "workflow-blood": WorkflowBloodMockup,
  "workflow-nursing": WorkflowNursingMockup,
  "stat-speed": StatSpeedMockup,
  "stat-modules": StatModulesMockup,
  "stat-noshow": StatNoshowMockup,
  "stat-matching": StatMatchingMockup,
  "stat-uptime": StatUptimeMockup,
  "brand-pakistan": BrandPakistanMockup,
  "brand-future": BrandFutureMockup,
  "brand-order": BrandOrderMockup,
  "brand-scale": BrandScaleMockup,
  "brand-demo": BrandDemoMockup,
};

export const renderScreenMockup = (screenType: ScreenType) => {
  const Component = screenMap[screenType];
  return Component ? <Component /> : null;
};
