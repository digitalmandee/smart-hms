import { Activity, Mail, Globe, Phone, CheckCircle2 } from "lucide-react";

export const CTASlide = () => {
  return (
    <div className="slide flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Main CTA */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 leading-tight">
        Ready to Transform Your<br />
        Hospital Operations?
      </h1>

      <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl">
        Join healthcare facilities already using HealthOS to streamline their workflows
      </p>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        {[
          "Complete Digital Transformation",
          "24/7 Technical Support",
          "Custom Implementation",
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="text-lg font-medium">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-xl w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">HealthOS</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg">info@smarthms.pk</span>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg">smart-hms.lovable.app</span>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg">+92 300 1234567</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-sm text-muted-foreground">
        © 2024 HealthOS. All rights reserved.
      </div>
    </div>
  );
};
