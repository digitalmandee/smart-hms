import { useState, useRef, useCallback } from "react";
import { FileDown, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  PW01Title, PW02Why, PW03Map, PW04MasterData, PW05Suppliers, PW06Procurement,
  PW07GRN, PW08Storage, PW09Channels, PW10POS, PW11Returns, PW12Reports,
  PW13WHArch, PW14Inbound, PW15Moves, PW16Outbound, PW17Cycle, PW18Dash,
  PW19KSA, PW20Finance, PW21Connected, PW22CTA,
} from "@/components/presentation/pharmacy-warehouse/PWSlides";

const TOTAL_SLIDES = 22;

const PharmacyWarehousePresentation = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 1500));

      const container = printContainerRef.current;
      if (!container) {
        alert("PDF generation failed: container not ready.");
        return;
      }
      const slideElements = container.querySelectorAll(".slide");
      if (slideElements.length === 0) {
        alert("No slides found.");
        return;
      }

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = 297;
      const pdfHeight = 210;
      const pixelWidth = 1123;
      const pixelHeight = 794;

      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i] as HTMLElement;
        const original = el.style.cssText;
        el.style.width = `${pixelWidth}px`;
        el.style.height = `${pixelHeight}px`;
        el.style.minHeight = `${pixelHeight}px`;
        el.style.maxWidth = `${pixelWidth}px`;
        el.style.overflow = "hidden";
        el.style.margin = "0";
        el.style.borderRadius = "0";
        el.style.border = "none";
        el.style.boxShadow = "none";
        el.style.background = "white";

        await new Promise((r) => setTimeout(r, 150));
        try {
          const dataUrl = await toPng(el, {
            width: pixelWidth,
            height: pixelHeight,
            pixelRatio: 1.5,
            backgroundColor: "#ffffff",
            skipAutoScale: true,
          });
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        } catch (e) {
          console.error(`Slide ${i + 1} failed`, e);
          if (i > 0) pdf.addPage();
          pdf.text(`Slide ${i + 1} failed to render`, 40, 100);
        } finally {
          el.style.cssText = original;
        }
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "HealthOS24-Pharmacy-Warehouse.pdf";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => window.open(url, "_blank"), 500);
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 5000);
    } catch (e) {
      console.error("PDF generation failed", e);
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
            width: 297mm; height: 210mm;
            page-break-after: always;
            padding: 15mm; box-sizing: border-box; overflow: hidden;
          }
          .slide:last-child { page-break-after: avoid; }
        }
        @media screen {
          .slide {
            width: 100%; max-width: 1200px; min-height: 675px;
            margin: 0 auto 2rem; padding: 2rem;
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
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
              <h1 className="font-semibold">Pharmacy & Warehouse Presentation</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} slides · Operations Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                <><FileDown className="h-4 w-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="no-print bg-muted/50 border-b border-border px-4 py-3">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            💡 Click <strong>"Download PDF"</strong> to save as a real PDF, or <strong>"Print"</strong> for the browser dialog.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 min-h-screen">
        <div ref={printContainerRef} className="py-8 px-4">
          <PW01Title /><PW02Why /><PW03Map />
          <PW04MasterData /><PW05Suppliers /><PW06Procurement /><PW07GRN /><PW08Storage />
          <PW09Channels /><PW10POS /><PW11Returns /><PW12Reports />
          <PW13WHArch /><PW14Inbound /><PW15Moves /><PW16Outbound /><PW17Cycle /><PW18Dash />
          <PW19KSA /><PW20Finance /><PW21Connected /><PW22CTA />
        </div>
      </div>
    </>
  );
};

export default PharmacyWarehousePresentation;
