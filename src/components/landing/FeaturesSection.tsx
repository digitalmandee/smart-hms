import { 
  Users, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Receipt,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Complete patient profiles with medical history, allergies, and QR-based identification.",
    highlight: "QR Code Check-in",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Token-based queue system with doctor schedules, appointment booking, and wait-time estimates.",
    highlight: "Live Queue Updates",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    icon: Stethoscope,
    title: "OPD Consultations",
    description: "Vitals recording, diagnosis entry, and prescription generation in one seamless flow.",
    highlight: "One-Click Prescriptions",
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: Pill,
    title: "Pharmacy & Inventory",
    description: "Medicine dispensing from prescriptions, batch tracking, and automatic reorder alerts.",
    highlight: "Expiry Alerts",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description: "Invoicing, partial payments, JazzCash/EasyPaisa integration, and payment tracking.",
    highlight: "Multiple Payment Methods",
    color: "from-rose-500/20 to-pink-500/20",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Revenue reports, patient statistics, and operational insights for better decisions.",
    highlight: "Daily Summaries",
    color: "from-indigo-500/20 to-blue-500/20",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Everything your clinic needs,
            <span className="text-primary"> nothing it doesn&apos;t</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built by talking to 100+ Pakistani clinics. Every feature solves a real problem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                
                {/* Highlight badge */}
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary mb-4">
                  {feature.highlight}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
