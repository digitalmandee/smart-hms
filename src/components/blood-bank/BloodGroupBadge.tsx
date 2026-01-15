import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BloodGroupType } from "@/hooks/useBloodBank";

interface BloodGroupBadgeProps {
  group: BloodGroupType | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const bloodGroupColors: Record<string, string> = {
  'O+': 'bg-red-100 text-red-700 border-red-200',
  'O-': 'bg-red-200 text-red-800 border-red-300',
  'A+': 'bg-blue-100 text-blue-700 border-blue-200',
  'A-': 'bg-blue-200 text-blue-800 border-blue-300',
  'B+': 'bg-green-100 text-green-700 border-green-200',
  'B-': 'bg-green-200 text-green-800 border-green-300',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-purple-200 text-purple-800 border-purple-300',
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-3 py-1 font-semibold',
};

export function BloodGroupBadge({ group, size = "md", showIcon = false }: BloodGroupBadgeProps) {
  const colorClass = bloodGroupColors[group] || 'bg-muted text-muted-foreground';
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono border",
        colorClass,
        sizeClasses[size]
      )}
    >
      {showIcon && <span className="mr-1">🩸</span>}
      {group}
    </Badge>
  );
}
