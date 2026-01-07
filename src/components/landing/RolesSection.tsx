import { 
  Crown, 
  Building, 
  Building2, 
  Stethoscope, 
  Heart, 
  UserCheck, 
  Pill, 
  FlaskConical, 
  Calculator 
} from "lucide-react";

const roles = [
  {
    icon: Crown,
    title: "Super Admin",
    description: "Platform-wide management",
    capabilities: ["Manage all organizations", "System settings", "Platform monitoring", "User oversight"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Building,
    title: "Org Admin",
    description: "Organization management",
    capabilities: ["User management", "Branch setup", "Module configuration", "Organization settings"],
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Building2,
    title: "Branch Admin",
    description: "Branch-level operations",
    capabilities: ["Branch settings", "Staff management", "Operational reports", "Local configuration"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    description: "Patient care & consultations",
    capabilities: ["View patient queue", "Record consultations", "Write prescriptions", "Follow-up scheduling"],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Heart,
    title: "Nurse",
    description: "Patient assistance",
    capabilities: ["Record vitals", "Patient preparation", "Assist consultations", "Care coordination"],
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: UserCheck,
    title: "Receptionist",
    description: "Front desk operations",
    capabilities: ["Patient registration", "Appointment booking", "Check-in management", "Queue management"],
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Pill,
    title: "Pharmacist",
    description: "Pharmacy operations",
    capabilities: ["Dispense medicines", "Inventory management", "Stock alerts", "Batch tracking"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: FlaskConical,
    title: "Lab Technician",
    description: "Laboratory management",
    capabilities: ["Process lab orders", "Record results", "Sample tracking", "Report generation"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Calculator,
    title: "Accountant",
    description: "Financial management",
    capabilities: ["Invoice management", "Payment collection", "Financial reports", "Revenue tracking"],
    color: "from-slate-500 to-gray-600",
  },
];

export const RolesSection = () => {
  return (
    <section id="roles" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Role-Based Access for
            <span className="text-primary"> Every Team Member</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Nine specialized roles with granular permissions ensure the right people have access to the right features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative p-6 rounded-2xl bg-card border border-border overflow-hidden hover:border-transparent transition-all duration-300"
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${role.color} mb-4`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-1 text-foreground">{role.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                
                <ul className="space-y-2">
                  {role.capabilities.map((capability) => (
                    <li key={capability} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color}`} />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
