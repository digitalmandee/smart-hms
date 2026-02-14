import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";

interface RackLocationBadgeProps {
  rackCode?: string;
  rackName?: string | null;
  shelfNumber?: string | null;
  position?: string | null;
  compact?: boolean;
}

export function RackLocationBadge({
  rackCode,
  rackName,
  shelfNumber,
  position,
  compact = false,
}: RackLocationBadgeProps) {
  if (!rackCode) return <span className="text-xs text-muted-foreground">—</span>;

  const parts = [rackCode];
  if (shelfNumber) parts.push(`S${shelfNumber}`);
  if (position) parts.push(position);

  if (compact) {
    return (
      <Badge variant="outline" className="text-xs font-mono gap-1">
        <LayoutGrid className="h-3 w-3" />
        {parts.join(" / ")}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="text-xs font-mono gap-1">
        <LayoutGrid className="h-3 w-3" />
        {parts.join(" / ")}
      </Badge>
      {rackName && <span className="text-xs text-muted-foreground">{rackName}</span>}
    </div>
  );
}
