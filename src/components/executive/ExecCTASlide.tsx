import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Phone, Mail, Globe, Calendar, Layers, Bot, Rocket, HeadphonesIcon, RefreshCw } from "lucide-react";
import { generateQRCodeUrl } from "@/lib/qrcode";

const reasons = [
  { icon: Layers, title: "True All-in-One", desc: "One unified codebase — clinical, admin, finance, operations. Replace 10+ tools." },
  { icon: Bot, title: "AI-Powered", desc: "Built-in medical AI (Tabeebi) + AI in every module — not bolted on, built in." },
  { icon: Rocket, title: "4-Week Go-Live", desc: "Deployment in weeks. Data migration, training, and parallel-run included." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated account manager, on-site training, <2hr response SLA." },
  { icon: Globe, title: "Trilingual + RTL", desc: "English, Arabic & Urdu with full RTL. Multi-branch with central admin." },
  { icon: RefreshCw, title: "Always Evolving", desc: "Monthly releases, security patches, compliance updates — zero extra cost." },
];

export function ExecCTASlide() {
  const qrUrl = generateQRCodeUrl("https://healthos24.com", 120);

  return (
    <div className="slide flex flex-col relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="absolute inset-0">
        <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Why Us & Next Steps</p>
          <h2 className="text-3xl font-extrabold text-foreground">Why HealthOS 24 — Let's Get Started</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">16 / 16</span>
      </div>

      <div className="flex gap-6 flex-1 relative z-10">
        {/* Left: 6 reasons */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {reasons.map((r, i) => (
            <div key={r.title} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground mb-0.5">{r.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Contact + QR */}
        <div className="w-[260px] flex flex-col items-center gap-4">
          <HealthOS24Logo variant="full" size="lg" />

          <div className="space-y-2 w-full">
            {[
              { icon: Phone, label: "+92 304 111 0024" },
              { icon: Mail, label: "hello@healthos24.com" },
              { icon: Globe, label: "healthos24.com" },
              { icon: Calendar, label: "Book a Demo" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border text-left">
                <c.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">{c.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <img src={qrUrl} alt="Scan to visit healthos24.com" className="w-24 h-24 rounded-xl border" />
            <span className="text-[10px] text-muted-foreground">Scan to visit</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span className="text-primary font-semibold">One Platform. Every Department. Powered by AI.</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}
