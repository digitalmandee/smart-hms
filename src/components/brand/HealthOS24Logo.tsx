import { cn } from "@/lib/utils";
import logoFull from "@/assets/healthos-logo-full.png.asset.json";
import logoIcon from "@/assets/healthos-logo-icon.png.asset.json";

interface HealthOS24LogoProps {
  variant?: 'full' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const LOGO_FULL_URL = logoFull.url;
export const LOGO_ICON_URL = logoIcon.url;

/**
 * HealthOS Logo Component
 * Uses the finalized HealthOS brand mark (teal "H" heartbeat icon) and
 * the horizontal healthOS. lockup.
 */
export const HealthOS24Logo = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className
}: HealthOS24LogoProps) => {

  const sizeConfig = {
    sm: { icon: 'w-8 h-8', full: 'h-6', tagline: 'text-xs' },
    md: { icon: 'w-10 h-10', full: 'h-8', tagline: 'text-xs' },
    lg: { icon: 'w-12 h-12', full: 'h-10', tagline: 'text-sm' },
    xl: { icon: 'w-16 h-16', full: 'h-14', tagline: 'text-base' },
  };

  const config = sizeConfig[size];

  if (variant === 'icon') {
    return (
      <div className={cn("inline-flex", className)}>
        <img
          src={logoIcon.url}
          alt="HealthOS logo"
          className={cn(config.icon, "flex-shrink-0 object-contain rounded-xl")}
        />
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <img src={logoFull.url} alt="HealthOS" className="h-5 object-contain" />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <img
        src={logoFull.url}
        alt="HealthOS"
        className={cn(config.full, "object-contain self-start")}
      />
      {showTagline && (
        <span className={cn(config.tagline, "text-muted-foreground mt-1")}>
          Smart Hospital Management
        </span>
      )}
    </div>
  );
};

/**
 * Compact brand mark for collapsed sidebars or tight spaces
 */
export const HealthOS24Badge = ({ className }: { className?: string }) => (
  <img
    src={logoIcon.url}
    alt="HealthOS"
    className={cn("w-9 h-9 rounded-lg object-contain", className)}
  />
);

export default HealthOS24Logo;
