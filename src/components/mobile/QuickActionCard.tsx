import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

interface QuickActionCardProps {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  disabled?: boolean;
  className?: string;
}

export function QuickActionCard({
  icon,
  label,
  description,
  onClick,
  variant = "default",
  disabled = false,
  className
}: QuickActionCardProps) {
  const haptics = useHaptics();

  const handleClick = () => {
    if (disabled) return;
    haptics.light();
    onClick();
  };

  const variantStyles = {
    default: "bg-card hover:bg-muted/50 border-border",
    primary: "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary",
    success: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400",
    destructive: "bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive"
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
        "active:scale-95 touch-manipulation",
        "min-h-[80px] w-full",
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="mb-1.5">{icon}</div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
      {description && (
        <span className="text-[10px] text-muted-foreground mt-0.5 text-center">{description}</span>
      )}
    </button>
  );
}
