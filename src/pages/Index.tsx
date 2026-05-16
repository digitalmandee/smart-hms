import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection";
import { FeaturesTabs } from "@/components/landing/FeaturesTabs";

import { WorkflowDiagram } from "@/components/landing/WorkflowDiagram";
import { ProcurementCycleDiagram } from "@/components/landing/ProcurementCycleDiagram";
import { WarehouseSection } from "@/components/landing/WarehouseSection";
import { KsaComplianceSection } from "@/components/landing/KsaComplianceSection";
import { KsaExpansionSection } from "@/components/landing/KsaExpansionSection";
import { RoleSelector } from "@/components/landing/RoleSelector";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="HealthOS 24 — 24/7 Smart Hospital Management System"
        description="HealthOS 24 unifies OPD, IPD, pharmacy, lab, radiology, billing, HR and finance into one 24/7 hospital management platform."
        path="/"
      />
      <Navbar />
      <main>
        <HeroSection />
        <TrustBadges />
        <AnimatedSection animation="fade-up">
          <ProblemSolutionSection />
        </AnimatedSection>
        <FeaturesTabs />
        
        <WorkflowDiagram />
        <ProcurementCycleDiagram />
        <WarehouseSection />
        <KsaComplianceSection />
        <KsaExpansionSection />
        <RoleSelector />
        <ComparisonTable />
        <TestimonialsSection />
        <AnimatedSection animation="fade-up">
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-up">
          <CTASection />
        </AnimatedSection>
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
};

export default Index;
