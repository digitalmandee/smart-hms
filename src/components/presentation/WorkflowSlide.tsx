import { 
  UserPlus, 
  ListOrdered, 
  Stethoscope, 
  FileText, 
  Pill, 
  Receipt,
  ArrowRight 
} from "lucide-react";

const workflowSteps = [
  {
    icon: UserPlus,
    title: "Register",
    description: "CNIC auto-fill, MRN generation",
    color: "bg-blue-500",
  },
  {
    icon: ListOrdered,
    title: "Token Queue",
    description: "Token issued, TV display",
    color: "bg-violet-500",
  },
  {
    icon: Stethoscope,
    title: "Consultation",
    description: "Vitals → Doctor → Diagnosis",
    color: "bg-emerald-500",
  },
  {
    icon: FileText,
    title: "Orders",
    description: "Lab tests, imaging, Rx",
    color: "bg-amber-500",
  },
  {
    icon: Pill,
    title: "Dispensing",
    description: "Pharmacy fulfillment",
    color: "bg-rose-500",
  },
  {
    icon: Receipt,
    title: "Billing",
    description: "Invoice & payment",
    color: "bg-teal-500",
  },
];

export const WorkflowSlide = () => {
  return (
    <div className="slide flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-2">
            Patient Journey
          </span>
          <h2 className="text-3xl font-bold">OPD Workflow</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">24 / 32</span>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
        Complete patient flow from registration to billing in a seamless, integrated workflow
      </p>

      {/* Workflow Steps */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center">
                {/* Step Card */}
                <div className="flex flex-col items-center">
                  <div className={`${step.color} p-4 rounded-2xl shadow-lg mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground text-center max-w-[120px]">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-4 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">5 min</p>
          <p className="text-sm text-muted-foreground">Avg. Registration Time</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">100%</p>
          <p className="text-sm text-muted-foreground">Digital Records</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">Real-time</p>
          <p className="text-sm text-muted-foreground">Queue Updates</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 - AI-Powered Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};
