import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleSlideProps {
  feature: {
    id: string;
    icon: LucideIcon;
    label: string;
    title: string;
    description: string;
    highlights: string[];
    screenshot: React.ComponentType;
  };
  slideNumber: number;
  totalSlides: number;
}

export const ModuleSlide = ({ feature, slideNumber, totalSlides }: ModuleSlideProps) => {
  const Icon = feature.icon;
  const ScreenshotComponent = feature.screenshot;

  return (
    <div className="slide flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            "bg-primary/10"
          )}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">{feature.label}</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-5 gap-8">
        {/* Left: Screenshot (3 cols) */}
        <div className="col-span-3 bg-muted/30 rounded-xl overflow-hidden border border-border shadow-sm">
          <div className="transform scale-[0.85] origin-top-left w-[118%] h-[118%]">
            <ScreenshotComponent />
          </div>
        </div>

        {/* Right: Content (2 cols) */}
        <div className="col-span-2 flex flex-col">
          {/* Title */}
          <h2 className="text-2xl font-bold mb-4 leading-tight">
            {feature.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {feature.description}
          </p>

          {/* Key Features */}
          <div className="mt-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Key Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {feature.highlights.map((highlight, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS - Hospital Management System</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};
