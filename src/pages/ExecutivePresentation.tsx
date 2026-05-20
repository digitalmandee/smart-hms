import { useState, useRef, useCallback } from "react";
import { FileDown, Printer, ArrowLeft, Loader2, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import { ExecTitleSlide } from "@/components/executive/ExecTitleSlide";
import { ExecProblemSlide } from "@/components/executive/ExecProblemSlide";
import { ExecWhyNowSlide } from "@/components/executive/ExecWhyNowSlide";
import { ExecAllInOneSlide } from "@/components/executive/ExecAllInOneSlide";
import { ExecTabeebiSlide } from "@/components/executive/ExecTabeebiSlide";
import { ExecCustomerStorySlide } from "@/components/executive/ExecCustomerStorySlide";
import { ExecModulesSlide } from "@/components/executive/ExecModulesSlide";
import { ExecClinicalSlide } from "@/components/executive/ExecClinicalSlide";
import { ExecAIEverywhereSlide } from "@/components/executive/ExecAIEverywhereSlide";
import { ExecMobileAppsSlide } from "@/components/executive/ExecMobileAppsSlide";
import { ExecTechSlide } from "@/components/executive/ExecTechSlide";
import { ExecKsaIndustryGapSlide } from "@/components/executive/ExecKsaIndustryGapSlide";
import { ExecKsaComplianceSlide } from "@/components/executive/ExecKsaComplianceSlide";
import { ExecKsaComplianceRoadmapSlide } from "@/components/executive/ExecKsaComplianceRoadmapSlide";
import { ExecMarketSlide } from "@/components/executive/ExecMarketSlide";
import { ExecCompetitionSlide } from "@/components/executive/ExecCompetitionSlide";
import { ExecDifferentiatorsSlide } from "@/components/executive/ExecDifferentiatorsSlide";
import { ExecTractionSlide } from "@/components/executive/ExecTractionSlide";
import { ExecROISlide } from "@/components/executive/ExecROISlide";
import { ExecRevenueStreamsSlide } from "@/components/executive/ExecRevenueStreamsSlide";
import { ExecUnitEconomicsSlide } from "@/components/executive/ExecUnitEconomicsSlide";
import { ExecFinancialsSlide } from "@/components/executive/ExecFinancialsSlide";
import { ExecGoToMarketSlide } from "@/components/executive/ExecGoToMarketSlide";
import { ExecRoadmapSlide } from "@/components/executive/ExecRoadmapSlide";
import { ExecTeamSlide } from "@/components/executive/ExecTeamSlide";
import { ExecRisksSlide } from "@/components/executive/ExecRisksSlide";
import { ExecVisionSlide } from "@/components/executive/ExecVisionSlide";
import { ExecAskSlide } from "@/components/executive/ExecAskSlide";
import { ExecCTASlide } from "@/components/executive/ExecCTASlide";
import { ExecDiagnosticsSlide } from "@/components/executive/ExecDiagnosticsSlide";
import { ExecInsuranceSlide } from "@/components/executive/ExecInsuranceSlide";
import { ExecWorkflowSlide } from "@/components/executive/ExecWorkflowSlide";
import { ExecAutomationSlide } from "@/components/executive/ExecAutomationSlide";
import { ExecFinanceOpsSlide } from "@/components/executive/ExecFinanceOpsSlide";
import { ExecClinicOnWheelsSlide } from "@/components/executive/ExecClinicOnWheelsSlide";

const TOTAL_SLIDES = 20;
const APPENDIX_SLIDES = 14;

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
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, 167.0625] });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        const el = slides[i] as HTMLElement;

        el.scrollIntoView();

        const originalStyle = el.style.cssText;
        el.style.width = "1200px";
        el.style.maxWidth = "1200px";
        el.style.minHeight = "675px";
        el.style.height = "675px";
        el.style.overflow = "hidden";
        el.style.margin = "0";
        el.style.borderRadius = "0";
        el.style.border = "none";
        el.style.boxShadow = "none";

        await new Promise(r => setTimeout(r, 300));

        const dataUrl = await toPng(el, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          width: 1200,
          height: 675,
        });

        el.style.cssText = originalStyle;
        pdf.addImage(dataUrl, "PNG", 0, 0, 297, 167.0625);
      }

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "HealthOS24-Product-Deck.pdf";
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

  const renderSlideToPng = useCallback(async (el: HTMLElement) => {
    const originalStyle = el.style.cssText;
    el.style.width = "1200px";
    el.style.maxWidth = "1200px";
    el.style.minHeight = "675px";
    el.style.height = "675px";
    el.style.overflow = "hidden";
    el.style.margin = "0";
    el.style.borderRadius = "0";
    el.style.border = "none";
    el.style.boxShadow = "none";
    await new Promise(r => setTimeout(r, 200));
    const dataUrl = await toPng(el, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: 1200,
      height: 675,
    });
    el.style.cssText = originalStyle;
    return dataUrl;
  }, []);

  const handleDownloadImages = useCallback(async () => {
    if (!printContainerRef.current) return;
    setIsDownloading(true);
    try {
      const slides = printContainerRef.current.querySelectorAll(".slide");
      const zip = new JSZip();
      const folder = zip.folder("HealthOS24-Pitch-Deck-Slides")!;

      for (let i = 0; i < slides.length; i++) {
        const el = slides[i] as HTMLElement;
        el.scrollIntoView();
        const dataUrl = await renderSlideToPng(el);
        const base64 = dataUrl.split(",")[1];
        const num = String(i + 1).padStart(2, "0");
        folder.file(`slide-${num}.png`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "HealthOS24-Pitch-Deck-Images.zip";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch (error) {
      console.error("Image export failed:", error);
      alert("Image export failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [renderSlideToPng]);

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
              <h1 className="font-semibold">HealthOS 24 — Investor Pitch Deck</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} core slides + {APPENDIX_SLIDES} appendix</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isDownloading}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading}>
                  {isDownloading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
                  ) : (
                    <><FileDown className="h-4 w-4 mr-2" />Export<ChevronDown className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadImages}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Download Images (ZIP)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {/* Core investor deck — 20 slides + thank-you */}
          {/* 1. Title */}
          <ExecTitleSlide />
          {/* 2. Problem */}
          <ExecProblemSlide />
          {/* 3. Why Now */}
          <ExecWhyNowSlide />
          {/* 4. Solution */}
          <ExecAllInOneSlide />
          {/* 5. Tabeebi AI (hero AI slide) */}
          <ExecTabeebiSlide />
          {/* 6. Clinical workflow */}
          <ExecClinicalSlide />
          {/* 7. KSA Industry Gap */}
          <ExecKsaIndustryGapSlide />
          {/* 8. Saudi-Ready compliance */}
          <ExecKsaComplianceSlide />
          {/* 9. Market */}
          <ExecMarketSlide />
          {/* 10. Competition */}
          <ExecCompetitionSlide />
          {/* 11. Differentiators */}
          <ExecDifferentiatorsSlide />
          {/* 12. Traction */}
          <ExecTractionSlide />
          {/* 13. Go-to-Market */}
          <ExecGoToMarketSlide />
          {/* 14. Business Model / Revenue Streams */}
          <ExecRevenueStreamsSlide />
          {/* 15. Unit Economics */}
          <ExecUnitEconomicsSlide />
          {/* 16. Financials */}
          <ExecFinancialsSlide />
          {/* 17. Roadmap */}
          <ExecRoadmapSlide />
          {/* 18. Team */}
          <ExecTeamSlide />
          {/* 19. Risks */}
          <ExecRisksSlide />
          {/* 20. Ask */}
          <ExecAskSlide />
          {/* Close */}
          <ExecCTASlide />

          {/* Appendix divider */}
          <div className="no-print max-w-[1200px] mx-auto my-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Appendix · Deep Dives ({APPENDIX_SLIDES})
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Appendix — deep dives, shown only on request */}
          <ExecModulesSlide />              {/* A1  full module catalog */}
          <ExecAIEverywhereSlide />         {/* A2  AI across every module */}
          <ExecKsaComplianceRoadmapSlide />{/* A3  KSA certification timeline */}
          <ExecCustomerStorySlide />        {/* A4  before/after case study */}
          <ExecROISlide />                  {/* A5  customer ROI metrics */}
          <ExecVisionSlide />               {/* A6  long-term vision horizons */}
          <ExecMobileAppsSlide />           {/* A7  mobile apps */}
          <ExecTechSlide />                 {/* A8  tech architecture */}
          <ExecDiagnosticsSlide />          {/* A9  lab/rad deep dive */}
          <ExecInsuranceSlide />            {/* A10 insurance & RCM */}
          <ExecWorkflowSlide />             {/* A11 workflow automation */}
          <ExecAutomationSlide />           {/* A12 automations */}
          <ExecFinanceOpsSlide />           {/* A13 finance ops */}
          <ExecClinicOnWheelsSlide />       {/* A14 mobile clinics */}
        </div>
      </div>
    </>
  );
};

export default ExecutivePresentation;
