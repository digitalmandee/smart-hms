import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { DentDocCover } from "@/components/dental-docs/DentDocCover";
import { DentDocToc } from "@/components/dental-docs/DentDocToc";
import { DentDocFlow } from "@/components/dental-docs/DentDocFlow";
import { DentDocChart } from "@/components/dental-docs/DentDocChart";
import { DentDocTreatment } from "@/components/dental-docs/DentDocTreatment";
import { DentDocProcedures } from "@/components/dental-docs/DentDocProcedures";
import { DentDocImages } from "@/components/dental-docs/DentDocImages";

const pages = [
  { id: "cover", label: "Cover", component: DentDocCover },
  { id: "toc", label: "Contents", component: DentDocToc },
  { id: "flow", label: "Process Flow", component: DentDocFlow },
  { id: "chart", label: "Tooth Chart", component: DentDocChart },
  { id: "treatment", label: "Treatment Plans", component: DentDocTreatment },
  { id: "procedures", label: "Procedures", component: DentDocProcedures },
  { id: "images", label: "Imaging", component: DentDocImages },
];

const DentalDocumentation = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true); setIsPrintMode(true);
    try {
      await document.fonts.ready; await new Promise(r => setTimeout(r, 2000));
      const container = printContainerRef.current; if (!container) return;
      const els = container.querySelectorAll('.proposal-page'); if (!els.length) return;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLElement; const orig = el.style.cssText;
        el.style.width='794px';el.style.height='1123px';el.style.overflow='hidden';el.style.background='white';el.style.boxShadow='none';el.style.borderRadius='0';el.style.margin='0';
        await new Promise(r => setTimeout(r, 200));
        try { const d = await toPng(el, {width:794,height:1123,pixelRatio:1.5,backgroundColor:'#fff',skipAutoScale:true}); if(i>0)pdf.addPage(); pdf.addImage(d,"PNG",0,0,210,297); } catch { if(i>0)pdf.addPage(); }
        finally { el.style.cssText = orig; }
      }
      const blob=pdf.output("blob");const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="HealthOS24-Dental-Documentation.pdf";document.body.appendChild(link);link.click();
      setTimeout(()=>window.open(url,"_blank"),500);setTimeout(()=>{document.body.removeChild(link);URL.revokeObjectURL(url)},5000);
    } catch { alert("PDF failed."); } finally { setIsPrintMode(false); setIsDownloading(false); }
  }, []);

  const C = pages[currentPage].component;
  return (
    <div className="min-h-screen bg-muted/30">
      <style>{`@media print{@page{size:A4 portrait;margin:0}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.no-print{display:none!important}.proposal-page{width:210mm;height:297mm;overflow:hidden;page-break-after:always;background:white!important;box-shadow:none!important;margin:0!important;border-radius:0!important}}.proposal-page{width:210mm;min-height:297mm;background:white;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);border-radius:8px;overflow:hidden}`}</style>
      {!isPrintMode&&(<div className="no-print sticky top-0 z-50 bg-background border-b border-border"><div className="container mx-auto px-4 py-3 flex items-center justify-between"><Button variant="ghost" size="sm" onClick={()=>navigate("/documentation")} className="gap-2"><ArrowLeft className="h-4 w-4"/>Back</Button><div className="flex items-center gap-4"><Button variant="outline" size="icon" onClick={()=>setCurrentPage(p=>Math.max(0,p-1))} disabled={currentPage===0}><ChevronLeft className="h-4 w-4"/></Button><div className="flex items-center gap-1.5">{pages.map((_,i)=><button key={i} onClick={()=>setCurrentPage(i)} className={`w-2 h-2 rounded-full transition-colors ${i===currentPage?"bg-emerald-600":"bg-muted-foreground/30"}`}/>)}</div><Button variant="outline" size="icon" onClick={()=>setCurrentPage(p=>Math.min(pages.length-1,p+1))} disabled={currentPage===pages.length-1}><ChevronRight className="h-4 w-4"/></Button><span className="text-sm text-muted-foreground ml-2">{pages[currentPage].label}</span></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={()=>{setIsPrintMode(true);setTimeout(()=>{window.print();setTimeout(()=>setIsPrintMode(false),500)},100)}} className="gap-2"><Printer className="h-4 w-4"/>Print</Button><Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">{isDownloading?<Loader2 className="h-4 w-4 animate-spin"/>:<Download className="h-4 w-4"/>}{isDownloading?"Generating…":"Download PDF"}</Button></div></div></div>)}
      <div className={`print-container ${isPrintMode?"":"container mx-auto px-4 py-8"}`}>{isPrintMode?(<div ref={printContainerRef}>{pages.map(p=>{const Comp=p.component;return<Comp key={p.id}/>})}</div>):(<div className="flex justify-center"><C/></div>)}</div>
    </div>
  );
};
export default DentalDocumentation;
