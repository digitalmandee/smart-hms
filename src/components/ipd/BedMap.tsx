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
import { BedSingle, BedDouble, UserRound, Wrench, Sparkles, Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineBedCreator } from "./InlineBedCreator";

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
  wardId?: string;
  wardName?: string;
  onBedClick?: (bed: BedData) => void;
  selectedBedId?: string;
  showLegend?: boolean;
  isEditMode?: boolean;
  gridSize?: { rows: number; cols: number };
  onBedCreated?: () => void;
}

const statusColors: Record<string, string> = {
  available: "bg-success/20 border-success hover:bg-success/30",
  occupied: "bg-destructive/20 border-destructive hover:bg-destructive/30",
  reserved: "bg-warning/20 border-warning hover:bg-warning/30",
  maintenance: "bg-muted border-muted-foreground/50",
  cleaning: "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30",
  housekeeping: "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30",
};

const getBedIcon = (status: string, bedType?: string) => {
  const isDouble = bedType === "double" || bedType === "icu" || bedType === "electric";
  const BedIcon = isDouble ? BedDouble : BedSingle;

  switch (status) {
    case "occupied":
      return (
        <div className="relative">
          <BedIcon className="h-7 w-7 text-destructive" />
          <UserRound className="h-3.5 w-3.5 text-destructive absolute -top-1 -right-1 bg-background rounded-full" />
        </div>
      );
    case "available":
      return <BedIcon className="h-7 w-7 text-success" />;
    case "reserved":
      return <BedIcon className="h-7 w-7 text-warning" />;
    case "maintenance":
      return <Wrench className="h-6 w-6 text-muted-foreground" />;
    case "cleaning":
    case "housekeeping":
      return <Sparkles className="h-6 w-6 text-blue-500" />;
    default:
      return <BedIcon className="h-7 w-7 text-muted-foreground" />;
  }
};

export const BedMap = ({
  beds,
  wardId,
  wardName,
  onBedClick,
  selectedBedId,
  showLegend = true,
  isEditMode = false,
  gridSize,
  onBedCreated,
}: BedMapProps) => {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);
  const [activeCreator, setActiveCreator] = useState<{ row: number; col: number } | null>(null);

  // Calculate grid dimensions
  const maxRow = gridSize?.rows || Math.max(...beds.map((b) => b.position_row || 1), 3);
  const maxCol = gridSize?.cols || Math.max(...beds.map((b) => b.position_col || 1), 4);

  const getBedByPosition = (row: number, col: number) => {
    return beds.find((b) => b.position_row === row && b.position_col === col);
  };

  // Generate suggested bed number
  const suggestBedNumber = (row: number, col: number) => {
    const wardCode = wardName?.substring(0, 3).toUpperCase() || "B";
    const existingNumbers = beds
      .map((b) => {
        const match = b.bed_number.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = Math.max(0, ...existingNumbers) + 1;
    return `${wardCode}-${String(nextNum).padStart(2, "0")}`;
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
                "h-24 w-28 flex flex-col items-center justify-between p-2 border-2 transition-all gap-0",
                statusColors[bed.status] || statusColors.available,
                isSelected && "ring-2 ring-primary ring-offset-2",
                bed.status === "maintenance" && "cursor-not-allowed opacity-60"
              )}
              onClick={() => onBedClick?.(bed)}
              onMouseEnter={() => setHoveredBed(bed.id)}
              onMouseLeave={() => setHoveredBed(null)}
              disabled={bed.status === "maintenance"}
            >
              {/* Bed Icon */}
              <div className="flex-1 flex items-center justify-center">
                {getBedIcon(bed.status, bed.bed_type)}
              </div>

              {/* Bed Number - Prominent */}
              <div className="text-sm font-bold text-foreground">{bed.bed_number}</div>

              {/* Patient Name or Status */}
              <div className="text-[10px] text-muted-foreground truncate w-full text-center h-3">
                {patient ? `${patient.first_name} ${patient.last_name.charAt(0)}.` : bed.status}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Bed {bed.bed_number}</p>
              {bed.bed_type && (
                <p className="text-xs text-muted-foreground capitalize">{bed.bed_type} bed</p>
              )}
              <Badge variant="outline" className="text-xs capitalize">
                {bed.status}
              </Badge>
              {patient && (
                <div className="pt-1 border-t mt-1">
                  <p className="text-sm font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{patient.patient_number}</p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderEmptyCell = (row: number, col: number) => {
    if (!isEditMode || !wardId) {
      return (
        <div
          key={`empty-${row}-${col}`}
          className="h-24 w-28 border-2 border-dashed border-muted rounded-lg"
        />
      );
    }

    const isActive = activeCreator?.row === row && activeCreator?.col === col;

    return (
      <InlineBedCreator
        key={`empty-${row}-${col}`}
        wardId={wardId}
        row={row}
        col={col}
        suggestedBedNumber={suggestBedNumber(row, col)}
        open={isActive}
        onOpenChange={(open) => {
          if (open) {
            setActiveCreator({ row, col });
          } else {
            setActiveCreator(null);
          }
        }}
        onSuccess={() => {
          setActiveCreator(null);
          onBedCreated?.();
        }}
      >
        <Button
          variant="ghost"
          className={cn(
            "h-24 w-28 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center gap-1 transition-all",
            "hover:border-primary hover:bg-primary/5",
            isActive && "border-primary bg-primary/10"
          )}
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Add Bed</span>
        </Button>
      </InlineBedCreator>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            {wardName ? `${wardName} - Bed Map` : "Bed Map"}
            {isEditMode && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Edit Mode
              </Badge>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {beds.filter((b) => b.status === "available").length} of {beds.length} available
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bed Grid */}
        <div className="mb-4 overflow-x-auto">
          {hasPositionData || isEditMode ? (
            <div className="space-y-2 inline-block min-w-fit">
              {Array.from({ length: maxRow }, (_, rowIdx) => (
                <div key={rowIdx} className="flex gap-2">
                  {/* Row label */}
                  <div className="w-6 h-24 flex items-center justify-center text-xs text-muted-foreground font-medium">
                    {rowIdx + 1}
                  </div>
                  {Array.from({ length: maxCol }, (_, colIdx) => {
                    const bed = getBedByPosition(rowIdx + 1, colIdx + 1);
                    if (!bed) {
                      return renderEmptyCell(rowIdx + 1, colIdx + 1);
                    }
                    return renderBed(bed);
                  })}
                </div>
              ))}
              {/* Column labels */}
              <div className="flex gap-2 mt-1">
                <div className="w-6" />
                {Array.from({ length: maxCol }, (_, colIdx) => (
                  <div
                    key={colIdx}
                    className="w-28 text-center text-xs text-muted-foreground font-medium"
                  >
                    {String.fromCharCode(65 + colIdx)}
                  </div>
                ))}
              </div>
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
              <div className="h-4 w-4 rounded bg-success/20 border-2 border-success" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive/20 border-2 border-destructive" />
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning/20 border-2 border-warning" />
              <span className="text-sm text-muted-foreground">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted border-2 border-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500/20 border-2 border-blue-500" />
              <span className="text-sm text-muted-foreground">Housekeeping</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
