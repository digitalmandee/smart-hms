import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Revenue Cycle", page: 3 },
  { num: 1, title: "Chart of Accounts — 4-Level Hierarchy", page: 4 },
  { num: 2, title: "Journal Entries & Auto-Triggers", page: 5 },
  { num: 3, title: "Billing — Invoice, Payment, Daily Closing", page: 6 },
  { num: 4, title: "Financial Reports — P&L, Balance Sheet, Cash Flow", page: 7 },
];
export const FinDocToc = () => <DocToc items={items} moduleTitle="Finance Module Guide" totalPages={7} />;
