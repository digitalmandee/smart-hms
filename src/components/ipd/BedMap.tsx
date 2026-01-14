import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bed, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BedData {
  id: string;
  bed_number: string;
  status: string;
  bed_type?: string;
  position_row?: number;
  position_col?: number;
  ward?: { id: string; name: string; code: string };
  current_admission?: {
    id: string;
    admission_number: string;
    patient?: { id: string; first_name: string; last_name: string; patient_number: string };
  } | null;
}

interface BedMapProps {
  beds: BedData[];
  wardName?: string;
  onBedClick?: (bed: BedData) => void;
  selectedBedId?: string;
  showLegend?: boolean;
}

const statusColors: Record<string, string> = {
  available: "bg-success/20 border-success hover:bg-success/30",
  occupied: "bg-destructive/20 border-destructive hover:bg-destructive/30",
  reserved: "bg-warning/20 border-warning hover:bg-warning/30",
  maintenance: "bg-muted border-muted-foreground/50",
  cleaning: "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  available: <Bed className="h-5 w-5 text-success" />,
  occupied: <User className="h-5 w-5 text-destructive" />,
  reserved: <Bed className="h-5 w-5 text-warning" />,
  maintenance: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
  cleaning: <Bed className="h-5 w-5 text-blue-500" />,
};

export const BedMap = ({
  beds,
  wardName,
  onBedClick,
  selectedBedId,
  showLegend = true,
}: BedMapProps) => {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  // Group beds by row for grid layout
  const maxRow = Math.max(...beds.map((b) => b.position_row || 1), 1);
  const maxCol = Math.max(...beds.map((b) => b.position_col || 1), 1);

  const getBedByPosition = (row: number, col: number) => {
    return beds.find((b) => b.position_row === row && b.position_col === col);
  };

  // If no position data, render as simple grid
  const hasPositionData = beds.some((b) => b.position_row !== null && b.position_col !== null);

  const renderBed = (bed: BedData) => {
    const isSelected = selectedBedId === bed.id;
    const patient = bed.current_admission?.patient;

    return (
      <TooltipProvider key={bed.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-16 w-20 flex flex-col items-center justify-center gap-1 border-2 transition-all",
                statusColors[bed.status] || statusColors.available,
                isSelected && "ring-2 ring-primary ring-offset-2",
                bed.status === "maintenance" && "cursor-not-allowed opacity-60"
              )}
              onClick={() => onBedClick?.(bed)}
              onMouseEnter={() => setHoveredBed(bed.id)}
              onMouseLeave={() => setHoveredBed(null)}
              disabled={bed.status === "maintenance"}
            >
              {statusIcons[bed.status] || statusIcons.available}
              <span className="text-xs font-medium">{bed.bed_number}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Bed {bed.bed_number}</p>
              {bed.bed_type && (
                <p className="text-xs text-muted-foreground">{bed.bed_type}</p>
              )}
              <Badge variant="outline" className="text-xs">
                {bed.status}
              </Badge>
              {patient && (
                <div className="pt-1 border-t mt-1">
                  <p className="text-sm font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {patient.patient_number}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bed className="h-5 w-5" />
            {wardName ? `${wardName} - Bed Map` : "Bed Map"}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {beds.filter((b) => b.status === "available").length} of {beds.length} available
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bed Grid */}
        <div className="mb-4">
          {hasPositionData ? (
            <div className="space-y-2">
              {Array.from({ length: maxRow }, (_, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 flex-wrap">
                  {Array.from({ length: maxCol }, (_, colIdx) => {
                    const bed = getBedByPosition(rowIdx + 1, colIdx + 1);
                    if (!bed) {
                      return (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className="h-16 w-20 border border-dashed border-muted rounded-md"
                        />
                      );
                    }
                    return renderBed(bed);
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {beds.map(renderBed)}
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success/20 border border-success" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive/20 border border-destructive" />
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning/20 border border-warning" />
              <span className="text-sm text-muted-foreground">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted border border-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">Maintenance</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
