import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWards, useBeds } from "@/hooks/useIPD";
import { Bed, User, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BedPickerProps {
  value?: { wardId?: string; bedId?: string };
  onChange: (value: { wardId: string; bedId: string }) => void;
  showOnlyAvailable?: boolean;
  className?: string;
}

const statusColors: Record<string, string> = {
  available: "bg-success/20 border-success text-success hover:bg-success/30",
  occupied: "bg-destructive/20 border-destructive text-destructive cursor-not-allowed opacity-50",
  reserved: "bg-warning/20 border-warning text-warning hover:bg-warning/30",
  maintenance: "bg-muted border-muted-foreground/50 cursor-not-allowed opacity-50",
  housekeeping: "bg-blue-500/20 border-blue-500 text-blue-500 cursor-not-allowed opacity-50",
};

export const BedPicker = ({
  value,
  onChange,
  showOnlyAvailable = true,
  className,
}: BedPickerProps) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(value?.wardId || "");

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: beds, isLoading: loadingBeds } = useBeds(selectedWardId || undefined);

  const filteredBeds = showOnlyAvailable
    ? beds?.filter((bed: { status: string }) => 
        bed.status === "available" || bed.status === "reserved"
      )
    : beds;

  const selectedWard = wards?.find((w: { id: string }) => w.id === selectedWardId);
  const selectedBed = beds?.find((b: { id: string }) => b.id === value?.bedId);

  const handleWardChange = (wardId: string) => {
    setSelectedWardId(wardId);
    // Clear bed selection when ward changes
    if (value?.bedId) {
      onChange({ wardId, bedId: "" });
    }
  };

  const handleBedClick = (bed: { id: string; status: string }) => {
    if (bed.status === "available" || bed.status === "reserved") {
      onChange({ wardId: selectedWardId, bedId: bed.id });
    }
  };

  const availableCount = beds?.filter(
    (b: { status: string }) => b.status === "available"
  ).length || 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bed className="h-4 w-4" />
          Select Bed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ward Selector */}
        <div>
          <Select value={selectedWardId} onValueChange={handleWardChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a ward" />
            </SelectTrigger>
            <SelectContent>
              {loadingWards ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                (wards || []).map((ward: { 
                  id: string; 
                  name: string; 
                  code: string;
                  ward_type: string;
                  beds?: Array<{ status: string }>;
                }) => {
                  const available = ward.beds?.filter(b => b.status === "available").length || 0;
                  return (
                    <SelectItem key={ward.id} value={ward.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{ward.name} ({ward.code})</span>
                        <Badge variant={available > 0 ? "default" : "secondary"} className="ml-2">
                          {available} free
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Bed Grid */}
        {selectedWardId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedWard?.name} - {availableCount} beds available
              </span>
              {selectedBed && (
                <Badge variant="default">
                  Selected: {selectedBed.bed_number}
                </Badge>
              )}
            </div>

            <ScrollArea className="h-48 rounded-md border p-2">
              {loadingBeds ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading beds...
                </div>
              ) : filteredBeds && filteredBeds.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {(showOnlyAvailable ? filteredBeds : beds)?.map((bed: {
                    id: string;
                    bed_number: string;
                    status: string;
                    bed_type?: string;
                    current_admission?: {
                      patient?: { first_name: string; last_name: string };
                    } | null;
                  }) => {
                    const isSelected = bed.id === value?.bedId;
                    const isAvailable = bed.status === "available";
                    const isReserved = bed.status === "reserved";
                    const canSelect = isAvailable || isReserved;

                    return (
                      <TooltipProvider key={bed.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "h-12 w-full flex flex-col items-center justify-center border-2 p-1 transition-all relative",
                                  statusColors[bed.status],
                                  isSelected && "ring-2 ring-primary ring-offset-2",
                                  !canSelect && "pointer-events-none opacity-50 grayscale"
                                )}
                                onClick={() => handleBedClick(bed)}
                                disabled={!canSelect}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 absolute top-0.5 right-0.5" />
                                )}
                                {bed.status === "occupied" ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Bed className="h-3 w-3" />
                                )}
                                <span className="text-[10px] font-medium truncate w-full text-center">
                                  {bed.bed_number}
                                </span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <p className="font-medium">{bed.bed_number}</p>
                              {bed.bed_type && <p>{bed.bed_type}</p>}
                              <Badge variant="outline" className="capitalize">
                                {bed.status}
                              </Badge>
                              {bed.current_admission?.patient && (
                                <p className="text-muted-foreground">
                                  {bed.current_admission.patient.first_name}{" "}
                                  {bed.current_admission.patient.last_name}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {showOnlyAvailable 
                    ? "No available beds in this ward" 
                    : "No beds configured"}
                </div>
              )}
            </ScrollArea>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 pt-2 border-t text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-success/20 border border-success" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-warning/20 border border-warning" />
                <span className="text-muted-foreground">Reserved</span>
              </div>
              {!showOnlyAvailable && (
                <>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-destructive/20 border border-destructive" />
                    <span className="text-muted-foreground">Occupied</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-muted border border-muted-foreground/50" />
                    <span className="text-muted-foreground">Maintenance</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!selectedWardId && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Select a ward to view available beds
          </div>
        )}
      </CardContent>
    </Card>
  );
};
