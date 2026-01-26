import { FlaskConical, MapPin, CheckCircle2, Beaker, Activity, Network } from "lucide-react";

const emirateLabs = [
  { emirate: "Dubai", labs: 18, color: "bg-blue-500" },
  { emirate: "Abu Dhabi", labs: 12, color: "bg-green-500" },
  { emirate: "Sharjah", labs: 10, color: "bg-purple-500" },
  { emirate: "Ajman", labs: 5, color: "bg-orange-500" },
  { emirate: "Ras Al Khaimah", labs: 3, color: "bg-red-500" },
  { emirate: "Fujairah", labs: 2, color: "bg-teal-500" },
];

const capabilities = [
  "Real-time result syncing across branches",
  "Barcode sample tracking & chain of custody",
  "Auto-flagging abnormal values with alerts",
  "Multi-branch inventory synchronization",
  "Quality control dashboards & analytics",
  "LIMS integration with major analyzers",
];

export const LabNetworkSlide = () => {
  const totalLabs = emirateLabs.reduce((sum, e) => sum + e.labs, 0);

  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Laboratory Network</h2>
            <p className="text-sm text-muted-foreground">Comprehensive diagnostic coverage across UAE</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">25 / 27</div>
      </div>

      {/* Hero Stat */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-primary/10 rounded-2xl px-8 py-4">
          <Network className="h-10 w-10 text-primary" />
          <div className="text-left">
            <div className="text-5xl font-bold text-primary">{totalLabs}+</div>
            <div className="text-sm text-muted-foreground">Diagnostic Labs Connected</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Emirates Coverage */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Coverage by Emirate</h3>
          </div>
          
          <div className="space-y-3">
            {emirateLabs.map((item) => (
              <div key={item.emirate} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm">{item.emirate}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.labs / 18) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8">{item.labs}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Map Visual */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="flex-1">
                <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-muted-foreground">Result Availability</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="flex-1">
                <Beaker className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-muted-foreground">Test Parameters</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="flex-1">
                <FlaskConical className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">&lt;2hr</div>
                <div className="text-xs text-muted-foreground">Avg. Report Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Capabilities */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Integration Capabilities</h3>
          </div>

          <div className="space-y-3">
            {capabilities.map((cap, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{cap}</span>
              </div>
            ))}
          </div>

          {/* Lab Partners Note */}
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-center">
              <strong>Seamless Integration</strong> with all major lab equipment manufacturers and existing LIMS systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
