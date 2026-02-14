import { DocPageWrapper } from "./DocPageWrapper";
import { BookOpen } from "lucide-react";

const tocItems = [
  { num: 1, title: "Dashboard Overview", page: 3 },
  { num: 2, title: "Medicine Catalog & Categories", page: 4 },
  { num: 3, title: "Inventory Management", page: 5 },
  { num: 4, title: "Stock Entry (GRN)", page: 6 },
  { num: 5, title: "POS Terminal — Layout & Product Search", page: 7 },
  { num: 6, title: "POS Terminal — Cart & Checkout", page: 8 },
  { num: 7, title: "POS Terminal — Payment & Receipt", page: 9 },
  { num: 8, title: "POS Sessions & Transaction History", page: 10 },
  { num: 9, title: "Prescription Queue & Dispensing", page: 11 },
  { num: 10, title: "Returns & Refunds", page: 12 },
  { num: 11, title: "Stock Movements & Alerts", page: 13 },
  { num: 12, title: "Warehouse Management", page: 14 },
  { num: 13, title: "Procurement — PO & Suppliers", page: 15 },
  { num: 14, title: "Reports Hub (29 Reports)", page: 16 },
  { num: 15, title: "Settings & Configuration", page: 18 },
];

export const DocTableOfContents = () => (
  <DocPageWrapper pageNumber={2} totalPages={18}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-emerald-700" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Table of Contents</h2>
    </div>

    <div className="space-y-0">
      {tocItems.map((item) => (
        <div key={item.num} className="flex items-center py-2.5 border-b border-dashed border-muted group">
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
            {item.num}
          </span>
          <span className="ml-3 text-sm font-medium text-foreground flex-1">{item.title}</span>
          <span className="text-sm text-muted-foreground font-mono">{item.page}</span>
        </div>
      ))}
    </div>
  </DocPageWrapper>
);
