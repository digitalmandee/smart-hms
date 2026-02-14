import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ProposalCoverPage } from "@/components/proposal/ProposalCoverPage";
import { ProposalExecutiveSummary } from "@/components/proposal/ProposalExecutiveSummary";
import { ProposalClinicalFeatures } from "@/components/proposal/ProposalClinicalFeatures";
import { ProposalDiagnosticsFeatures } from "@/components/proposal/ProposalDiagnosticsFeatures";
import { ProposalPharmacyFeatures } from "@/components/proposal/ProposalPharmacyFeatures";
import { ProposalWarehouseFeatures } from "@/components/proposal/ProposalWarehouseFeatures";
import { ProposalFinanceFeatures } from "@/components/proposal/ProposalFinanceFeatures";
import { ProposalOperationsFeatures } from "@/components/proposal/ProposalOperationsFeatures";
import { ProposalTechnicalSpecs } from "@/components/proposal/ProposalTechnicalSpecs";
import { ProposalPricingPage } from "@/components/proposal/ProposalPricingPage";
import { ProposalTermsPage } from "@/components/proposal/ProposalTermsPage";

const pages = [
  { id: "cover", label: "Cover", component: ProposalCoverPage },
  { id: "summary", label: "Executive Summary", component: ProposalExecutiveSummary },
  { id: "clinical", label: "Clinical Operations", component: ProposalClinicalFeatures },
  { id: "diagnostics", label: "Diagnostics & Lab", component: ProposalDiagnosticsFeatures },
  { id: "pharmacy", label: "Pharmacy & Inventory", component: ProposalPharmacyFeatures },
  { id: "warehouse", label: "Warehouse & Supply Chain", component: ProposalWarehouseFeatures },
  { id: "finance", label: "Finance & Billing", component: ProposalFinanceFeatures },
  { id: "operations", label: "Operations & Admin", component: ProposalOperationsFeatures },
  { id: "technical", label: "Technical Specs", component: ProposalTechnicalSpecs },
  { id: "pricing", label: "Pricing Details", component: ProposalPricingPage },
  { id: "terms", label: "Terms & Conditions", component: ProposalTermsPage },
];

const PricingProposal = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    setIsPrintMode(true);

    try {
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 800));

      const container = printContainerRef.current;
      if (!container) return;

      const pageElements = container.querySelectorAll(".proposal-page");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pixelWidth = 794;
      const pixelHeight = 1123;

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;

        el.style.width = `${pixelWidth}px`;
        el.style.height = `${pixelHeight}px`;
        el.style.overflow = 'hidden';
        el.style.background = 'white';

        await new Promise((resolve) => setTimeout(resolve, 200));

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: pixelWidth,
          height: pixelHeight,
          windowWidth: pixelWidth,
          windowHeight: pixelHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("HealthOS24-Proposal.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsPrintMode(false);
      setIsDownloading(false);
    }
  }, []);

  const goToPrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const CurrentPageComponent = pages[currentPage].component;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; background: white !important; }
          .proposal-page {
            width: 210mm; min-height: 297mm; page-break-after: always; page-break-inside: avoid;
            background: white !important; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important;
          }
          .proposal-page:last-child { page-break-after: auto; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .table-container, [class*="rounded-xl"] { page-break-inside: avoid; }
          .bg-primary, .bg-blue-600 { page-break-inside: avoid; page-break-after: avoid; }
        }
        .proposal-page {
          width: 210mm; min-height: 297mm; background: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border-radius: 8px; overflow: hidden;
        }
      `}</style>

      {/* Toolbar - Hidden when printing */}
      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {pages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === currentPage ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === pages.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">{pages[currentPage].label}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isDownloading ? "Generating…" : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`print-container ${isPrintMode ? "" : "container mx-auto px-4 py-8"}`}>
        {isPrintMode ? (
          <div ref={printContainerRef} className="space-y-0">
            {pages.map((page) => {
              const PageComponent = page.component;
              return <PageComponent key={page.id} />;
            })}
          </div>
        ) : (
          <div className="flex justify-center">
            <CurrentPageComponent />
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingProposal;
