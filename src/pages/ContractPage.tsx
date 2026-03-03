import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { contractPages } from "@/components/contract/ContractSections";

const ContractPage = () => {
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
      await new Promise((r) => setTimeout(r, 2000));

      const container = printContainerRef.current;
      if (!container) { alert("PDF generation failed: container not ready."); return; }

      const pageElements = container.querySelectorAll(".proposal-page");
      if (pageElements.length === 0) { alert("No pages found."); return; }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = 210, pdfH = 297, pxW = 794, pxH = 1123;

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const orig = el.style.cssText;
        Object.assign(el.style, { width: `${pxW}px`, height: `${pxH}px`, overflow: "hidden", background: "white", boxShadow: "none", borderRadius: "0", margin: "0" });
        await new Promise((r) => setTimeout(r, 200));

        try {
          const dataUrl = await toPng(el, { width: pxW, height: pxH, pixelRatio: 1.5, backgroundColor: "#ffffff", skipAutoScale: true });
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH);
        } catch {
          if (i > 0) pdf.addPage();
          pdf.setFontSize(14);
          pdf.text(`Page ${i + 1} failed to render`, 20, 40);
        } finally {
          el.style.cssText = orig;
        }
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "HealthOS24-Contract-CCIH.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => window.open(url, "_blank"), 500);
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsPrintMode(false);
      setIsDownloading(false);
    }
  }, []);

  const CurrentComp = contractPages[currentPage].component;

  return (
    <div className="min-h-screen bg-muted/30">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; background: white !important; }
          .proposal-page { width: 210mm; min-height: 297mm; page-break-after: always; page-break-inside: avoid; background: white !important; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          .proposal-page:last-child { page-break-after: auto; }
        }
        .proposal-page { width: 210mm; min-height: 297mm; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; overflow: hidden; }
      `}</style>

      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {contractPages.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />
                  ))}
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(contractPages.length - 1, p + 1))} disabled={currentPage === contractPages.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">{contractPages[currentPage].label}</span>
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
            {contractPages.map((p) => { const C = p.component; return <C key={p.id} />; })}
          </div>
        ) : (
          <div className="flex justify-center"><CurrentComp /></div>
        )}
      </div>
    </div>
  );
};

export default ContractPage;
