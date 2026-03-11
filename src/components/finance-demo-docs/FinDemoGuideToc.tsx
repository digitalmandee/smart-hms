import { DocPageWrapper, SectionTitle } from "@/components/pharmacy-docs/DocPageWrapper";

const tocItems = [
  { page: 3, title: "Chart of Accounts Flow", desc: "4-level hierarchy, header vs posting accounts" },
  { page: 4, title: "Journal Entry Flow", desc: "Manual & auto-trigger lifecycle with D/C mappings" },
  { page: 5, title: "Invoice & Payment Flow", desc: "Service delivery → Invoice → Payment → GL posting" },
  { page: 6, title: "Credit Note Flow", desc: "ZATCA types 381/383, approval lifecycle" },
  { page: 7, title: "Patient Deposits Flow", desc: "Deposit → Applied → Refund, liability accounting" },
  { page: 8, title: "Daily Closing & Reconciliation", desc: "4-step wizard, cash denomination reconciliation" },
  { page: 9, title: "Bank Reconciliation Flow", desc: "CSV import, auto-match, manual reconciliation" },
  { page: 10, title: "Fixed Assets & Depreciation", desc: "Asset register, SL & RB methods" },
  { page: 11, title: "Expense Management Flow", desc: "Category types, petty cash, auto GL posting" },
  { page: 12, title: "Vendor Payments & AP Flow", desc: "PO → GRN → Payment → GL" },
  { page: 13, title: "VAT / ZATCA Compliance", desc: "Output vs Input VAT, QR codes, VAT Return" },
  { page: 14, title: "Budget & Fiscal Period Management", desc: "Budget creation, variance, period locking" },
  { page: 15, title: "Demo FAQ — Part 1", desc: "Revenue Cycle, GL & Reporting, Compliance & Tax" },
  { page: 16, title: "Demo FAQ — Part 2", desc: "Operations & Technical Questions" },
  { page: 17, title: "Quick Navigation Reference", desc: "All finance routes and descriptions" },
];

export const FinDemoGuideToc = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={2} totalPages={totalPages}>
    <SectionTitle icon="📋" title="Table of Contents" subtitle="Complete Finance Module Documentation" />
    <div className="space-y-2 mt-6">
      {tocItems.map((item) => (
        <div key={item.page} className="flex items-center gap-3 py-2 border-b border-emerald-100">
          <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: 12, fontWeight: 600, lineHeight: '28px', textAlign: 'center' as const, display: 'inline-block', flexShrink: 0 }}>
            {item.page}
          </span>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </DocPageWrapper>
);
