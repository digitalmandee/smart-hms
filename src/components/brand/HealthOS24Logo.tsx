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
  
  // Icon SVG - Premium "24" with heartbeat line
  const IconSVG = ({ iconClass }: { iconClass?: string }) => (
    <svg 
      viewBox="0 0 40 40" 
      className={cn(iconClass, "flex-shrink-0")}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Premium gradient */}
        <linearGradient id="healthos24-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.85)" />
        </linearGradient>
        {/* Subtle shadow filter for depth */}
        <filter id="premium-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15"/>
        </filter>
      </defs>
      
      {/* Background with premium shadow */}
      <rect 
        x="0" 
        y="0" 
        width="40" 
        height="40" 
        rx="10" 
        fill="url(#healthos24-gradient)"
        filter="url(#premium-shadow)"
      />
      
      {/* Subtle inner highlight for glass effect */}
      <rect 
        x="1" 
        y="1" 
        width="38" 
        height="38" 
        rx="9" 
        stroke="white"
        strokeOpacity="0.15"
        strokeWidth="1"
        fill="none"
      />
      
      {/* "24" - premium typography */}
      <text 
        x="20" 
        y="21" 
        textAnchor="middle" 
        dominantBaseline="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="-1"
      >
        24
      </text>
      
      {/* Refined heartbeat line - thinner, more elegant */}
      <path 
        d="M8 29 L13 29 L16 26 L19 32 L22 27 L25 29 L32 29" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
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
        <span className="text-sm font-bold text-foreground">HealthOS</span>
      </div>
    );
  }
  
  // Full variant with text
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <IconSVG iconClass={config.icon} />
      <div className="flex flex-col">
        <span className={cn(config.text, "font-bold text-foreground leading-tight")}>
          HealthOS
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
