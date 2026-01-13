import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection";
import { FeaturesTabs } from "@/components/landing/FeaturesTabs";
import { WorkflowDiagram } from "@/components/landing/WorkflowDiagram";
import { RoleSelector } from "@/components/landing/RoleSelector";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBadges />
        <AnimatedSection animation="fade-up">
          <ProblemSolutionSection />
        </AnimatedSection>
        <FeaturesTabs />
        <WorkflowDiagram />
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
