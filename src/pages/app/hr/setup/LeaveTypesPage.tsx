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
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from "@/hooks/useLeaves";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#6366f1", "#a855f7", "#ec4899", "#64748b",
];

export default function LeaveTypesPage() {
  const { profile } = useAuth();
  const { data: leaveTypes, isLoading } = useLeaveTypes();
  const createLeaveType = useCreateLeaveType();
  const updateLeaveType = useUpdateLeaveType();
  const deleteLeaveType = useDeleteLeaveType();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "#6366f1",
    annual_quota: 12,
    is_paid: true,
    is_carry_forward: false,
    max_carry_forward_days: 0,
    is_encashable: false,
    requires_approval: true,
    min_days_notice: 1,
    max_consecutive_days: 0,
    is_active: true,
  });

  const handleOpenDialog = (leaveType?: any) => {
    if (leaveType) {
      setEditingLeaveType(leaveType);
      setFormData({
        name: leaveType.name,
        code: leaveType.code,
        color: leaveType.color || "#6366f1",
        annual_quota: leaveType.annual_quota || 12,
        is_paid: leaveType.is_paid ?? true,
        is_carry_forward: leaveType.is_carry_forward ?? false,
        max_carry_forward_days: leaveType.max_carry_forward_days || 0,
        is_encashable: leaveType.is_encashable ?? false,
        requires_approval: leaveType.requires_approval ?? true,
        min_days_notice: leaveType.min_days_notice || 1,
        max_consecutive_days: leaveType.max_consecutive_days || 0,
        is_active: leaveType.is_active ?? true,
      });
    } else {
      setEditingLeaveType(null);
      setFormData({
        name: "",
        code: "",
        color: "#6366f1",
        annual_quota: 12,
        is_paid: true,
        is_carry_forward: false,
        max_carry_forward_days: 0,
        is_encashable: false,
        requires_approval: true,
        min_days_notice: 1,
        max_consecutive_days: 0,
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

    if (editingLeaveType) {
      await updateLeaveType.mutateAsync({ id: editingLeaveType.id, ...data });
    } else {
      await createLeaveType.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteLeaveType.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Types"
        description="Configure leave categories and policies"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </Button>
      </PageHeader>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Type</TableHead>
              <TableHead>Annual Quota</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Carry Forward</TableHead>
              <TableHead>Encashable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : leaveTypes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No leave types found. Add your first leave type.
                </TableCell>
              </TableRow>
            ) : (
              leaveTypes?.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: leaveType.color || "#6366f1" }}
                      />
                      <div>
                        <span className="font-medium">{leaveType.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({leaveType.code})
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{leaveType.annual_quota || 0} days</TableCell>
                  <TableCell>
                    <Badge variant={leaveType.is_paid ? "default" : "secondary"}>
                      {leaveType.is_paid ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {leaveType.is_carry_forward ? (
                      <span className="text-sm">
                        Up to {leaveType.max_carry_forward_days} days
                      </span>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={leaveType.is_encashable ? "default" : "secondary"}>
                      {leaveType.is_encashable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={leaveType.is_active ? "default" : "secondary"}>
                      {leaveType.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(leaveType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(leaveType.id)}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual Leave"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., AL"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Quota (days)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.annual_quota}
                  onChange={(e) => setFormData({ ...formData, annual_quota: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Days Notice</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.min_days_notice}
                  onChange={(e) => setFormData({ ...formData, min_days_notice: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label>Paid Leave</Label>
                <Switch
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Requires Approval</Label>
                <Switch
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Allow Carry Forward</Label>
                <Switch
                  checked={formData.is_carry_forward}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_carry_forward: checked })}
                />
              </div>

              {formData.is_carry_forward && (
                <div className="space-y-2 pl-4">
                  <Label>Max Carry Forward Days</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.max_carry_forward_days}
                    onChange={(e) => setFormData({ ...formData, max_carry_forward_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label>Encashable</Label>
                <Switch
                  checked={formData.is_encashable}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_encashable: checked })}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.code || createLeaveType.isPending || updateLeaveType.isPending}
            >
              {(createLeaveType.isPending || updateLeaveType.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingLeaveType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Leave Type"
        description="Are you sure you want to delete this leave type?"
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
