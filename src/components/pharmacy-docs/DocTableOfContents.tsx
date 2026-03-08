import { DocPageWrapper } from "./DocPageWrapper";

const tocItems = [
  { num: 0, title: "Process Flow — Pharmacy Workflow", page: 3 },
  { num: 1, title: "Dashboard Overview", page: 4 },
  { num: 2, title: "Medicine Catalog & Categories", page: 5 },
  { num: 3, title: "Inventory Management", page: 6 },
  { num: 4, title: "Stock Entry (GRN)", page: 7 },
  { num: 5, title: "POS Terminal — Layout & Product Search", page: 8 },
  { num: 6, title: "POS Terminal — Cart & Checkout", page: 9 },
  { num: 7, title: "POS Terminal — Payment & Receipt", page: 10 },
  { num: 8, title: "POS Sessions & Transaction History", page: 11 },
  { num: 9, title: "Prescription Queue & Dispensing", page: 12 },
  { num: 10, title: "Returns & Refunds", page: 13 },
  { num: 11, title: "Stock Movements & Alerts", page: 14 },
  { num: 12, title: "Warehouse Management", page: 15 },
  { num: 13, title: "Procurement — PO & Suppliers", page: 16 },
  { num: 14, title: "Reports Hub (29 Reports)", page: 17 },
  { num: 15, title: "Settings & Configuration", page: 19 },
];

export const DocTableOfContents = () => (
  <DocPageWrapper pageNumber={2} totalPages={19}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">📖</div>
      <h2 className="text-2xl font-bold text-gray-900">Table of Contents</h2>
    </div>
    <div className="space-y-0">
      {tocItems.map((item) => (
        <div key={item.num} className="flex items-center py-2 border-b border-dashed border-gray-200 group">
          <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${item.num === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
            {item.num === 0 ? '↓' : item.num}
          </span>
          <span className={`ml-3 text-xs font-medium flex-1 ${item.num === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>{item.title}</span>
          <span className="text-xs text-gray-500 font-mono">{item.page}</span>
        </div>
      ))}
    </div>
  </DocPageWrapper>
);
