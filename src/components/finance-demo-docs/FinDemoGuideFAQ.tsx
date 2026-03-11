import { DocPageWrapper, SectionTitle } from "@/components/pharmacy-docs/DocPageWrapper";

const faqsPage1 = [
  { category: "Revenue Cycle", items: [
    { q: "How do you create an invoice?", a: "Billing → New Invoice → select patient → add services → auto-calculates total with VAT", route: "/app/billing/invoices/new" },
    { q: "Can you split payments across methods?", a: "Yes — record partial payments with different methods. Each creates a separate payment record linked to the same invoice.", route: "/app/billing/invoices" },
    { q: "How are payments tracked per cashier?", a: "Each payment links to a billing session. Sessions are user-specific and shift-specific for full audit trail.", route: "/app/billing/daily-closing" },
    { q: "What happens when a patient prepays?", a: "Record as Patient Deposit → liability created → applied against invoices at discharge.", route: "/app/accounts/patient-deposits" },
    { q: "How do refunds work?", a: "Issue a Credit Note (Type 381) → approved → auto journal reverses revenue and reduces AR.", route: "/app/accounts/credit-notes" },
  ]},
  { category: "GL & Reporting", items: [
    { q: "Show me the P&L statement", a: "Real-time from GL, supports period comparison mode. Revenue vs Expenses with net income.", route: "/app/accounts/reports/profit-loss" },
    { q: "Can I see Balance Sheet?", a: "Assets = Liabilities + Equity format, calculated from GL balances in real-time.", route: "/app/accounts/reports/balance-sheet" },
    { q: "How does Cash Flow work?", a: "Three sections: Operating, Investing, Financing. Derived from GL transactions.", route: "/app/accounts/reports/cash-flow" },
    { q: "Where's the Trial Balance?", a: "Lists all posting accounts with debit/credit totals. Balanced indicator shown. Exportable.", route: "/app/accounts/reports/trial-balance" },
    { q: "Can I create manual journal entries?", a: "Yes — multi-line with balance validation. Must use Level 4 accounts only.", route: "/app/accounts/journal-entries/new" },
    { q: "Revenue by department?", a: "Pie chart breakdown by service source: OPD, Lab, Pharmacy, Radiology.", route: "/app/accounts/reports/revenue-by-source" },
  ]},
  { category: "Compliance & Tax", items: [
    { q: "How do you handle VAT/ZATCA?", a: "15% VAT auto-calculated. QR codes on all invoices. VAT Return report for ZATCA filing.", route: "/app/accounts/reports/vat-return" },
    { q: "Are invoices ZATCA Phase 2 ready?", a: "Yes — UBL 2.1 XML, SHA-256 hashing, invoice chaining, and clearance API support.", route: "/app/billing/invoices" },
    { q: "How does the audit trail work?", a: "Financial Audit Log tracks all entity changes with before/after value comparison.", route: "/app/accounts/audit-log" },
    { q: "Can I lock a fiscal period?", a: "Yes — toggle lock on individual periods to prevent backdated entries.", route: "/app/accounts/period-management" },
  ]},
];

const faqsPage2 = [
  { category: "Operations", items: [
    { q: "How does daily closing work?", a: "4-step wizard: Sessions → Expenses → Cash Count → Summary submission.", route: "/app/billing/daily-closing" },
    { q: "Can you reconcile bank statements?", a: "CSV import with auto-match engine. Pairs statement rows with system transactions.", route: "/app/accounts/bank-reconciliation" },
    { q: "How do vendor payments work?", a: "Linked to GRN. Payment → auto GL: Debit AP, Credit Cash.", route: "/app/accounts/vendor-payments" },
    { q: "Fixed asset depreciation?", a: "Straight-line & reducing balance. Monthly schedule with journal posting.", route: "/app/accounts/fixed-assets" },
    { q: "What about multi-branch?", a: "Consolidated P&L shows side-by-side comparison across branches.", route: "/app/accounts/reports/consolidated-pnl" },
    { q: "Budget vs Actual?", a: "Variance analysis with percentage deviation. Visual indicators for over/under.", route: "/app/accounts/budgets" },
  ]},
  { category: "Technical", items: [
    { q: "How many GL auto-triggers exist?", a: "9 triggers: invoice, payment, expense, payroll, POS, vendor payment, stock write-off, donation, shipping." },
    { q: "What's the account posting restriction?", a: "Only Level 4 accounts accept postings — enforced by check_posting_account trigger." },
    { q: "How is DSO calculated?", a: "Outstanding ÷ (Revenue ÷ 90 days) from last 3 months of invoices." },
    { q: "Can I export reports?", a: "P&L supports CSV export. Invoices are printable. PDF export planned." },
    { q: "How are account balances updated?", a: "Real-time via update_account_balance trigger on every journal_entry_lines change." },
  ]},
];

const FAQSection = ({ faqs }: { faqs: { category: string; items: { q: string; a: string; route?: string }[] }[] }) => (
  <div className="space-y-4" style={{ fontSize: 11 }}>
    {faqs.map((cat) => (
      <div key={cat.category}>
        <h3 className="font-bold text-emerald-800 text-xs mb-1 uppercase tracking-wide">{cat.category}</h3>
        {cat.items.map((faq, i) => (
          <div key={i} className="flex gap-2 mb-1.5 pl-2">
            <span className="text-emerald-600 font-bold flex-shrink-0">Q:</span>
            <div>
              <span className="font-medium text-gray-900">{faq.q}</span>
              <br />
              <span className="text-gray-600">A: {faq.a}</span>
              {"route" in faq && faq.route && (
                <span className="text-emerald-600 ml-1">→ {faq.route}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const FinDemoGuideFAQ1 = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={15} totalPages={totalPages}>
    <SectionTitle icon="❓" title="Demo FAQ — Part 1" subtitle="Revenue Cycle, GL & Reporting, Compliance & Tax" />
    <FAQSection faqs={faqsPage1} />
  </DocPageWrapper>
);

export const FinDemoGuideFAQ2 = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={16} totalPages={totalPages}>
    <SectionTitle icon="❓" title="Demo FAQ — Part 2" subtitle="Operations & Technical Questions" />
    <FAQSection faqs={faqsPage2} />
  </DocPageWrapper>
);
