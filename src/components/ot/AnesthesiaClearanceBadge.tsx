import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnesthesiaClearanceBadgeProps {
  status: 'pending' | 'cleared' | 'not_cleared' | 'conditional' | null;
  className?: string;
  showLabel?: boolean;
}

export function AnesthesiaClearanceBadge({ 
  status, 
  className,
  showLabel = true 
}: AnesthesiaClearanceBadgeProps) {
  if (!status || status === 'pending') {
    return (
      <Badge 
        variant="outline" 
        className={cn("text-amber-600 border-amber-300 bg-amber-50", className)}
      >
        <Clock className="h-3 w-3 mr-1" />
        {showLabel && 'Anesthesia Pending'}
      </Badge>
    );
  }

  if (status === 'cleared') {
    return (
      <Badge 
        variant="outline" 
        className={cn("text-green-600 border-green-300 bg-green-50", className)}
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {showLabel && 'Anesthesia Cleared'}
      </Badge>
    );
  }

  if (status === 'not_cleared') {
    return (
      <Badge 
        variant="outline" 
        className={cn("text-red-600 border-red-300 bg-red-50", className)}
      >
        <XCircle className="h-3 w-3 mr-1" />
        {showLabel && 'Not Fit'}
      </Badge>
    );
  }

  if (status === 'conditional') {
    return (
      <Badge 
        variant="outline" 
        className={cn("text-orange-600 border-orange-300 bg-orange-50", className)}
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        {showLabel && 'Conditionally Fit'}
      </Badge>
    );
  }

  return null;
}
