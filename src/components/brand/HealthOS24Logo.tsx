import { cn } from "@/lib/utils";

interface HealthOS24LogoProps {
  variant?: 'full' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * HealthOS 24 Logo Component
 * Unified branding component for use across the entire application.
 * The "24" represents 24/7 availability for this SaaS hospital management platform.
 */
export const HealthOS24Logo = ({ 
  variant = 'full', 
  size = 'md', 
  showTagline = false,
  className 
}: HealthOS24LogoProps) => {
  
  // Size configurations
  const sizeConfig = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 'w-10 h-10', text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', tagline: 'text-sm' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', tagline: 'text-base' },
  };
  
  const config = sizeConfig[size];
  
  // Icon SVG - "24" with heartbeat line
  const IconSVG = ({ iconClass }: { iconClass?: string }) => (
    <svg 
      viewBox="0 0 40 40" 
      className={cn(iconClass, "flex-shrink-0")}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="healthos24-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Background rounded square */}
      <rect 
        x="0" 
        y="0" 
        width="40" 
        height="40" 
        rx="8" 
        fill="url(#healthos24-gradient)"
        className="drop-shadow-lg"
      />
      
      {/* "24" text - bold and prominent */}
      <text 
        x="20" 
        y="22" 
        textAnchor="middle" 
        dominantBaseline="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="16"
        letterSpacing="-0.5"
      >
        24
      </text>
      
      {/* Heartbeat/pulse line below the text */}
      <path 
        d="M6 30 L12 30 L15 27 L18 33 L21 28 L24 30 L34 30" 
        stroke="white" 
        strokeWidth="1.8" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
  
  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex", className)}>
        <IconSVG iconClass={config.icon} />
      </div>
    );
  }
  
  // Minimal variant (smaller icon without shadow)
  if (variant === 'minimal') {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <IconSVG iconClass="w-6 h-6" />
        <span className="text-sm font-bold text-foreground">HealthOS 24</span>
      </div>
    );
  }
  
  // Full variant with text
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <IconSVG iconClass={config.icon} />
      <div className="flex flex-col">
        <span className={cn(config.text, "font-bold text-foreground leading-tight")}>
          HealthOS 24
        </span>
        {showTagline && (
          <span className={cn(config.tagline, "text-muted-foreground")}>
            Smart Hospital Management
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Simple 24 badge for use in collapsed sidebars or tight spaces
 */
export const HealthOS24Badge = ({ className }: { className?: string }) => (
  <div className={cn(
    "flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-lg",
    "w-9 h-9",
    className
  )}>
    24
  </div>
);

export default HealthOS24Logo;
