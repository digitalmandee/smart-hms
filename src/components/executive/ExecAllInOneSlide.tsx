import { Stethoscope, Hotel, Scissors, Siren, FlaskConical, ScanLine, Pill, UserCog, Calculator, Truck, Warehouse, BarChart3, Globe } from "lucide-react";

const departments = [
  { icon: Stethoscope, name: "OPD", color: "bg-blue-500" },
  { icon: Hotel, name: "IPD", color: "bg-indigo-500" },
  { icon: Scissors, name: "Surgery & OT", color: "bg-violet-500" },
  { icon: Siren, name: "Emergency", color: "bg-red-500" },
  { icon: FlaskConical, name: "Laboratory", color: "bg-emerald-500" },
  { icon: ScanLine, name: "Radiology", color: "bg-cyan-500" },
  { icon: Pill, name: "Pharmacy", color: "bg-pink-500" },
  { icon: UserCog, name: "HR & Payroll", color: "bg-amber-500" },
  { icon: Calculator, name: "Finance", color: "bg-teal-500" },
  { icon: Truck, name: "Procurement", color: "bg-orange-500" },
  { icon: Warehouse, name: "Inventory", color: "bg-lime-600" },
  { icon: BarChart3, name: "Reports & BI", color: "bg-purple-500" },
];

export function ExecAllInOneSlide() {
  return (
    <div className="slide flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-primary/5">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">4 / 16</div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        <p className="text-sm text-primary font-semibold mb-2">The Solution</p>
        <h2 className="text-4xl font-extrabold text-foreground mb-2 text-center">Replace 10 Systems With 1</h2>
        <p className="text-base text-muted-foreground mb-10 text-center">One Platform. Every Department. Fully Integrated.</p>

        {/* Hub-spoke diagram */}
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: 380 }}>
          {/* Center hub */}
          <div className="absolute z-20 w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center shadow-2xl border-4 border-background">
            <span className="text-2xl font-extrabold text-primary-foreground">24</span>
            <span className="text-[9px] text-primary-foreground/80 font-semibold">HealthOS</span>
          </div>

          {/* Spokes */}
          {departments.map((dept, i) => {
            const angle = (i * 360) / departments.length - 90;
            const rad = (angle * Math.PI) / 180;
            const radius = 170;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <div key={dept.name} className="absolute z-10" style={{ left: `calc(50% + ${x}px - 44px)`, top: `calc(50% + ${y}px - 44px)` }}>
                {/* Connector line (SVG would be better but using CSS) */}
                <div className="flex flex-col items-center w-[88px]">
                  <div className={`w-12 h-12 rounded-xl ${dept.color} flex items-center justify-center text-white shadow-lg`}>
                    <dept.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground mt-1.5 text-center leading-tight">{dept.name}</span>
                </div>
              </div>
            );
          })}

          {/* SVG connector lines */}
          <svg className="absolute inset-0 w-full h-full z-0" style={{ minHeight: 380 }}>
            {departments.map((dept, i) => {
              const angle = (i * 360) / departments.length - 90;
              const rad = (angle * Math.PI) / 180;
              const radius = 170;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <line
                  key={dept.name}
                  x1="50%" y1="50%"
                  x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`}
                  stroke="hsl(var(--primary))"
                  strokeOpacity="0.2"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  style={{ x1: '50%', y1: '50%' } as any}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/80 border">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Available in 3 Languages:</span>
          <span className="text-[11px] text-muted-foreground font-medium">English · عربي · اردو</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}
