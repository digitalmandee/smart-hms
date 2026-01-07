import { ArrowRight, FileX, Clock, AlertTriangle, Package, Calculator, CheckCircle2 } from "lucide-react";

const problems = [
  {
    icon: FileX,
    problem: "Paper patient files getting lost?",
    solution: "Digital records with instant search",
  },
  {
    icon: Clock,
    problem: "Patients waiting hours for their turn?",
    solution: "Smart queue with live token updates",
  },
  {
    icon: AlertTriangle,
    problem: "Pharmacy running out of critical medicines?",
    solution: "Auto low-stock alerts & expiry tracking",
  },
  {
    icon: Package,
    problem: "Prescription errors causing returns?",
    solution: "Doctor to pharmacy digital handoff",
  },
  {
    icon: Calculator,
    problem: "End-of-day billing reconciliation chaos?",
    solution: "Real-time revenue & payment tracking",
  },
];

export const ProblemSolutionSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            These problems cost clinics thousands every month. We've solved them.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {problems.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col md:flex-row items-stretch bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Problem side */}
              <div className="flex-1 p-6 md:p-8 flex items-center gap-4 bg-destructive/5 border-b md:border-b-0 md:border-r border-border">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <item.icon className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-lg font-medium text-foreground">{item.problem}</p>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center px-4 bg-muted/50">
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
              
              {/* Solution side */}
              <div className="flex-1 p-6 md:p-8 flex items-center gap-4 bg-primary/5">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg font-medium text-primary">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
