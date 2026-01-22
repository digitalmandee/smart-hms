import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
  ServiceCategory,
} from "@/hooks/useServiceCategories";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scan,
  Pill,
  Building,
  Circle,
  Heart,
  Activity,
  Thermometer,
  Microscope,
  Scissors,
  Bandage,
  ExternalLink,
} from "lucide-react";

const iconOptions = [
  { value: "stethoscope", label: "Stethoscope", icon: Stethoscope },
  { value: "syringe", label: "Syringe", icon: Syringe },
  { value: "flask-conical", label: "Flask", icon: FlaskConical },
  { value: "scan", label: "Scan", icon: Scan },
  { value: "pill", label: "Pill", icon: Pill },
  { value: "building", label: "Building", icon: Building },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "activity", label: "Activity", icon: Activity },
  { value: "thermometer", label: "Thermometer", icon: Thermometer },
  { value: "microscope", label: "Microscope", icon: Microscope },
  { value: "scissors", label: "Scissors", icon: Scissors },
  { value: "bandage", label: "Bandage", icon: Bandage },
  { value: "circle", label: "Circle", icon: Circle },
  { value: "more-horizontal", label: "More", icon: MoreHorizontal },
];

const colorOptions = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "gray", label: "Gray", class: "bg-gray-500" },
];

function getIconComponent(iconName: string) {
  const found = iconOptions.find((i) => i.value === iconName);
  return found?.icon || Circle;
}

interface FormData {
  code: string;
  name: string;
  icon: string;
  color: string;
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useServiceCategories(true);
  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  const deleteMutation = useDeleteServiceCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    icon: "circle",
    color: "gray",
  });

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ code: "", name: "", icon: "circle", color: "gray" });
    setDialogOpen(true);
  };

  const openEditDialog = (category: ServiceCategory) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });
    } else {
      await createMutation.mutateAsync({
        code: formData.code || formData.name,
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
      });
    }
    setDialogOpen(false);
  };

  const handleToggleActive = async (category: ServiceCategory) => {
    await updateMutation.mutateAsync({
      id: category.id,
      is_active: !category.is_active,
    });
  };

  const handleDelete = async (category: ServiceCategory) => {
    if (category.is_system) {
      return;
    }
    await deleteMutation.mutateAsync(category.id);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Categories"
        description="Manage categories for organizing your billable services"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => {
                  const IconComp = getIconComponent(category.icon);
                  const colorClass = colorOptions.find(c => c.value === category.color)?.class || "bg-gray-500";
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded ${colorClass} text-white`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/services/category/${category.code}`)}
                          className="text-primary hover:text-primary font-medium"
                        >
                          {category.name}
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {category.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${colorClass}`} />
                          <span className="capitalize text-sm">{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => handleToggleActive(category)}
                        />
                      </TableCell>
                      <TableCell>
                        {category.is_system ? (
                          <span className="text-xs bg-muted px-2 py-1 rounded">System</span>
                        ) : (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Custom</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {!category.is_system && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(category)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Physiotherapy"
              />
            </div>

            {!editingCategory && (
              <div className="space-y-2">
                <Label>Code (optional)</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Auto-generated from name"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Internal identifier. Leave empty to auto-generate.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${option.class}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !formData.name}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
