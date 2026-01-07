import { UserPlus, ClipboardList, Stethoscope, Pill, CreditCard, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Registration",
    description: "Patient walks in, receptionist creates profile in 30 seconds",
    role: "Receptionist",
    roleColor: "bg-blue-500",
  },
  {
    icon: ClipboardList,
    number: "02",
    title: "Token & Queue",
    description: "Auto-generated token, patient sees their position on display",
    role: "System",
    roleColor: "bg-violet-500",
  },
  {
    icon: Stethoscope,
    number: "03",
    title: "Consultation",
    description: "Doctor sees patient history, records vitals, writes prescription",
    role: "Doctor",
    roleColor: "bg-emerald-500",
  },
  {
    icon: Pill,
    number: "04",
    title: "Dispensing",
    description: "Pharmacist sees digital prescription, dispenses from inventory",
    role: "Pharmacist",
    roleColor: "bg-orange-500",
  },
  {
    icon: CreditCard,
    number: "05",
    title: "Billing",
    description: "Single invoice for everything, multiple payment options",
    role: "Cashier",
    roleColor: "bg-rose-500",
  },
];

export const FlowSection = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            From walk-in to
            <span className="text-primary"> walk-out in 5 steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how SmartHMS connects every department seamlessly
          </p>
        </div>

        {/* Desktop: Horizontal flow */}
        <div className="hidden lg:block max-w-6xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Card */}
                  <div className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    {/* Step number */}
                    <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                    
                    {/* Role badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${step.roleColor}/10`}>
                      <div className={`w-2 h-2 rounded-full ${step.roleColor}`} />
                      <span className="text-xs font-medium text-foreground">{step.role}</span>
                    </div>
                  </div>
                  
                  {/* Arrow to next */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-24 -right-4 z-10">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Vertical flow */}
        <div className="lg:hidden max-w-md mx-auto">
          <div className="relative">
            {/* Vertical connection line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary to-primary/20" />
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.number} className="relative flex gap-6">
                  {/* Step indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${step.roleColor}/10 mb-2`}>
                      <div className={`w-2 h-2 rounded-full ${step.roleColor}`} />
                      <span className="text-xs font-medium text-foreground">{step.role}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
