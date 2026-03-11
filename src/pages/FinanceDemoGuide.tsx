import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FinDemoGuideCover } from "@/components/finance-demo-docs/FinDemoGuideCover";
import { FinDemoGuideToc } from "@/components/finance-demo-docs/FinDemoGuideToc";
import { FinDemoGuideCoA } from "@/components/finance-demo-docs/FinDemoGuideCoA";
import { FinDemoGuideJournals } from "@/components/finance-demo-docs/FinDemoGuideJournals";
import { FinDemoGuideInvoices } from "@/components/finance-demo-docs/FinDemoGuideInvoices";
import { FinDemoGuideCreditNotes } from "@/components/finance-demo-docs/FinDemoGuideCreditNotes";
import { FinDemoGuideDeposits } from "@/components/finance-demo-docs/FinDemoGuideDeposits";
import { FinDemoGuideDailyClosing } from "@/components/finance-demo-docs/FinDemoGuideDailyClosing";
import { FinDemoGuideBankRecon } from "@/components/finance-demo-docs/FinDemoGuideBankRecon";
import { FinDemoGuideFixedAssets } from "@/components/finance-demo-docs/FinDemoGuideFixedAssets";
import { FinDemoGuideExpenses } from "@/components/finance-demo-docs/FinDemoGuideExpenses";
import { FinDemoGuideVendorAP } from "@/components/finance-demo-docs/FinDemoGuideVendorAP";
import { FinDemoGuideVAT } from "@/components/finance-demo-docs/FinDemoGuideVAT";
import { FinDemoGuideBudgets } from "@/components/finance-demo-docs/FinDemoGuideBudgets";
import { FinDemoGuideFAQ1, FinDemoGuideFAQ2 } from "@/components/finance-demo-docs/FinDemoGuideFAQ";
import { FinDemoGuideNavRef } from "@/components/finance-demo-docs/FinDemoGuideNavRef";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const TOTAL_PAGES = 17;

export default function FinanceDemoGuide() {
  const navigate = useNavigate();
  const pagesRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!pagesRef.current) return;
    setExporting(true);
    try {
      const pages = pagesRef.current.querySelectorAll(".proposal-page");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < pages.length; i++) {
        const canvas = await toPng(pages[i] as HTMLElement, { quality: 0.95, pixelRatio: 2 });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas, "PNG", 0, 0, 210, 297);
      }
      pdf.save("HealthOS-Finance-Demo-Guide.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Finance Demo Guide</h1>
            <p className="text-xs text-muted-foreground">{TOTAL_PAGES} pages • Complete module documentation</p>
          </div>
        </div>
        <Button onClick={handleExportPdf} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      {/* Pages */}
      <div ref={pagesRef} className="flex flex-col items-center gap-8 py-8">
        <FinDemoGuideCover totalPages={TOTAL_PAGES} />
        <FinDemoGuideToc totalPages={TOTAL_PAGES} />
        <FinDemoGuideCoA totalPages={TOTAL_PAGES} />
        <FinDemoGuideJournals totalPages={TOTAL_PAGES} />
        <FinDemoGuideInvoices totalPages={TOTAL_PAGES} />
        <FinDemoGuideCreditNotes totalPages={TOTAL_PAGES} />
        <FinDemoGuideDeposits totalPages={TOTAL_PAGES} />
        <FinDemoGuideDailyClosing totalPages={TOTAL_PAGES} />
        <FinDemoGuideBankRecon totalPages={TOTAL_PAGES} />
        <FinDemoGuideFixedAssets totalPages={TOTAL_PAGES} />
        <FinDemoGuideExpenses totalPages={TOTAL_PAGES} />
        <FinDemoGuideVendorAP totalPages={TOTAL_PAGES} />
        <FinDemoGuideVAT totalPages={TOTAL_PAGES} />
        <FinDemoGuideBudgets totalPages={TOTAL_PAGES} />
        <FinDemoGuideFAQ1 totalPages={TOTAL_PAGES} />
        <FinDemoGuideFAQ2 totalPages={TOTAL_PAGES} />
        <FinDemoGuideNavRef totalPages={TOTAL_PAGES} />
      </div>
    </div>
  );
}
