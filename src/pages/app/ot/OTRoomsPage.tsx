import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OTRoomCard } from "@/components/ot/OTRoomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Building2 } from "lucide-react";
import { useOTRooms, useCreateOTRoom, useUpdateOTRoom, type OTRoom, type OTRoomStatus } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";

export default function OTRoomsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [selectedBranch, setSelectedBranch] = useState<string>(profile?.branch_id || "");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<OTRoom | null>(null);
  
  const [formData, setFormData] = useState({
    roomNumber: "",
    name: "",
    floor: "",
    roomType: "",
    status: "available" as OTRoomStatus,
  });

  const { data: branches } = useBranches();
  const { data: rooms, isLoading } = useOTRooms(selectedBranch || undefined);
  const createRoom = useCreateOTRoom();
  const updateRoom = useUpdateOTRoom();

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      name: "",
      floor: "",
      roomType: "",
      status: "available",
    });
    setEditingRoom(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (room: OTRoom) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.room_number,
      name: room.name,
      floor: room.floor || "",
      roomType: room.room_type || "",
      status: room.status,
    });
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedBranch) return;

    if (editingRoom) {
      await updateRoom.mutateAsync({
        id: editingRoom.id,
        room_number: formData.roomNumber,
        name: formData.name,
        floor: formData.floor || undefined,
        room_type: formData.roomType || undefined,
        status: formData.status,
      });
    } else {
      await createRoom.mutateAsync({
        branch_id: selectedBranch,
        room_number: formData.roomNumber,
        name: formData.name,
        floor: formData.floor || undefined,
        room_type: formData.roomType || undefined,
      });
    }
    
    setShowAddDialog(false);
    resetForm();
  };

  const roomTypes = [
    "General",
    "Cardiac",
    "Neuro",
    "Orthopedic",
    "Laparoscopic",
    "Robotic",
    "Emergency",
    "Obstetric",
    "Ophthalmic",
    "ENT",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="OT Rooms"
          description="Manage operating theatre rooms"
        />
        <Button onClick={handleOpenAdd} disabled={!selectedBranch}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Branch Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Label>Branch:</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches?.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !selectedBranch ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a branch to view OT rooms</p>
          </CardContent>
        </Card>
      ) : rooms?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No OT Rooms</h3>
            <p className="text-muted-foreground mb-4">Add your first OT room to get started</p>
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms?.map(room => (
            <OTRoomCard
              key={room.id}
              room={room}
              onManage={() => handleEdit(room)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit OT Room' : 'Add OT Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update the room details' : 'Add a new operating theatre room'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g., OT-01"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main OR 1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  placeholder="e.g., 2nd Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingRoom && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: OTRoomStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.roomNumber || !formData.name || createRoom.isPending || updateRoom.isPending}
            >
              {editingRoom ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
