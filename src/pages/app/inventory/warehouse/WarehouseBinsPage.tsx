import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useWarehouseBins, useCreateBin, useUpdateBin, useDeleteBin } from "@/hooks/useWarehouseBins";
import { useWarehouseZones } from "@/hooks/useWarehouseZones";
import { useDefaultStore } from "@/hooks/useDefaultStore";

const BIN_TYPES = ["shelf", "pallet", "floor", "cold"];

export default function WarehouseBinsPage() {
  const [storeId, setStoreId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<any>(null);
  const [form, setForm] = useState({ bin_code: "", bin_type: "shelf", zone_id: "", max_weight: "", max_volume: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useDefaultStore(storeId, setStoreId, false);

  const { data: bins, isLoading } = useWarehouseBins(storeId);
  const { data: zones } = useWarehouseZones(storeId);
  const createBin = useCreateBin();
  const updateBin = useUpdateBin();
  const deleteBin = useDeleteBin();

  const filteredBins = useMemo(() => {
    if (!bins) return [];
    return bins.filter((b) => {
      const matchesSearch = !search || b.bin_code.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || b.bin_type === typeFilter;
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "occupied" ? b.is_occupied : statusFilter === "available" ? (!b.is_occupied && b.is_active) : !b.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bins, search, typeFilter, statusFilter]);

  const openCreate = () => { setEditingBin(null); setForm({ bin_code: "", bin_type: "shelf", zone_id: "", max_weight: "", max_volume: "" }); setDialogOpen(true); };
  const openEdit = (b: any) => { setEditingBin(b); setForm({ bin_code: b.bin_code, bin_type: b.bin_type, zone_id: b.zone_id || "", max_weight: b.max_weight?.toString() || "", max_volume: b.max_volume?.toString() || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    const payload: any = { bin_code: form.bin_code, bin_type: form.bin_type };
    if (form.zone_id) payload.zone_id = form.zone_id;
    if (form.max_weight) payload.max_weight = parseFloat(form.max_weight);
    if (form.max_volume) payload.max_volume = parseFloat(form.max_volume);
    if (editingBin) {
      await updateBin.mutateAsync({ id: editingBin.id, ...payload });
    } else {
      await createBin.mutateAsync({ store_id: storeId, ...payload });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6">
      <PageHeader title="Warehouse Bins" description="Manage bins within warehouse zones"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Bins" }]}
        actions={<div className="flex items-center gap-3"><StoreSelector value={storeId} onChange={setStoreId} className="w-[220px]" />{storeId && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Bin</Button>}</div>}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle>Bins {filteredBins.length ? `(${filteredBins.length})` : ""}</CardTitle>
            <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by bin code...">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {BIN_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </ListFilterBar>
          </div>
        </CardHeader>
        <CardContent>
          {!storeId ? <p className="text-muted-foreground text-sm">Select a warehouse to view bins.</p> : isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Zone</TableHead><TableHead>Rack</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredBins.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono">{b.bin_code}</TableCell>
                    <TableCell><Badge variant="outline">{b.bin_type}</Badge></TableCell>
                    <TableCell>{b.zone?.zone_code || "—"}</TableCell>
                    <TableCell>{b.rack?.rack_code || "—"}</TableCell>
                    <TableCell>{b.max_weight ? `${b.max_weight}kg` : "—"}</TableCell>
                    <TableCell><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_occupied ? "Occupied" : "Available"}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteBin.mutate(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {!filteredBins.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No bins found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBin ? "Edit Bin" : "Create Bin"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Bin Code</Label><Input value={form.bin_code} onChange={(e) => setForm({ ...form, bin_code: e.target.value })} placeholder="e.g. B-001" /></div>
            <div><Label>Bin Type</Label><Select value={form.bin_type} onValueChange={(v) => setForm({ ...form, bin_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BIN_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Zone</Label><Select value={form.zone_id} onValueChange={(v) => setForm({ ...form, zone_id: v })}><SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger><SelectContent>{zones?.map((z) => <SelectItem key={z.id} value={z.id}>{z.zone_code} - {z.zone_name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Max Weight (kg)</Label><Input type="number" value={form.max_weight} onChange={(e) => setForm({ ...form, max_weight: e.target.value })} /></div><div><Label>Max Volume (m³)</Label><Input type="number" value={form.max_volume} onChange={(e) => setForm({ ...form, max_volume: e.target.value })} /></div></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.bin_code}>{editingBin ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
