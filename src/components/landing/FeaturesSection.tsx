import { 
  Users, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Receipt, 
  BarChart3,
  Bell,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Complete patient records with medical history, allergies, and custom fields. QR code integration for quick identification.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Calendar,
    title: "Appointment System",
    description: "Smart scheduling with doctor availability, token management, and automated reminders via SMS/Email.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Stethoscope,
    title: "OPD & Consultations",
    description: "Streamlined consultation workflow with vitals recording, diagnosis, and prescription generation.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Pill,
    title: "Pharmacy Management",
    description: "Complete inventory control with batch tracking, expiry alerts, low stock notifications, and dispensing.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description: "Flexible invoicing with multiple payment methods, partial payments, and overdue tracking.",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Comprehensive dashboards with revenue analysis, patient statistics, and operational insights.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for appointments, overdue invoices, low stock, and expiring medicines.",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Granular permissions with 9 user roles ensuring data security and operational efficiency.",
    color: "bg-red-500/10 text-red-500",
  },
  {
    icon: Zap,
    title: "Multi-Branch Support",
    description: "Manage multiple clinic locations with centralized control and branch-level reporting.",
    color: "bg-indigo-500/10 text-indigo-500",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Run Your
            <span className="text-primary"> Healthcare Facility</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of modules designed specifically for clinics and hospitals of all sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
