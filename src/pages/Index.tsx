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
import { Helmet } from "react-helmet-async";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is HealthOS 24?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HealthOS 24 is a 24/7 hospital management system covering OPD, IPD, pharmacy, lab, radiology, billing, HR and finance in one platform.",
      },
    },
    {
      "@type": "Question",
      name: "Which workflows does HealthOS 24 support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Patient registration, appointments, prescriptions, surgery, dialysis, dental, blood bank, immunization, telemedicine, home care, mobile units, insurance claims (NPHIES) and ZATCA e-invoicing.",
      },
    },
    {
      "@type": "Question",
      name: "Is HealthOS 24 available in Arabic and Urdu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The interface fully supports English, Arabic (RTL) and Urdu with localized clinical and financial workflows.",
      },
    },
  ],
};

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
