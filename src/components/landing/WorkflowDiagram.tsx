import { UserPlus, Clock, Stethoscope, FileText, Pill, Receipt, ArrowRight, Bot, Brain } from 'lucide-react';
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
    icon: Bot,
    title: 'AI Pre-Screen',
    description: 'Tabeebi collects symptoms & documents history',
    color: 'bg-primary',
    isAI: true,
  },
  {
    icon: Stethoscope,
    title: 'Consult',
    description: 'Doctor sees pre-screened patient with AI summary ready',
    color: 'bg-teal-600',
  },
  {
    icon: Brain,
    title: 'AI Prescription',
    description: 'AI-assisted e-prescription with drug interaction checks',
    color: 'bg-orange-500',
    isAI: true,
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
    <section id="flow" className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            AI-Enhanced Flow
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From Walk-in to Walkout — <span className="text-primary">AI at Every Step</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tabeebi pre-screens patients, generates clinical summaries, and assists with prescriptions — all integrated into the flow.
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
                  <div className="flex flex-col items-center text-center w-32">
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg mb-3 ${step.isAI ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h4 className={`font-semibold mb-1 text-sm ${step.isAI ? 'text-primary' : ''}`}>{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center px-1 mt-[-60px]">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
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
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center text-white shadow-lg ${step.isAI ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-12 bg-gradient-to-b from-muted-foreground/30 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className={`font-semibold ${step.isAI ? 'text-primary' : ''}`}>{step.title}</h4>
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
            <span className="font-bold text-primary">15 minutes</span> — thanks to AI pre-screening
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};
