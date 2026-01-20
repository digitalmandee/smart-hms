import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Wrench,
  Sparkles,
  CalendarClock,
  XCircle,
  CheckCircle,
  User,
  ArrowRightLeft,
  FileText,
} from "lucide-react";
import { useUpdateBedStatus, useDeleteBed, useReserveBed, useReleaseBed } from "@/hooks/useBedManagement";
import { useNavigate } from "react-router-dom";

interface BedActionsMenuProps {
  bed: {
    id: string;
    bed_number: string;
    status: string;
    ward_id: string;
    current_admission?: {
      id: string;
    } | null;
  };
  onTransfer?: () => void;
  onViewPatient?: () => void;
  onViewAdmission?: () => void;
  onViewProfile?: () => void;
}

export const BedActionsMenu = ({
  bed,
  onTransfer,
  onViewPatient,
  onViewAdmission,
  onViewProfile,
}: BedActionsMenuProps) => {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [reserveNote, setReserveNote] = useState("");

  const { mutate: updateBedStatus, isPending: isUpdating } = useUpdateBedStatus();
  const { mutate: deleteBed, isPending: isDeleting } = useDeleteBed();
  const { mutate: reserveBed, isPending: isReserving } = useReserveBed();
  const { mutate: releaseBed, isPending: isReleasing } = useReleaseBed();

  const handleSetMaintenance = () => {
    updateBedStatus(
      { bedId: bed.id, status: "maintenance", notes: maintenanceNote || "Under maintenance" },
      { onSuccess: () => setMaintenanceOpen(false) }
    );
  };

  const handleSetHousekeeping = () => {
    updateBedStatus({ bedId: bed.id, status: "housekeeping", notes: "Pending cleaning" });
  };

  const handleMarkClean = () => {
    updateBedStatus({ bedId: bed.id, status: "available", notes: undefined });
  };

  const handleCompleteMaintenance = () => {
    updateBedStatus({ bedId: bed.id, status: "available", notes: undefined });
  };

  const handleReserve = () => {
    reserveBed(
      { bedId: bed.id, notes: reserveNote || undefined },
      { onSuccess: () => setReserveOpen(false) }
    );
  };

  const handleCancelReservation = () => {
    releaseBed(bed.id);
  };

  const handleDelete = () => {
    deleteBed(bed.id, { onSuccess: () => setDeleteOpen(false) });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* View Profile - Always available */}
          {onViewProfile && (
            <DropdownMenuItem onClick={onViewProfile}>
              <FileText className="h-4 w-4 mr-2" />
              View Bed Profile
            </DropdownMenuItem>
          )}

          {/* Edit - Always available */}
          <DropdownMenuItem onClick={() => navigate(`/app/ipd/beds/${bed.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Bed
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status-specific actions */}
{bed.status === "available" && (
            <>
              <DropdownMenuItem onClick={() => setReserveOpen(true)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Reserve Bed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSetHousekeeping}>
                <Sparkles className="h-4 w-4 mr-2" />
                Send to Housekeeping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMaintenanceOpen(true)}>
                <Wrench className="h-4 w-4 mr-2" />
                Block for Maintenance
              </DropdownMenuItem>
            </>
          )}

          {bed.status === "occupied" && (
            <>
              {onViewPatient && (
                <DropdownMenuItem onClick={onViewPatient}>
                  <User className="h-4 w-4 mr-2" />
                  View Patient
                </DropdownMenuItem>
              )}
              {onViewAdmission && (
                <DropdownMenuItem onClick={onViewAdmission}>
                  <User className="h-4 w-4 mr-2" />
                  View Admission
                </DropdownMenuItem>
              )}
              {onTransfer && (
                <DropdownMenuItem onClick={onTransfer}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer Patient
                </DropdownMenuItem>
              )}
            </>
          )}

          {bed.status === "reserved" && (
            <DropdownMenuItem onClick={handleCancelReservation} disabled={isReleasing}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Reservation
            </DropdownMenuItem>
          )}

          {bed.status === "housekeeping" && (
            <DropdownMenuItem onClick={handleMarkClean} disabled={isUpdating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Mark as Clean
            </DropdownMenuItem>
          )}

          {bed.status === "maintenance" && (
            <DropdownMenuItem onClick={handleCompleteMaintenance} disabled={isUpdating}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Maintenance
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete - Only if not occupied */}
          {bed.status !== "occupied" && (
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Bed
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bed {bed.bed_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bed
              and all associated history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Bed for Maintenance</DialogTitle>
            <DialogDescription>
              This will mark bed {bed.bed_number} as unavailable for admissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maintenance-note">Maintenance Reason</Label>
              <Textarea
                id="maintenance-note"
                value={maintenanceNote}
                onChange={(e) => setMaintenanceNote(e.target.value)}
                placeholder="Describe the maintenance needed..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetMaintenance} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Block for Maintenance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reserve Dialog */}
      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve Bed</DialogTitle>
            <DialogDescription>
              Reserve bed {bed.bed_number} for an upcoming admission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reserve-note">Reservation Note</Label>
              <Textarea
                id="reserve-note"
                value={reserveNote}
                onChange={(e) => setReserveNote(e.target.value)}
                placeholder="Patient name or reservation details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReserveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReserve} disabled={isReserving}>
              {isReserving ? "Reserving..." : "Reserve Bed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
