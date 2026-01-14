import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OTRoomStatus } from "@/hooks/useOT";

interface OTRoomStatusBadgeProps {
  status: OTRoomStatus;
  className?: string;
}

const statusConfig: Record<OTRoomStatus, { label: string; variant: string }> = {
  available: { label: "Available", variant: "bg-green-100 text-green-700 border-green-200" },
  occupied: { label: "In Use", variant: "bg-red-100 text-red-700 border-red-200" },
  cleaning: { label: "Cleaning", variant: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  maintenance: { label: "Maintenance", variant: "bg-gray-100 text-gray-700 border-gray-200" },
  reserved: { label: "Reserved", variant: "bg-blue-100 text-blue-700 border-blue-200" },
};

export function OTRoomStatusBadge({ status, className }: OTRoomStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.available;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.variant, "font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}
