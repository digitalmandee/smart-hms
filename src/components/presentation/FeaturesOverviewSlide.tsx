import { 
  Users, Calendar, Stethoscope, FlaskConical, Pill, Receipt, BarChart3, Store, 
  UserCog, Calculator, HeartPulse, ScanLine, Warehouse, Hotel, Siren, Scissors, 
  Droplet, Wallet, BadgePercent, Truck
} from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: Users, label: "Patients", color: "bg-teal-500" },
  { icon: Calendar, label: "Appointments", color: "bg-teal-500" },
  { icon: Stethoscope, label: "OPD", color: "bg-teal-500" },
  { icon: Siren, label: "Emergency", color: "bg-teal-500" },
  { icon: Scissors, label: "OT", color: "bg-teal-500" },
  { icon: Hotel, label: "IPD", color: "bg-teal-500" },
  { icon: HeartPulse, label: "Nursing", color: "bg-teal-500" },
  { icon: FlaskConical, label: "Laboratory", color: "bg-blue-500" },
  { icon: ScanLine, label: "Radiology", color: "bg-blue-500" },
  { icon: Droplet, label: "Blood Bank", color: "bg-blue-500" },
  { icon: Pill, label: "Pharmacy", color: "bg-green-500" },
  { icon: Store, label: "POS", color: "bg-green-500" },
  { icon: Receipt, label: "Billing", color: "bg-purple-500" },
  { icon: Wallet, label: "Doctor Wallet", color: "bg-purple-500" },
  { icon: BadgePercent, label: "Compensation", color: "bg-purple-500" },
  { icon: Calculator, label: "Accounts", color: "bg-purple-500" },
  { icon: Truck, label: "Procurement", color: "bg-orange-500" },
  { icon: Warehouse, label: "Inventory", color: "bg-orange-500" },
  { icon: UserCog, label: "HR & Payroll", color: "bg-orange-500" },
  { icon: BarChart3, label: "Reports", color: "bg-orange-500" },
];

const categories = [
  { label: "Clinical", color: "bg-teal-500", count: 7 },
  { label: "Diagnostics", color: "bg-blue-500", count: 3 },
  { label: "Pharmacy", color: "bg-green-500", count: 2 },
  { label: "Finance", color: "bg-purple-500", count: 4 },
  { label: "Operations", color: "bg-orange-500", count: 4 },
];

export const FeaturesOverviewSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Gradient Header Bar */}
      <div className="h-2 bg-gradient-to-r from-teal-500 via-blue-500 via-purple-500 to-orange-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HealthOS24Logo variant="icon" size="md" />
          <div>
            <h2 className="text-2xl font-bold">20 Integrated Modules</h2>
            <p className="text-sm text-muted-foreground">Complete Hospital Management at Your Fingertips</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          02 / 31
        </span>
      </div>

      {/* Category Legend */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2">
            <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }} className={cat.color} />
            <span className="text-sm font-medium">{cat.label}</span>
            <span className="text-xs text-muted-foreground">({cat.count})</span>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-5 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.label}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow group"
            >
              <div className={`p-3 rounded-xl ${module.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <Icon className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-sm font-medium text-center">{module.label}</span>
            </div>
          );
        })}
      </div>

      {/* Key Highlights */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground">Integrated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Real-time</div>
            <div className="text-xs text-muted-foreground">Data Sync</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Role-Based</div>
            <div className="text-xs text-muted-foreground">Access Control</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 - Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};
