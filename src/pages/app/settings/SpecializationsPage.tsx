import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Stethoscope, Syringe, Microscope, Scan, UserRound } from "lucide-react";
import {
  useSpecializations,
  useCreateSpecialization,
  useUpdateSpecialization,
  useDeleteSpecialization,
} from "@/hooks/useConfiguration";

type DoctorCategory = 'surgeon' | 'consultant' | 'anesthesia' | 'radiologist' | 'pathologist';

interface FormData {
  name: string;
  code: string;
  category: DoctorCategory;
  description: string;
  display_order: number;
}

const CATEGORY_OPTIONS: { value: DoctorCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'surgeon', label: 'Surgeon', icon: <Stethoscope className="h-3 w-3" />, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'consultant', label: 'Consultant/Physician', icon: <UserRound className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'anesthesia', label: 'Anesthesiology', icon: <Syringe className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'radiologist', label: 'Radiologist', icon: <Scan className="h-3 w-3" />, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'pathologist', label: 'Pathologist', icon: <Microscope className="h-3 w-3" />, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
];

export default function SpecializationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    code: "", 
    category: "consultant",
    description: "",
    display_order: 0 
  });

  const { data: specializations, isLoading } = useSpecializations();
  const createMutation = useCreateSpecialization();
  const updateMutation = useUpdateSpecialization();
  const deleteMutation = useDeleteSpecialization();

  const handleOpenDialog = (specialization?: any) => {
    if (specialization) {
      setEditingId(specialization.id);
      setFormData({
        name: specialization.name,
        code: specialization.code || "",
        category: specialization.category || "consultant",
        description: specialization.description || "",
        display_order: specialization.display_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: "", 
        code: "", 
        category: "consultant",
        description: "",
        display_order: (specializations?.length || 0) + 1 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setFormData({ name: "", code: "", category: "consultant", description: "", display_order: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this specialization?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getCategoryInfo = (category: DoctorCategory | null) => {
    return CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[1];
  };

  return (
    <div>
      <PageHeader
        title="Medical Specializations"
        description="Manage specializations and doctor categories"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Specializations" },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Specialization
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Specializations
          </CardTitle>
          <CardDescription>
            Configure medical specializations with categories (Surgeon, Consultant, Anesthesiologist, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specializations?.map((spec) => {
                  const categoryInfo = getCategoryInfo(spec.category as DoctorCategory);
                  return (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell className="text-muted-foreground">{spec.code || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 ${categoryInfo.color}`}>
                          {categoryInfo.icon}
                          {categoryInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {spec.description || "-"}
                      </TableCell>
                      <TableCell>{spec.display_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(spec)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(spec.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!specializations?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No specializations configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Specialization" : "Add Specialization"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cardiology, General Surgery"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CARD, SURG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Doctor Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: DoctorCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This determines how doctors with this specialization appear in OT scheduling, clearances, etc.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this specialization"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
