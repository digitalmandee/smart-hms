import { useState, useRef, useCallback } from "react";
import { FileDown, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  PitchOpeningSlide,
  PitchProblemSlide,
  PitchModulesSlide,
  PitchJourneySlide,
  PitchMobileSlide,
} from "@/components/pitch/PitchSlidesA";
import { PitchPaperlessSlide } from "@/components/pitch/PitchPaperlessSlide";
import {
  PitchAISlide,
  PitchComparisonSlide,
  PitchCompliancePitchSlide,
  PitchCloseSlide,
} from "@/components/pitch/PitchSlidesB";

const TOTAL_SLIDES = 10;

export default function PitchDeck() {
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => window.print(), []);

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

        await new Promise((r) => setTimeout(r, 300));

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

      pdf.save("HMIS-4-Minute-Pitch.pdf");
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

      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3" dir="ltr">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">4-Minute Pitch</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} slides · about 25 seconds each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isDownloading}>
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

      <div className="bg-muted/30 min-h-screen">
        <div ref={printContainerRef} className="py-8 px-4">
          <PitchOpeningSlide />
          <PitchProblemSlide />
          <PitchModulesSlide />
          <PitchJourneySlide />
          <PitchMobileSlide />
          <PitchAISlide />
          <PitchComparisonSlide />
          <PitchCompliancePitchSlide />
          <PitchCloseSlide />
        </div>
      </div>
    </>
  );
}
