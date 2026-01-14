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
  useEmployeeCategories,
  useCreateEmployeeCategory,
  useUpdateEmployeeCategory,
  useDeleteEmployeeCategory,
} from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#6366f1", "#a855f7", "#ec4899", "#64748b",
];

export default function EmployeeCategoriesPage() {
  const { profile } = useAuth();
  const { data: categories, isLoading } = useEmployeeCategories();
  const createCategory = useCreateEmployeeCategory();
  const updateCategory = useUpdateEmployeeCategory();
  const deleteCategory = useDeleteEmployeeCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "#6366f1",
    default_working_hours: 8,
    overtime_eligible: true,
    requires_license: false,
    is_active: true,
  });

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        code: category.code,
        color: category.color || "#6366f1",
        default_working_hours: category.default_working_hours || 8,
        overtime_eligible: category.overtime_eligible ?? true,
        requires_license: category.requires_license ?? false,
        is_active: category.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        code: "",
        color: "#6366f1",
        default_working_hours: 8,
        overtime_eligible: true,
        requires_license: false,
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

    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...data });
    } else {
      await createCategory.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCategory.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Categories"
        description="Define staff categories like Doctor, Nurse, Admin, etc."
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        }
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Working Hours</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>License Req.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No categories found. Add your first category.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono">{category.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#6366f1" }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{category.default_working_hours || 8} hrs</TableCell>
                  <TableCell>
                    <Badge variant={category.overtime_eligible ? "default" : "secondary"}>
                      {category.overtime_eligible ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.requires_license ? "default" : "secondary"}>
                      {category.requires_license ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Doctor"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., DOC"
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

            <div className="space-y-2">
              <Label>Default Working Hours</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={formData.default_working_hours}
                onChange={(e) => setFormData({ ...formData, default_working_hours: parseInt(e.target.value) || 8 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Overtime Eligible</Label>
              <Switch
                checked={formData.overtime_eligible}
                onCheckedChange={(checked) => setFormData({ ...formData, overtime_eligible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Requires License/Certification</Label>
              <Switch
                checked={formData.requires_license}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_license: checked })}
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
              disabled={!formData.name || !formData.code || createCategory.isPending || updateCategory.isPending}
            >
              {(createCategory.isPending || updateCategory.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
