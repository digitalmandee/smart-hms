import { OTRoomCard } from "./OTRoomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import type { OTRoom, Surgery } from "@/hooks/useOT";

interface OTRoomBoardProps {
  rooms: OTRoom[];
  surgeries?: Surgery[];
  isLoading?: boolean;
  onManageRoom?: (room: OTRoom) => void;
}

export function OTRoomBoard({ rooms, surgeries = [], isLoading, onManageRoom }: OTRoomBoardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No OT Rooms</h3>
        <p className="text-muted-foreground">Add OT rooms to start scheduling surgeries</p>
      </div>
    );
  }

  // Find current surgery for each occupied room
  const getCurrentSurgery = (roomId: string): Surgery | null => {
    return surgeries.find(s => 
      s.ot_room_id === roomId && s.status === 'in_progress'
    ) || null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map((room) => (
        <OTRoomCard
          key={room.id}
          room={room}
          currentSurgery={getCurrentSurgery(room.id)}
          onManage={onManageRoom ? () => onManageRoom(room) : undefined}
        />
      ))}
    </div>
  );
}
