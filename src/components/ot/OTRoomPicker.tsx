import { useState, useMemo } from "react";
import { useOTRooms, OTRoom, OTRoomStatus } from "@/hooks/useOT";
import { useBranches } from "@/hooks/useBranches";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, Wrench, CalendarClock, Sparkles } from "lucide-react";

interface OTRoomPickerProps {
  value?: string;
  onChange: (roomId: string) => void;
  branchId?: string;
  showOnlyAvailable?: boolean;
  className?: string;
}

const statusConfig: Record<OTRoomStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  available: {
    label: "Available",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-500",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  occupied: {
    label: "In Surgery",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-500",
    icon: <XCircle className="h-4 w-4" />,
  },
  cleaning: {
    label: "Cleaning",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-500",
    icon: <Sparkles className="h-4 w-4" />,
  },
  maintenance: {
    label: "Maintenance",
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/30",
    borderColor: "border-gray-500",
    icon: <Wrench className="h-4 w-4" />,
  },
  reserved: {
    label: "Reserved",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-500",
    icon: <CalendarClock className="h-4 w-4" />,
  },
};

export function OTRoomPicker({
  value,
  onChange,
  branchId: initialBranchId,
  showOnlyAvailable = false,
  className,
}: OTRoomPickerProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || "");
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: rooms, isLoading: roomsLoading } = useOTRooms(selectedBranchId || undefined);

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    if (showOnlyAvailable) {
      return rooms.filter((room) => room.status === "available");
    }
    return rooms;
  }, [rooms, showOnlyAvailable]);

  const selectedRoom = useMemo(() => {
    return rooms?.find((room) => room.id === value);
  }, [rooms, value]);

  const handleRoomSelect = (room: OTRoom) => {
    if (room.status === "available" || !showOnlyAvailable) {
      onChange(room.id);
    }
  };

  const isLoading = branchesLoading || roomsLoading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Branch Selection */}
      {!initialBranchId && (
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className={cn("flex items-center gap-1", config.color)}>
            {config.icon}
            <span>{config.label}</span>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !selectedBranchId && !initialBranchId ? (
        <div className="text-center text-muted-foreground py-8">
          Select a branch to view OT rooms
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {showOnlyAvailable ? "No available OT rooms" : "No OT rooms found"}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            {filteredRooms.map((room) => {
              const config = statusConfig[room.status] || statusConfig.available;
              const isSelected = room.id === value;
              const isClickable = room.status === "available" || !showOnlyAvailable;

              return (
                <Tooltip key={room.id}>
                  <TooltipTrigger asChild>
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200 border-2",
                        config.bgColor,
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 border-primary"
                          : config.borderColor,
                        isClickable ? "hover:shadow-lg" : "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => isClickable && handleRoomSelect(room)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-lg">{room.room_number}</div>
                            <div className="text-sm text-muted-foreground">{room.name}</div>
                          </div>
                          <div className={config.color}>{config.icon}</div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {room.floor && (
                            <div className="text-xs text-muted-foreground">
                              Floor: {room.floor}
                            </div>
                          )}
                          {room.room_type && (
                            <Badge variant="outline" className="text-xs">
                              {room.room_type}
                            </Badge>
                          )}
                        </div>
                        <div className={cn("mt-2 text-xs font-medium", config.color)}>
                          {config.label}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-medium">{room.name} ({room.room_number})</div>
                      {room.room_type && <div>Type: {room.room_type}</div>}
                      {room.equipment && Array.isArray(room.equipment) && room.equipment.length > 0 && (
                        <div>
                          <span className="font-medium">Equipment: </span>
                          {room.equipment.join(", ")}
                        </div>
                      )}
                      {room.notes && <div className="text-muted-foreground">{room.notes}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {/* Selected Room Summary */}
      {selectedRoom && (
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Selected: </span>
            <span>{selectedRoom.name} ({selectedRoom.room_number})</span>
            {selectedRoom.room_type && (
              <Badge variant="secondary">{selectedRoom.room_type}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
