import { 
  UserPlus, 
  CalendarPlus, 
  ClipboardCheck, 
  Stethoscope, 
  FileText, 
  Pill, 
  Receipt, 
  CreditCard,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Patient Registration",
    description: "Register new patients with demographics, contact info, and medical history",
    role: "Receptionist",
    color: "bg-blue-500",
  },
  {
    icon: CalendarPlus,
    title: "Appointment Booking",
    description: "Schedule appointments based on doctor availability and patient preference",
    role: "Receptionist",
    color: "bg-indigo-500",
  },
  {
    icon: ClipboardCheck,
    title: "Check-In",
    description: "Patient arrives, checks in, and receives a token number for the queue",
    role: "Receptionist",
    color: "bg-violet-500",
  },
  {
    icon: Stethoscope,
    title: "Consultation",
    description: "Doctor examines patient, records vitals, symptoms, and diagnosis",
    role: "Doctor",
    color: "bg-green-500",
  },
  {
    icon: FileText,
    title: "Prescription",
    description: "Doctor creates prescription with medicines, dosage, and instructions",
    role: "Doctor",
    color: "bg-emerald-500",
  },
  {
    icon: Pill,
    title: "Pharmacy Dispensing",
    description: "Pharmacist dispenses medicines based on prescription",
    role: "Pharmacist",
    color: "bg-orange-500",
  },
  {
    icon: Receipt,
    title: "Invoice Generation",
    description: "Generate invoice for consultation, medicines, and services",
    role: "Accountant",
    color: "bg-pink-500",
  },
  {
    icon: CreditCard,
    title: "Payment Collection",
    description: "Collect payment via cash, card, or digital methods",
    role: "Accountant",
    color: "bg-rose-500",
  },
];

export const FlowSection = () => {
  return (
    <section id="flow" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Seamless
            <span className="text-primary"> End-to-End Workflow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From patient walk-in to payment collection, every step is streamlined and connected.
          </p>
        </div>

        {/* Desktop Flow - Horizontal */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-rose-500 opacity-30" />
            
            <div className="grid grid-cols-8 gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon circle */}
                    <div className={`relative z-10 w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{step.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground`}>
                      {step.role}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-14 -right-4 text-muted-foreground/30">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Flow - Vertical */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical connection line */}
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-rose-500 opacity-30" />
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-4">
                  {/* Icon circle */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-6 w-6 text-white" />
                    {/* Step number */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {step.role}
                      </span>
                    </div>
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
