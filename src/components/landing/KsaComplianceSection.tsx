import { Link } from "react-router-dom";
import { FileText, Receipt, Pill, ScanBarcode, ShieldAlert, Fingerprint, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import { StaggerChildren } from "./AnimatedSection";

const integrations = [
  { icon: FileText, name: "NPHIES", desc: "HL7 FHIR insurance claims, eligibility & pre-authorization" },
  { icon: Receipt, name: "ZATCA Phase 2", desc: "E-invoicing clearance & compliance reporting" },
  { icon: Pill, name: "Wasfaty", desc: "MOH electronic prescription gateway" },
  { icon: ScanBarcode, name: "Tatmeen", desc: "SFDA drug track & trace via GS1 DataMatrix" },
  { icon: ShieldAlert, name: "HESN", desc: "Communicable disease reporting to MOH" },
  { icon: Fingerprint, name: "Nafath", desc: "National SSO identity verification" },
  { icon: Smartphone, name: "Sehhaty", desc: "Push appointments & results to patients" },
];

export const KsaComplianceSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              🇸🇦 Saudi Arabia Ready
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for KSA Compliance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Full integration with all Saudi regulatory systems — NPHIES, ZATCA, Wasfaty, Tatmeen, HESN, Nafath & Sehhaty — out of the box.
            </p>
          </div>
        </AnimatedSection>

        <StaggerChildren
          staggerDelay={80}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10"
          animation="fade-up"
        >
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </StaggerChildren>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="text-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/ksa-documentation">
                <Download className="h-4 w-4" />
                Download Full Compliance Guide (PDF)
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
