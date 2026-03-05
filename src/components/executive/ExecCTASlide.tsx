import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Phone, Mail, Globe, Calendar } from "lucide-react";
import { generateQRCodeUrl } from "@/lib/qrcode";

export function ExecCTASlide() {
  const qrUrl = generateQRCodeUrl("https://healthos24.com", 120);

  return (
    <div className="slide flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="absolute inset-0">
        <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">12 / 12</div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
        <HealthOS24Logo variant="full" size="xl" showTagline />

        <div className="space-y-3">
          <h2 className="text-4xl font-extrabold text-foreground">Let's Transform Your Hospital</h2>
          <p className="text-lg text-muted-foreground">
            See HealthOS 24 in action — schedule a personalized demo for your team.
          </p>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Phone, label: "+92 304 111 0024" },
                { icon: Mail, label: "hello@healthos24.com" },
                { icon: Globe, label: "healthos24.com" },
                { icon: Calendar, label: "Book a Demo" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border text-left">
                  <c.icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img src={qrUrl} alt="Scan to visit healthos24.com" className="w-28 h-28 rounded-xl border" />
            <span className="text-[10px] text-muted-foreground">Scan to visit</span>
          </div>
        </div>

        <p className="text-sm text-primary font-semibold mt-4">
          One Platform. Every Department. Powered by AI.
        </p>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>Thank You</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}
