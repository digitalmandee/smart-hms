import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { DocCoverPage } from "@/components/pharmacy-docs/DocCoverPage";
import { DocTableOfContents } from "@/components/pharmacy-docs/DocTableOfContents";
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

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

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
            page-break-inside: avoid; background: white !important;
            box-shadow: none !important; margin: 0 !important; border-radius: 0 !important;
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
                <Button size="sm" onClick={handlePrint} className="gap-2">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`print-container ${isPrintMode ? "" : "container mx-auto px-4 py-8"}`}>
        {isPrintMode ? (
          <div className="space-y-0">
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
