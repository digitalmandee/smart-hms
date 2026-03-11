import { DocPageWrapper } from "@/components/pharmacy-docs/DocPageWrapper";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

export const FinDemoGuideCover = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={1} totalPages={totalPages}>
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="mb-6">
        <HealthOS24Logo variant="full" size="lg" showTagline />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Finance Module</h1>
      <h2 className="text-2xl text-emerald-700 font-semibold mb-2">Complete Demo Guide & FAQ</h2>
      <p className="text-gray-500 text-lg mb-8">HealthOS 24 — Hospital Management Information System</p>
      <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
        {[
          { label: "Chart of Accounts", value: "4-Level Hierarchy" },
          { label: "Auto GL Triggers", value: "9 Triggers" },
          { label: "Compliance", value: "ZATCA / VAT" },
          { label: "Reconciliation", value: "Bank + Daily Closing" },
          { label: "Reporting", value: "P&L, BS, CF, TB" },
          { label: "Asset Mgmt", value: "Depreciation" },
        ].map((item) => (
          <div key={item.label} className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
            <p className="text-emerald-700 font-semibold">{item.value}</p>
            <p className="text-gray-500 text-xs">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-sm text-gray-400">
        <p>Prepared for Demo • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  </DocPageWrapper>
);
