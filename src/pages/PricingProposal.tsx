import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { ProposalCoverPage } from "@/components/proposal/ProposalCoverPage";
import { ProposalExecutiveSummary } from "@/components/proposal/ProposalExecutiveSummary";
import { ProposalPricingPage } from "@/components/proposal/ProposalPricingPage";
import { ProposalInvestmentSummary } from "@/components/proposal/ProposalInvestmentSummary";
import { ProposalTermsPage } from "@/components/proposal/ProposalTermsPage";

const pages = [
  { id: "cover", label: "Cover", component: ProposalCoverPage },
  { id: "summary", label: "Executive Summary", component: ProposalExecutiveSummary },
  { id: "pricing", label: "Pricing Details", component: ProposalPricingPage },
  { id: "investment", label: "Investment Summary", component: ProposalInvestmentSummary },
  { id: "terms", label: "Terms & Conditions", component: ProposalTermsPage },
];

const PricingProposal = () => {
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

  const handleDownload = () => {
    handlePrint();
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
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            padding: 0 !important;
            background: white !important;
          }
          
          .proposal-page {
            width: 210mm;
            min-height: 297mm;
            page-break-after: always;
            page-break-inside: avoid;
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          
          .proposal-page:last-child {
            page-break-after: auto;
          }
        }
        
        .proposal-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>

      {/* Toolbar - Hidden when printing */}
      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>

              {/* Center: Page navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  {pages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === currentPage
                          ? "bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === pages.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground ml-2">
                  {pages[currentPage].label}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`print-container ${isPrintMode ? "" : "container mx-auto px-4 py-8"}`}>
        {isPrintMode ? (
          // Print mode: Show all pages
          <div className="space-y-0">
            {pages.map((page) => {
              const PageComponent = page.component;
              return <PageComponent key={page.id} />;
            })}
          </div>
        ) : (
          // Normal mode: Show single page
          <div className="flex justify-center">
            <CurrentPageComponent />
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingProposal;
