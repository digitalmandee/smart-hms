import { useState, useRef, useCallback } from "react";
import { FileDown, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { ExecTitleSlide } from "@/components/executive/ExecTitleSlide";
import { ExecAboutUsSlide } from "@/components/executive/ExecAboutUsSlide";
import { ExecProblemSlide } from "@/components/executive/ExecProblemSlide";
import { ExecAllInOneSlide } from "@/components/executive/ExecAllInOneSlide";
import { ExecModulesSlide } from "@/components/executive/ExecModulesSlide";
import { ExecAutomationSlide } from "@/components/executive/ExecAutomationSlide";
import { ExecWorkflowSlide } from "@/components/executive/ExecWorkflowSlide";
import { ExecTabeebiSlide } from "@/components/executive/ExecTabeebiSlide";
import { ExecTechSlide } from "@/components/executive/ExecTechSlide";
import { ExecROISlide } from "@/components/executive/ExecROISlide";
import { ExecWhyUsSlide } from "@/components/executive/ExecWhyUsSlide";
import { ExecCTASlide } from "@/components/executive/ExecCTASlide";

const TOTAL_SLIDES = 12;

const ExecutivePresentation = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!printContainerRef.current) return;
    setIsDownloading(true);

    try {
      const slides = printContainerRef.current.querySelectorAll(".slide");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        const el = slides[i] as HTMLElement;

        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          position: fixed; left: -9999px; top: 0;
          width: 1200px; height: 675px; max-width: 1200px;
          overflow: hidden; box-sizing: border-box;
          padding: 2rem; background: white;
        `;
        document.body.appendChild(clone);
        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await toPng(clone, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          width: 1200,
          height: 675,
        });

        document.body.removeChild(clone);
        pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
      }

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "HealthOS24-Executive-Deck.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .slide {
            width: 297mm; height: 210mm; page-break-after: always;
            padding: 15mm; box-sizing: border-box; overflow: hidden;
          }
          .slide:last-child { page-break-after: avoid; }
        }
        @media screen {
          .slide {
            width: 100%; max-width: 1200px; min-height: 675px;
            margin: 0 auto 2rem; padding: 2rem;
            border: 1px solid hsl(var(--border)); border-radius: 0.5rem;
            background: hsl(var(--background));
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            position: relative;
          }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">Executive Pitch Deck</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} slides • Executive Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
              ) : (
                <><FileDown className="h-4 w-4 mr-2" />Download PDF</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="no-print bg-muted/50 border-b border-border px-4 py-3">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            💡 Click <strong>"Download PDF"</strong> to save as a real PDF file, or <strong>"Print"</strong> to open your browser's print dialog.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 min-h-screen">
        <div ref={printContainerRef} className="py-8 px-4">
          <ExecTitleSlide />
          <ExecAboutUsSlide />
          <ExecProblemSlide />
          <ExecAllInOneSlide />
          <ExecModulesSlide />
          <ExecAutomationSlide />
          <ExecWorkflowSlide />
          <ExecTabeebiSlide />
          <ExecTechSlide />
          <ExecROISlide />
          <ExecWhyUsSlide />
          <ExecCTASlide />
        </div>
      </div>
    </>
  );
};

export default ExecutivePresentation;
