interface KsaDocPageWrapperProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
}

export const KsaDocPageWrapper = ({ children, pageNumber, totalPages }: KsaDocPageWrapperProps) => (
  <div className="proposal-page flex flex-col p-10" style={{ width: '210mm', height: '297mm', background: 'white', overflow: 'hidden' }}>
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
      <div className="flex items-center gap-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#006C35', color: 'white', fontWeight: 700, fontSize: 14, lineHeight: '32px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0 }}>24</div>
        <span className="text-lg font-bold text-gray-900">HealthOS</span>
      </div>
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
        🇸🇦 KSA Compliance Guide
      </span>
    </div>
    <div className="flex-1">{children}</div>
    <div className="mt-auto pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-gray-500">
      <span>HealthOS 24 — KSA Compliance & Integrations</span>
      <span>Page {pageNumber} of {totalPages}</span>
    </div>
  </div>
);

export const KsaSectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#d1fae5', color: '#006C35', fontSize: 18, lineHeight: '36px', textAlign: 'center', display: 'inline-block', flexShrink: 0, marginTop: 2 }}>
      {icon}
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const KsaFeatureList = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#111827' }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#006C35', display: 'inline-block', flexShrink: 0, marginTop: 7 }} />
        {item}
      </li>
    ))}
  </ul>
);

export const KsaTipBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
    <p className="text-xs font-semibold text-emerald-800 mb-1">💡 {title}</p>
    <p className="text-xs text-emerald-700">{children}</p>
  </div>
);

export const KsaStepList = ({ steps }: { steps: string[] }) => (
  <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#111827' }}>
    {steps.map((step, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#006C35', color: 'white', fontSize: 11, fontWeight: 500, lineHeight: '20px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0, marginTop: 2 }}>
          {i + 1}
        </span>
        {step}
      </li>
    ))}
  </ol>
);

export const KsaSubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 4, height: 16, backgroundColor: '#006C35', borderRadius: 9999, display: 'inline-block' }} />
      {title}
    </h3>
    {children}
  </div>
);

export const KsaInfoCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/50 flex items-center gap-2.5 min-w-0">
    <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#d1fae5', color: '#006C35', fontSize: 14, lineHeight: '28px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0 }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500 truncate">{label}</p>
      <p className="text-xs font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export const KsaMockupTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="border border-emerald-200 rounded-lg overflow-hidden my-2 text-[10px]">
    <table className="w-full">
      <thead>
        <tr className="bg-emerald-50">
          {headers.map((h, i) => (
            <th key={i} className="px-2 py-1.5 text-left font-semibold text-emerald-800 border-b border-emerald-200">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 1 ? "bg-emerald-50/30" : ""}>
            {row.map((cell, ci) => (
              <td key={ci} className="px-2 py-1 text-gray-900 border-b border-emerald-100">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
