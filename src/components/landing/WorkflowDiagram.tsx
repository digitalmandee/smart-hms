import { UserPlus, Clock, Stethoscope, FileText, Pill, Receipt, ArrowRight } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const steps = [
  {
    icon: UserPlus,
    title: 'Register',
    description: 'Patient walks in, registered in 30 seconds',
    color: 'bg-blue-500',
  },
  {
    icon: Clock,
    title: 'Queue',
    description: 'Token assigned, wait time displayed',
    color: 'bg-purple-500',
  },
  {
    icon: Stethoscope,
    title: 'Consult',
    description: 'Doctor sees patient, records vitals & diagnosis',
    color: 'bg-primary',
  },
  {
    icon: FileText,
    title: 'Prescribe',
    description: 'E-prescription created, sent to pharmacy',
    color: 'bg-orange-500',
  },
  {
    icon: Pill,
    title: 'Dispense',
    description: 'Pharmacist prepares medicines',
    color: 'bg-pink-500',
  },
  {
    icon: Receipt,
    title: 'Billing',
    description: 'Invoice generated, payment collected',
    color: 'bg-success',
  },
];

export const WorkflowDiagram = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Seamless Flow
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From Walk-in to Walkout in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every step is connected. No data re-entry. No lost prescriptions. Just smooth operations.
          </p>
        </AnimatedSection>

        {/* Desktop: Horizontal flow */}
        <div className="hidden lg:block">
          <StaggerChildren
            staggerDelay={150}
            className="flex items-start justify-between relative"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-col items-center text-center w-36">
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center px-2 mt-[-60px]">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10" />
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </StaggerChildren>
        </div>

        {/* Mobile: Vertical flow */}
        <div className="lg:hidden">
          <StaggerChildren staggerDelay={100} className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-12 bg-gradient-to-b from-muted-foreground/30 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </StaggerChildren>
        </div>

        {/* Bottom CTA */}
        <AnimatedSection animation="fade-up" delay={400} className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Average patient visit time reduced from <span className="font-bold text-foreground">45 minutes</span> to{' '}
            <span className="font-bold text-primary">15 minutes</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};
