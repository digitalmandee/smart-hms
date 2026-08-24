import { cn } from "@/lib/utils";

interface ExecDeckMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { tile: "w-8 h-8", icon: "h-4 w-4", text: "text-lg", tagline: "text-[10px]" },
  md: { tile: "w-10 h-10", icon: "h-5 w-5", text: "text-xl", tagline: "text-xs" },
  lg: { tile: "w-12 h-12", icon: "h-6 w-6", text: "text-2xl", tagline: "text-sm" },
  xl: { tile: "w-16 h-16", icon: "h-8 w-8", text: "text-4xl", tagline: "text-base" },
};

/**
 * Generic, unbranded deck mark: neutral tile with a heartbeat/cross glyph
 * plus the HMIS wordmark. Used across the executive deck instead of any
 * product-specific logo.
 */
export function ExecDeckMark({ size = "md", showTagline = false, className }: ExecDeckMarkProps) {
  const s = sizes[size];
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className={cn(s.tile, "rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0")}>
        <svg viewBox="0 0 24 24" className={cn(s.icon, "text-primary")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-4 3 8 2.5-5 1.5 3h3" />
          <path d="M12 3v2M11 4h2" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={cn(s.text, "font-bold text-foreground leading-tight tracking-tight")}>HMIS</span>
        {showTagline && (
          <span className={cn(s.tagline, "text-muted-foreground")}>Hospital Management Information System</span>
        )}
      </div>
    </div>
  );
}

export default ExecDeckMark;
