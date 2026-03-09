import { DocToc } from "@/components/shared-docs/DocPageWrapper";
const items = [
  { num: 0, title: "Process Flow — Revenue Cycle", page: 3 },
  { num: 1, title: "Chart of Accounts — 4-Level Hierarchy", page: 4 },
  { num: 2, title: "Journal Entries & Auto-Triggers", page: 5 },
  { num: 3, title: "Billing — Invoice, Payment, Daily Closing", page: 6 },
  { num: 4, title: "Financial Reports — P&L, Balance Sheet, Cash Flow", page: 7 },
  { num: 5, title: "Billing Sessions — Counter-Based Cash Management", page: 8 },
  { num: 6, title: "Daily Closing & Cash Reconciliation", page: 9 },
  { num: 7, title: "Expense Management", page: 10 },
  { num: 8, title: "Accounts Receivable & Accounts Payable", page: 11 },
  { num: 9, title: "Insurance & Claims — NPHIES Integration", page: 12 },
  { num: 10, title: "Budgets & Fiscal Years", page: 13 },
  { num: 11, title: "Bank Accounts & Vendor Payments", page: 14 },
];
export const FinDocToc = () => <DocToc items={items} moduleTitle="Finance Module Guide" totalPages={14} />;
