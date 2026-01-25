import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, FileText, Stethoscope } from "lucide-react";
import {
  useSurgeonFeeTemplates,
  useCreateSurgeonFeeTemplate,
  useUpdateSurgeonFeeTemplate,
  useDeleteSurgeonFeeTemplate,
  SurgeonFeeTemplate,
  CreateTemplateData,
} from "@/hooks/useSurgeonFeeTemplates";
import { useSurgeons } from "@/hooks/useDoctors";
import { SurgeryPricingBreakdown } from "@/components/ot/SurgeryPricingBreakdown";
import { SurgeryCharges, calculateSurgeryChargesTotal } from "@/hooks/useSurgeonFeeTemplates";

const initialCharges: SurgeryCharges = {
  surgeon_fee: 0,
  anesthesia_fee: 0,
  nursing_fee: 0,
  ot_room_fee: 0,
  consumables_fee: 0,
  recovery_fee: 0,
  total: 0,
};

export default function SurgeonFeesPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SurgeonFeeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [surgeonId, setSurgeonId] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [procedureCode, setProcedureCode] = useState("");
  const [anesthesiaType, setAnesthesiaType] = useState<"local" | "spinal" | "general" | "sedation" | "">("");
  const [charges, setCharges] = useState<SurgeryCharges>(initialCharges);
  const [notes, setNotes] = useState("");

  const { data: templates, isLoading } = useSurgeonFeeTemplates();
  const { data: doctors } = useSurgeons();
  const createTemplate = useCreateSurgeonFeeTemplate();
  const updateTemplate = useUpdateSurgeonFeeTemplate();
  const deleteTemplate = useDeleteSurgeonFeeTemplate();

  const filteredTemplates = templates?.filter(
    (t) =>
      t.procedure_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.surgeon?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setSurgeonId("");
    setProcedureName("");
    setProcedureCode("");
    setAnesthesiaType("");
    setCharges(initialCharges);
    setNotes("");
    setEditingTemplate(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: SurgeonFeeTemplate) => {
    setEditingTemplate(template);
    setSurgeonId(template.surgeon_id);
    setProcedureName(template.procedure_name);
    setProcedureCode(template.procedure_code || "");
    setAnesthesiaType(template.default_anesthesia_type || "");
    setCharges({
      surgeon_fee: template.surgeon_fee,
      anesthesia_fee: template.default_anesthesia_fee,
      nursing_fee: template.nursing_fee,
      ot_room_fee: template.ot_room_fee,
      consumables_fee: template.consumables_fee,
      recovery_fee: template.recovery_fee,
      total: template.total_package,
    });
    setNotes(template.notes || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data: CreateTemplateData = {
      surgeon_id: surgeonId,
      procedure_name: procedureName,
      procedure_code: procedureCode || undefined,
      surgeon_fee: charges.surgeon_fee,
      default_anesthesia_type: anesthesiaType || undefined,
      default_anesthesia_fee: charges.anesthesia_fee,
      nursing_fee: charges.nursing_fee,
      ot_room_fee: charges.ot_room_fee,
      consumables_fee: charges.consumables_fee,
      recovery_fee: charges.recovery_fee,
      notes: notes || undefined,
    };

    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, ...data });
    } else {
      await createTemplate.mutateAsync(data);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surgeon Fee Templates"
        description="Manage procedure-specific fee templates for surgeons"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Fee Templates</CardTitle>
              <CardDescription>
                Templates auto-populate surgery charges when booking
              </CardDescription>
            </div>
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No fee templates found</p>
              <p className="text-sm">Create templates for quick surgery booking</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Surgeon</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead className="text-right">Surgeon Fee</TableHead>
                  <TableHead className="text-right">Anesthesia</TableHead>
                  <TableHead className="text-right">Total Package</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {template.surgeon?.profile?.full_name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.procedure_name}</p>
                        {template.procedure_code && (
                          <p className="text-xs text-muted-foreground">
                            {template.procedure_code}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      Rs. {template.surgeon_fee.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="tabular-nums">
                          Rs. {template.default_anesthesia_fee.toLocaleString()}
                        </p>
                        {template.default_anesthesia_type && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.default_anesthesia_type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="tabular-nums">
                        Rs. {template.total_package.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Fee Template" : "Create Fee Template"}
            </DialogTitle>
            <DialogDescription>
              Define default charges for a procedure. These will auto-populate when booking surgeries.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Surgeon *</Label>
                <Select value={surgeonId} onValueChange={setSurgeonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgeon" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.profile?.full_name || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Anesthesia Type</Label>
                <Select
                  value={anesthesiaType || "none"}
                  onValueChange={(v) =>
                    setAnesthesiaType(v === "none" ? "" : (v as any))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="spinal">Spinal</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sedation">Sedation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Procedure Name *</Label>
                <Input
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="e.g., Appendectomy"
                />
              </div>
              <div className="space-y-2">
                <Label>Procedure Code</Label>
                <Input
                  value={procedureCode}
                  onChange={(e) => setProcedureCode(e.target.value)}
                  placeholder="e.g., APP-001"
                />
              </div>
            </div>

            <SurgeryPricingBreakdown
              charges={charges}
              onChange={setCharges}
            />

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this procedure template..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !surgeonId || !procedureName}
            >
              {isPending ? "Saving..." : editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
