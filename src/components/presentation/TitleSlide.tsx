import { Activity } from "lucide-react";

export const TitleSlide = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="slide flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-primary shadow-lg">
          <Activity className="h-16 w-16 text-primary-foreground" />
        </div>
        <span className="text-5xl font-bold tracking-tight">HealthOS</span>
      </div>

      {/* Main Title */}
      <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 leading-tight">
        Complete Hospital<br />
        Management System
      </h1>

      {/* Subtitle */}
      <p className="text-2xl text-muted-foreground text-center mb-12 max-w-2xl">
        20 Integrated Modules for Modern Healthcare Operations
      </p>

      {/* Feature highlights */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {['OPD & IPD', 'Laboratory', 'Pharmacy', 'Billing', 'HR & Payroll', 'Accounts'].map((item) => (
          <span
            key={item}
            className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            {item}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex items-center gap-6 text-muted-foreground text-sm">
        <span>{currentDate}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>Version 2.0</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};
