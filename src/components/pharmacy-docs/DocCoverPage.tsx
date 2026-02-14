export const DocCoverPage = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="proposal-page flex flex-col justify-between bg-gradient-to-br from-background via-background to-emerald-500/5 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">24</div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground leading-tight">HealthOS</span>
            <span className="text-xs text-muted-foreground">Smart Hospital Management</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Operations Guide
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
        <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 rounded-full mb-8" />
        <h2 className="text-5xl font-bold text-foreground mb-4 tracking-tight">Pharmacy Module</h2>
        <p className="text-xl text-muted-foreground mb-12">Complete Operations Guide</p>

        <div className="bg-card border-2 border-emerald-500/20 rounded-2xl px-12 py-8 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">Module Documentation</p>
          <h3 className="text-3xl font-bold text-emerald-600">HealthOS 24 Pharmacy</h3>
          <p className="text-sm text-muted-foreground mt-2">Retail POS · Inventory · Dispensing · Procurement</p>
        </div>

        <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Version 2.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground">HealthOS 24</p>
            <p>Enterprise Healthcare Technology</p>
          </div>
          <div className="text-right text-muted-foreground">
            <p className="font-medium text-foreground">healthos24.com</p>
            <p>+971 506802430</p>
          </div>
        </div>
      </div>
    </div>
  );
};
