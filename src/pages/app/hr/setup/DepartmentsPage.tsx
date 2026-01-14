import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DepartmentTree } from "@/components/hr/DepartmentTree";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useEmployees,
} from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function DepartmentsPage() {
  const { profile } = useAuth();
  const { data: departments, isLoading } = useDepartments();
  const { data: employees } = useEmployees();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parent_department_id: "",
    head_employee_id: "",
    is_active: true,
  });

  const handleOpenDialog = (department?: any) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || "",
        parent_department_id: department.parent_department_id || "",
        head_employee_id: department.head_employee_id || "",
        is_active: department.is_active ?? true,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        parent_department_id: "",
        head_employee_id: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      ...formData,
      parent_department_id: formData.parent_department_id || null,
      head_employee_id: formData.head_employee_id || null,
      organization_id: profile?.organization_id!,
    };

    if (editingDepartment) {
      await updateDepartment.mutateAsync({ id: editingDepartment.id, ...data });
    } else {
      await createDepartment.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDepartment.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organization departments and hierarchy"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Department Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DepartmentTree
              departments={departments || []}
              onSelect={(dept) => handleOpenDialog(dept)}
              onEdit={(dept) => handleOpenDialog(dept)}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Edit Department" : "Add Department"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Human Resources"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., HR"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Department description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Parent Department</Label>
              <Select
                value={formData.parent_department_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_department_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Root department)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root department)</SelectItem>
                  {departments
                    ?.filter((d) => d.id !== editingDepartment?.id)
                    .map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department Head</Label>
              <Select
                value={formData.head_employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, head_employee_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select head..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No head assigned</SelectItem>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingDepartment && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsDialogOpen(false);
                  setDeleteId(editingDepartment.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                !formData.code ||
                createDepartment.isPending ||
                updateDepartment.isPending
              }
            >
              {(createDepartment.isPending || updateDepartment.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingDepartment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
