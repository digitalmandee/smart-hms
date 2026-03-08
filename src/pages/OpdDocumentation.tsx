import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { OpdDocCover } from "@/components/opd-docs/OpdDocCover";
import { OpdDocToc } from "@/components/opd-docs/OpdDocToc";
import { OpdDocAppointment } from "@/components/opd-docs/OpdDocAppointment";
import { OpdDocQueue } from "@/components/opd-docs/OpdDocQueue";
import { OpdDocConsultation } from "@/components/opd-docs/OpdDocConsultation";
import { OpdDocOrders } from "@/components/opd-docs/OpdDocOrders";
import { OpdDocPrescriptions } from "@/components/opd-docs/OpdDocPrescriptions";
import { OpdDocCheckout } from "@/components/opd-docs/OpdDocCheckout";

const pages = [
  { id: "cover", label: "Cover", component: OpdDocCover },
  { id: "toc", label: "Table of Contents", component: OpdDocToc },
  { id: "appointment", label: "Appointments", component: OpdDocAppointment },
  { id: "queue", label: "Token Queue", component: OpdDocQueue },
  { id: "consultation", label: "Consultation", component: OpdDocConsultation },
  { id: "orders", label: "Orders", component: OpdDocOrders },
  { id: "prescriptions", label: "Prescriptions", component: OpdDocPrescriptions },
  { id: "checkout", label: "Checkout", component: OpdDocCheckout },
];

const OpdDocumentation = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    setIsPrintMode(true);
    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 2000));
      const container = printContainerRef.current;
      if (!container) { alert("PDF generation failed."); return; }
      const pageElements = container.querySelectorAll('.proposal-page');
      if (pageElements.length === 0) { alert("No pages found."); return; }
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const orig = el.style.cssText;
        el.style.width = '794px'; el.style.height = '1123px'; el.style.overflow = 'hidden'; el.style.background = 'white'; el.style.boxShadow = 'none'; el.style.borderRadius = '0'; el.style.margin = '0';
        await new Promise(r => setTimeout(r, 200));
        try {
          const dataUrl = await toPng(el, { width: 794, height: 1123, pixelRatio: 1.5, backgroundColor: '#ffffff', skipAutoScale: true });
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
        } catch { if (i > 0) pdf.addPage(); pdf.setFontSize(14); pdf.text(`Page ${i+1} failed`, 20, 40); }
        finally { el.style.cssText = orig; }
      }
      const blob = pdf.output("blob"); const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "HealthOS24-OPD-Documentation.pdf"; document.body.appendChild(link); link.click();
      setTimeout(() => { window.open(url, "_blank"); }, 500);
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch { alert("PDF generation failed."); }
    finally { setIsPrintMode(false); setIsDownloading(false); }
  }, []);

  const CurrentPageComponent = pages[currentPage].component;

  return (
    <div className="min-h-screen bg-muted/30">
      <style>{`@media print { @page { size: A4 portrait; margin: 0; } body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none !important; } .print-container { padding: 0 !important; background: white !important; } .proposal-page { width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; background: white !important; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; } } .proposal-page { width: 210mm; min-height: 297mm; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; overflow: hidden; }`}</style>
      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/documentation")} className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage===0}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex items-center gap-1.5">{pages.map((_, i) => <button key={i} onClick={() => setCurrentPage(i)} className={`w-2 h-2 rounded-full transition-colors ${i===currentPage?"bg-emerald-600":"bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />)}</div>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(pages.length-1, p+1))} disabled={currentPage===pages.length-1}><ChevronRight className="h-4 w-4" /></Button>
              <span className="text-sm text-muted-foreground ml-2">{pages[currentPage].label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsPrintMode(true); setTimeout(() => { window.print(); setTimeout(() => setIsPrintMode(false), 500); }, 100); }} className="gap-2"><Printer className="h-4 w-4" />Print</Button>
              <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">{isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{isDownloading ? "Generating…" : "Download PDF"}</Button>
            </div>
          </div>
        </div>
      )}
      <div className={`print-container ${isPrintMode ? "" : "container mx-auto px-4 py-8"}`}>
        {isPrintMode ? (
          <div ref={printContainerRef} className="space-y-0">{pages.map(page => { const C = page.component; return <C key={page.id} />; })}</div>
        ) : (
          <div className="flex justify-center"><CurrentPageComponent /></div>
        )}
      </div>
    </div>
  );
};

export default OpdDocumentation;
