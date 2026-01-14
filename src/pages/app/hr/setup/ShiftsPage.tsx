import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShiftBadge } from "@/components/hr/ShiftBadge";
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const PRESET_COLORS = [
  "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#6366f1",
  "#a855f7", "#ec4899", "#64748b",
];

export default function ShiftsPage() {
  const { profile } = useAuth();
  const { data: shifts, isLoading } = useShifts();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    start_time: "09:00",
    end_time: "17:00",
    break_duration_minutes: 60,
    grace_period_minutes: 15,
    color: "#6366f1",
    is_night_shift: false,
    is_active: true,
  });

  const handleOpenDialog = (shift?: any) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        code: shift.code || "",
        start_time: shift.start_time,
        end_time: shift.end_time,
        break_duration_minutes: shift.break_duration_minutes || 60,
        grace_period_minutes: shift.grace_period_minutes || 15,
        color: shift.color || "#6366f1",
        is_night_shift: shift.is_night_shift ?? false,
        is_active: shift.is_active ?? true,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        code: "",
        start_time: "09:00",
        end_time: "17:00",
        break_duration_minutes: 60,
        grace_period_minutes: 15,
        color: "#6366f1",
        is_night_shift: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      ...formData,
      organization_id: profile?.organization_id!,
    };

    if (editingShift) {
      await updateShift.mutateAsync({ id: editingShift.id, ...data });
    } else {
      await createShift.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteShift.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shifts"
        description="Configure work shifts and timings"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        }
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Grace Period</TableHead>
              <TableHead>Night Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : shifts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No shifts found. Add your first shift.
                </TableCell>
              </TableRow>
            ) : (
              shifts?.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <ShiftBadge shift={shift} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </TableCell>
                  <TableCell>{shift.break_duration_minutes || 0} min</TableCell>
                  <TableCell>{shift.grace_period_minutes || 0} min</TableCell>
                  <TableCell>
                    <Badge variant={shift.is_night_shift ? "default" : "secondary"}>
                      {shift.is_night_shift ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shift.is_active ? "default" : "secondary"}>
                      {shift.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(shift)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(shift.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingShift ? "Edit Shift" : "Add Shift"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning"
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., MOR"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Break Duration (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.break_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, break_duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Grace Period (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.grace_period_minutes}
                  onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Night Shift</Label>
              <Switch
                checked={formData.is_night_shift}
                onCheckedChange={(checked) => setFormData({ ...formData, is_night_shift: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.start_time || !formData.end_time || createShift.isPending || updateShift.isPending}
            >
              {(createShift.isPending || updateShift.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingShift ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Shift"
        description="Are you sure you want to delete this shift?"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
