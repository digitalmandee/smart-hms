import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { RackSelector } from "@/components/pharmacy/RackSelector";
import { RackLocationBadge } from "@/components/pharmacy/RackLocationBadge";
import { useRackAssignments, useUpsertRackAssignment, useDeleteRackAssignment, MedicineRackAssignment } from "@/hooks/useStoreRacks";
import { useStores } from "@/hooks/useStores";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function RackAssignmentsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [storeFilter, setStoreFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAssign, setShowAssign] = useState(false);

  const { data: assignments, isLoading } = useRackAssignments(storeFilter);
  const upsertAssignment = useUpsertRackAssignment();
  const deleteAssignment = useDeleteRackAssignment();

  // For the assignment dialog
  const [assignForm, setAssignForm] = useState({
    medicine_id: "",
    store_id: "",
    rack_id: "",
    shelf_number: "",
    position: "",
  });

  // Fetch medicines for dropdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: medicines } = useQuery({
    queryKey: ["medicines-list", profile?.organization_id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("medicines")
        .select("id, name, generic_name")
        .eq("organization_id", profile!.organization_id)
        .eq("is_active", true)
        .order("name")
        .limit(500);
      if (error) throw error;
      return data as { id: string; name: string; generic_name: string | null }[];
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = assignments?.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.medicine?.name?.toLowerCase().includes(s) || a.rack?.rack_code?.toLowerCase().includes(s);
  });

  const handleAssign = async () => {
    await upsertAssignment.mutateAsync({
      medicine_id: assignForm.medicine_id,
      store_id: assignForm.store_id,
      rack_id: assignForm.rack_id,
      shelf_number: assignForm.shelf_number || undefined,
      position: assignForm.position || undefined,
    });
    setShowAssign(false);
    setAssignForm({ medicine_id: "", store_id: "", rack_id: "", shelf_number: "", position: "" });
  };

  const columns: ColumnDef<MedicineRackAssignment>[] = [
    {
      accessorKey: "medicine",
      header: "Medicine",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.medicine?.name || "—"}</p>
          {row.original.medicine?.generic_name && (
            <p className="text-xs text-muted-foreground">{row.original.medicine.generic_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "store",
      header: "Warehouse",
      cell: ({ row }) => row.original.store?.name || "—",
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <RackLocationBadge
          rackCode={row.original.rack?.rack_code}
          rackName={row.original.rack?.rack_name}
          shelfNumber={row.original.shelf_number}
          position={row.original.position}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => deleteAssignment.mutate(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rack Assignments"
        description="Map medicines to rack locations across warehouses"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy/warehouses")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setShowAssign(true)}>
              <Plus className="mr-2 h-4 w-4" /> Assign Medicine
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicine or rack..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <StoreSelector value={storeFilter} onChange={setStoreFilter} showAll context="pharmacy" className="w-[220px]" />
      </div>

      <DataTable columns={columns} data={filtered || []} isLoading={isLoading} />

      {/* Assign Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Medicine to Rack</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medicine *</Label>
              <Select value={assignForm.medicine_id} onValueChange={(v) => setAssignForm({ ...assignForm, medicine_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                <SelectContent>
                  {medicines?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse *</Label>
              <StoreSelector value={assignForm.store_id} onChange={(v) => setAssignForm({ ...assignForm, store_id: v, rack_id: "" })} context="pharmacy" />
            </div>
            <div className="space-y-2">
              <Label>Rack *</Label>
              <RackSelector storeId={assignForm.store_id} value={assignForm.rack_id} onChange={(v) => setAssignForm({ ...assignForm, rack_id: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shelf Number</Label>
                <Input value={assignForm.shelf_number} onChange={(e) => setAssignForm({ ...assignForm, shelf_number: e.target.value })} placeholder="e.g. 3" />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={assignForm.position} onChange={(e) => setAssignForm({ ...assignForm, position: e.target.value })} placeholder="e.g. Left" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignForm.medicine_id || !assignForm.store_id || !assignForm.rack_id || upsertAssignment.isPending}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
