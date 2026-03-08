import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { DocCoverPage } from "@/components/pharmacy-docs/DocCoverPage";
import { DocTableOfContents } from "@/components/pharmacy-docs/DocTableOfContents";
import { PharmDocFlow } from "@/components/pharmacy-docs/PharmDocFlow";
import { DocDashboard } from "@/components/pharmacy-docs/DocDashboard";
import { DocMedicineCatalog } from "@/components/pharmacy-docs/DocMedicineCatalog";
import { DocInventory } from "@/components/pharmacy-docs/DocInventory";
import { DocStockEntry } from "@/components/pharmacy-docs/DocStockEntry";
import { DocPOSLayout } from "@/components/pharmacy-docs/DocPOSLayout";
import { DocPOSCart } from "@/components/pharmacy-docs/DocPOSCart";
import { DocPOSPayment } from "@/components/pharmacy-docs/DocPOSPayment";
import { DocSessions } from "@/components/pharmacy-docs/DocSessions";
import { DocDispensing } from "@/components/pharmacy-docs/DocDispensing";
import { DocReturns } from "@/components/pharmacy-docs/DocReturns";
import { DocStockMovements } from "@/components/pharmacy-docs/DocStockMovements";
import { DocWarehouse } from "@/components/pharmacy-docs/DocWarehouse";
import { DocProcurement } from "@/components/pharmacy-docs/DocProcurement";
import { DocReports } from "@/components/pharmacy-docs/DocReports";
import { DocReportsPage2 } from "@/components/pharmacy-docs/DocReportsPage2";
import { DocSettings } from "@/components/pharmacy-docs/DocSettings";

const pages = [
  { id: "cover", label: "Cover", component: DocCoverPage },
  { id: "toc", label: "Table of Contents", component: DocTableOfContents },
  { id: "flow", label: "Process Flow", component: PharmDocFlow },
  { id: "dashboard", label: "Dashboard", component: DocDashboard },
  { id: "catalog", label: "Medicine Catalog", component: DocMedicineCatalog },
  { id: "inventory", label: "Inventory", component: DocInventory },
  { id: "stock-entry", label: "Stock Entry (GRN)", component: DocStockEntry },
  { id: "pos-layout", label: "POS — Layout", component: DocPOSLayout },
  { id: "pos-cart", label: "POS — Cart", component: DocPOSCart },
  { id: "pos-payment", label: "POS — Payment", component: DocPOSPayment },
  { id: "sessions", label: "Sessions & History", component: DocSessions },
  { id: "dispensing", label: "Dispensing", component: DocDispensing },
  { id: "returns", label: "Returns", component: DocReturns },
  { id: "movements", label: "Stock Movements", component: DocStockMovements },
  { id: "warehouse", label: "Warehouses", component: DocWarehouse },
  { id: "procurement", label: "Procurement", component: DocProcurement },
  { id: "reports-1", label: "Reports Hub", component: DocReports },
  { id: "reports-2", label: "Reports Detail", component: DocReportsPage2 },
  { id: "settings", label: "Settings", component: DocSettings },
];

const PharmacyDocumentation = () => {
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
      await new Promise(r => setTimeout(r, 2000));

      const container = printContainerRef.current;
      if (!container) {
        alert("PDF generation failed: container not ready.");
        return;
      }

      const pageElements = container.querySelectorAll('.proposal-page');
      console.log(`Found ${pageElements.length} pages to capture`);

      if (pageElements.length === 0) {
        alert("No pages found to generate PDF.");
        return;
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pixelWidth = 794;
      const pixelHeight = 1123;

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        console.log(`Capturing page ${i + 1} of ${pageElements.length}...`);

        const originalCss = el.style.cssText;
        el.style.width = `${pixelWidth}px`;
        el.style.height = `${pixelHeight}px`;
        el.style.overflow = 'hidden';
        el.style.background = 'white';
        el.style.boxShadow = 'none';
        el.style.borderRadius = '0';
        el.style.margin = '0';

        await new Promise(r => setTimeout(r, 200));

        try {
          const dataUrl = await toPng(el, {
            width: pixelWidth,
            height: pixelHeight,
            pixelRatio: 1.5,
            backgroundColor: '#ffffff',
            skipAutoScale: true,
          });

          console.log(`Page ${i + 1} captured successfully`);

          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        } catch (pageError) {
          console.error(`Failed to capture page ${i + 1}:`, pageError);
          if (i > 0) pdf.addPage();
          pdf.setFontSize(14);
          pdf.text(`Page ${i + 1} failed to render`, 20, 40);
        } finally {
          el.style.cssText = originalCss;
        }
      }

      console.log("All pages captured, saving PDF...");
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "HealthOS24-Pharmacy-Documentation.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.open(url, "_blank");
      }, 500);
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 5000);
      console.log("PDF saved!");
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
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; background: white !important; }
          .proposal-page {
            width: 210mm; height: 297mm; overflow: hidden; page-break-after: always;
            page-break-inside: avoid; break-inside: avoid; background: white !important;
            box-shadow: none !important; margin: 0 !important; border-radius: 0 !important;
            padding: 10mm !important;
          }
          .proposal-page:last-child { page-break-after: auto; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
        .proposal-page {
          width: 210mm; min-height: 297mm; background: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border-radius: 8px; overflow: hidden;
        }
      `}</style>

      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5">
                  {pages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPage ? "bg-emerald-600" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
                  <Printer className="h-4 w-4" /> Print
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

export default PharmacyDocumentation;
