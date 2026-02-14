import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/useStores";
import { useAllStoreRacks, useCreateRack, useUpdateRack, useDeleteRack, StoreRack } from "@/hooks/useStoreRacks";
import { ArrowLeft, Plus, Trash2, Edit, Save, X, LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export default function RackManagementPage() {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
  const { data: store } = useStore(storeId || "");
  const { data: racks, isLoading } = useAllStoreRacks(storeId || "");
  const createRack = useCreateRack();
  const updateRack = useUpdateRack();
  const deleteRack = useDeleteRack();

  const [showForm, setShowForm] = useState(false);
  const [editingRack, setEditingRack] = useState<StoreRack | null>(null);
  const [deletingRack, setDeletingRack] = useState<StoreRack | null>(null);
  const [form, setForm] = useState({ rack_code: "", rack_name: "", section: "" });

  const openCreate = () => {
    setEditingRack(null);
    setForm({ rack_code: "", rack_name: "", section: "" });
    setShowForm(true);
  };

  const openEdit = (rack: StoreRack) => {
    setEditingRack(rack);
    setForm({ rack_code: rack.rack_code, rack_name: rack.rack_name || "", section: rack.section || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!storeId) return;
    if (editingRack) {
      await updateRack.mutateAsync({ id: editingRack.id, rack_code: form.rack_code, rack_name: form.rack_name, section: form.section });
    } else {
      await createRack.mutateAsync({ store_id: storeId, rack_code: form.rack_code, rack_name: form.rack_name, section: form.section });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Racks — ${store?.name || "..."}`}
        description="Manage rack locations in this warehouse"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/app/pharmacy/warehouses/${storeId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Rack
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !racks?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <LayoutGrid className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No racks yet</p>
            <p className="text-sm">Create racks to organize products in this warehouse.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add First Rack</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {racks.map((rack) => (
            <Card key={rack.id} className={!rack.is_active ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-lg">{rack.rack_code}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(rack)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingRack(rack)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {rack.rack_name && <p className="text-sm">{rack.rack_name}</p>}
                {rack.section && <Badge variant="outline" className="mt-1">{rack.section}</Badge>}
                {!rack.is_active && <Badge variant="secondary" className="mt-2">Inactive</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRack ? "Edit Rack" : "Add Rack"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rack Code *</Label>
              <Input value={form.rack_code} onChange={(e) => setForm({ ...form, rack_code: e.target.value })} placeholder="e.g. R-01" />
            </div>
            <div className="space-y-2">
              <Label>Rack Name</Label>
              <Input value={form.rack_name} onChange={(e) => setForm({ ...form, rack_name: e.target.value })} placeholder="e.g. Cardiovascular" />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. Aisle A" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}><X className="mr-2 h-4 w-4" /> Cancel</Button>
            <Button onClick={handleSave} disabled={!form.rack_code || createRack.isPending || updateRack.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRack} onOpenChange={() => setDeletingRack(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rack {deletingRack?.rack_code}?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all product-to-rack assignments for this rack.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingRack) { deleteRack.mutate(deletingRack.id); setDeletingRack(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
