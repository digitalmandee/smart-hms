import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";
import {
  useQualifications,
  useCreateQualification,
  useUpdateQualification,
  useDeleteQualification,
} from "@/hooks/useConfiguration";

export default function QualificationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", abbreviation: "" });

  const { data: qualifications, isLoading } = useQualifications();
  const createMutation = useCreateQualification();
  const updateMutation = useUpdateQualification();
  const deleteMutation = useDeleteQualification();

  const handleOpenDialog = (qualification?: any) => {
    if (qualification) {
      setEditingId(qualification.id);
      setFormData({
        name: qualification.name,
        abbreviation: qualification.abbreviation || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", abbreviation: "" });
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
    setFormData({ name: "", abbreviation: "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this qualification?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Medical Qualifications"
        description="Manage qualifications available for doctors"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Qualifications" },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Qualification
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Qualifications
          </CardTitle>
          <CardDescription>
            Configure medical qualifications for doctor profiles (MBBS, FCPS, MD, etc.)
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
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications?.map((qual) => (
                  <TableRow key={qual.id}>
                    <TableCell className="font-medium">{qual.abbreviation || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{qual.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(qual)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(qual.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!qualifications?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No qualifications configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Qualification" : "Add Qualification"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation *</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                placeholder="e.g. MBBS, FCPS, MD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bachelor of Medicine, Bachelor of Surgery"
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
