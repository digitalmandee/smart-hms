interface DocPageWrapperProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
  moduleTitle: string;
}

export const DocPageWrapper = ({ children, pageNumber, totalPages, moduleTitle }: DocPageWrapperProps) => (
  <div className="proposal-page flex flex-col p-10" style={{ width: '210mm', height: '297mm', background: 'white', overflow: 'hidden' }}>
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
      <div className="flex items-center gap-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#059669', color: 'white', fontWeight: 700, fontSize: 14, lineHeight: '32px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0 }}>24</div>
        <span className="text-lg font-bold text-gray-900">HealthOS</span>
      </div>
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{moduleTitle}</span>
    </div>
    <div className="flex-1">{children}</div>
    <div className="mt-auto pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-gray-500">
      <span>HealthOS 24 — {moduleTitle}</span>
      <span>Page {pageNumber} of {totalPages}</span>
    </div>
  </div>
);

export const DocCover = ({ title, subtitle, features }: { title: string; subtitle: string; features: string }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="proposal-page flex flex-col justify-between bg-white p-12" style={{ width: '210mm', height: '297mm' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#059669', color: 'white', fontWeight: 700, fontSize: 20, lineHeight: '48px', textAlign: 'center' as const, display: 'inline-block' }}>24</div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 leading-tight">HealthOS</span>
            <span className="text-xs text-gray-500">Smart Hospital Management</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Operations Guide</span>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
        <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 rounded-full mb-8" />
        <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h2>
        <p className="text-xl text-gray-500 mb-12">{subtitle}</p>
        <div className="bg-white border-2 border-emerald-500/20 rounded-2xl px-12 py-8 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Module Documentation</p>
          <h3 className="text-3xl font-bold text-emerald-600">HealthOS 24 {title}</h3>
          <p className="text-sm text-gray-500 mt-2">{features}</p>
        </div>
        <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} />
            <span>Version 2.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#14b8a6', display: 'inline-block' }} />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-500"><p className="font-medium text-gray-900">HealthOS 24</p><p>Enterprise Healthcare Technology</p></div>
          <div className="text-right text-gray-500"><p className="font-medium text-gray-900">healthos24.com</p><p>+971 506802430</p></div>
        </div>
      </div>
    </div>
  );
};

export const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#d1fae5', color: '#047857', fontSize: 18, lineHeight: '36px', textAlign: 'center', display: 'inline-block', flexShrink: 0, marginTop: 2 }}>{icon}</div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const FeatureList = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#111827' }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0, marginTop: 7 }} />
        {item}
      </li>
    ))}
  </ul>
);

export const StepList = ({ steps }: { steps: string[] }) => (
  <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#111827' }}>
    {steps.map((step, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: 11, fontWeight: 500, lineHeight: '20px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
        {step}
      </li>
    ))}
  </ol>
);

export const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 4, height: 16, backgroundColor: '#10b981', borderRadius: 9999, display: 'inline-block' }} />
      {title}
    </h3>
    {children}
  </div>
);

export const TipBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
    <p className="text-xs font-semibold text-emerald-800 mb-1">💡 {title}</p>
    <p className="text-xs text-emerald-700">{children}</p>
  </div>
);

export const MockupTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="border border-emerald-200 rounded-lg overflow-hidden my-3 text-[10px]">
    <table className="w-full">
      <thead><tr className="bg-emerald-50">{headers.map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-semibold text-emerald-800 border-b border-emerald-200">{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, ri) => <tr key={ri} className={ri % 2 === 1 ? "bg-emerald-50/30" : ""}>{row.map((cell, ci) => <td key={ci} className="px-2 py-1 text-gray-900 border-b border-emerald-100">{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

export const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/50 flex items-center gap-2.5 min-w-0">
    <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#d1fae5', color: '#047857', fontSize: 16, lineHeight: '32px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0 }}>{icon}</div>
    <div className="min-w-0"><p className="text-[10px] text-gray-500 truncate">{label}</p><p className="text-sm font-bold text-gray-900">{value}</p></div>
  </div>
);

export const ScreenMockup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border border-emerald-200 rounded-lg overflow-hidden my-3 shadow-sm">
    <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 flex items-center gap-1.5">
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f87171', display: 'inline-block' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#facc15', display: 'inline-block' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
      <span className="text-[10px] font-medium text-emerald-700 ml-2">{title}</span>
    </div>
    <div className="p-3 bg-white">{children}</div>
  </div>
);

export const ProcessFlow = ({ steps }: { steps: { title: string; desc: string; icon: string }[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontSize: 13 }}>
    {steps.map((step, i) => (
      <div key={i}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#d1fae5', fontSize: 15, lineHeight: '32px', textAlign: 'center', flexShrink: 0 }}>{step.icon}</div>
          <div style={{ flex: 1, border: '1px solid #a7f3d0', borderRadius: 8, padding: '6px 10px', backgroundColor: '#f0fdf4' }}>
            <div style={{ fontWeight: 600, color: '#111827', fontSize: 12 }}>{step.title}</div>
            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{step.desc}</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: 10, fontWeight: 700, lineHeight: '24px', textAlign: 'center' as const, flexShrink: 0 }}>{i + 1}</div>
        </div>
        {i < steps.length - 1 && (
          <div style={{ marginLeft: 15, width: 0, height: 10, borderLeft: '2px dashed #a7f3d0' }} />
        )}
      </div>
    ))}
  </div>
);

export const DocToc = ({ items, moduleTitle, totalPages }: { items: { num: number; title: string; page: number }[]; moduleTitle: string; totalPages: number }) => (
  <DocPageWrapper pageNumber={2} totalPages={totalPages} moduleTitle={moduleTitle}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">📖</div>
      <h2 className="text-2xl font-bold text-gray-900">Table of Contents</h2>
    </div>
    <div className="space-y-0">
      {items.map((item) => (
        <div key={item.num} className="flex items-center py-2.5 border-b border-dashed border-gray-200">
          <span className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center shrink-0 ${item.num === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
            {item.num === 0 ? '↓' : item.num}
          </span>
          <span className={`ml-3 text-sm font-medium flex-1 ${item.num === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>{item.title}</span>
          <span className="text-sm text-gray-500 font-mono">{item.page}</span>
        </div>
      ))}
    </div>
  </DocPageWrapper>
);
