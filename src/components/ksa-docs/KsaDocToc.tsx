import { KsaDocPageWrapper } from "./KsaDocPageWrapper";

const tocItems = [
  { num: 1, title: "Integration Landscape Overview", page: 3 },
  { num: 2, title: "NPHIES — Insurance & Claims", page: 4 },
  { num: 3, title: "ZATCA Phase 2 — E-Invoicing", page: 5 },
  { num: 4, title: "Wasfaty — E-Prescription", page: 6 },
  { num: 5, title: "Tatmeen / RSD — Drug Track & Trace", page: 7 },
  { num: 6, title: "HESN — Public Health Reporting", page: 8 },
  { num: 7, title: "Nafath — Identity Verification", page: 9 },
  { num: 8, title: "Sehhaty — Patient Engagement", page: 10 },
  { num: 9, title: "PDPL & Consent Management", page: 11 },
  { num: 10, title: "Configuration & Testing Guide", page: 12 },
];

export const KsaDocToc = () => (
  <KsaDocPageWrapper pageNumber={2} totalPages={12}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">📖</div>
      <h2 className="text-2xl font-bold text-gray-900">Table of Contents</h2>
    </div>
    <div className="space-y-0">
      {tocItems.map((item) => (
        <div key={item.num} className="flex items-center py-2.5 border-b border-dashed border-gray-200">
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
            {item.num}
          </span>
          <span className="ml-3 text-sm font-medium text-gray-900 flex-1">{item.title}</span>
          <span className="text-sm text-gray-500 font-mono">{item.page}</span>
        </div>
      ))}
    </div>
  </KsaDocPageWrapper>
);
