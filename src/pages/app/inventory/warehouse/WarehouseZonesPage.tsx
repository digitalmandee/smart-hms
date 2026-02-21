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
import { useWarehouseZones, useCreateZone, useUpdateZone, useDeleteZone } from "@/hooks/useWarehouseZones";
import { useDefaultStore } from "@/hooks/useDefaultStore";

const ZONE_TYPES = ["receiving", "storage", "staging", "shipping", "cold", "hazardous"];

export default function WarehouseZonesPage() {
  const [storeId, setStoreId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [form, setForm] = useState({ zone_code: "", zone_name: "", zone_type: "storage", temperature_range: "" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useDefaultStore(storeId, setStoreId, false);

  const { data: zones, isLoading } = useWarehouseZones(storeId);
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const filteredZones = useMemo(() => {
    if (!zones) return [];
    return zones.filter((z) => {
      const matchesSearch = !search || z.zone_code.toLowerCase().includes(search.toLowerCase()) || z.zone_name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || z.zone_type === typeFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? z.is_active : !z.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [zones, search, typeFilter, statusFilter]);

  const openCreate = () => { setEditingZone(null); setForm({ zone_code: "", zone_name: "", zone_type: "storage", temperature_range: "" }); setDialogOpen(true); };
  const openEdit = (z: any) => { setEditingZone(z); setForm({ zone_code: z.zone_code, zone_name: z.zone_name, zone_type: z.zone_type, temperature_range: z.temperature_range || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editingZone) {
      await updateZone.mutateAsync({ id: editingZone.id, ...form });
    } else {
      await createZone.mutateAsync({ store_id: storeId, ...form });
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Warehouse Zones"
        description="Manage storage zones within your warehouses"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Zones" }]}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector value={storeId} onChange={setStoreId} className="w-[220px]" />
            {storeId && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Zone</Button>}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle>Zones {filteredZones.length ? `(${filteredZones.length})` : ""}</CardTitle>
            <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by code or name...">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ZONE_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </ListFilterBar>
          </div>
        </CardHeader>
        <CardContent>
          {!storeId ? <p className="text-muted-foreground text-sm">Select a warehouse to view zones.</p> : isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Temp Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.map((z) => (
                  <TableRow key={z.id}>
                    <TableCell className="font-mono">{z.zone_code}</TableCell>
                    <TableCell>{z.zone_name}</TableCell>
                    <TableCell><Badge variant="outline">{z.zone_type}</Badge></TableCell>
                    <TableCell>{z.temperature_range || "—"}</TableCell>
                    <TableCell><Badge variant={z.is_active ? "default" : "secondary"}>{z.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(z)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteZone.mutate(z.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredZones.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No zones found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingZone ? "Edit Zone" : "Create Zone"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Zone Code</Label><Input value={form.zone_code} onChange={(e) => setForm({ ...form, zone_code: e.target.value })} placeholder="e.g. Z-001" /></div>
            <div><Label>Zone Name</Label><Input value={form.zone_name} onChange={(e) => setForm({ ...form, zone_name: e.target.value })} placeholder="e.g. Cold Storage A" /></div>
            <div><Label>Zone Type</Label>
              <Select value={form.zone_type} onValueChange={(v) => setForm({ ...form, zone_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ZONE_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Temperature Range</Label><Input value={form.temperature_range} onChange={(e) => setForm({ ...form, temperature_range: e.target.value })} placeholder="e.g. 2-8°C" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.zone_code || !form.zone_name}>{editingZone ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
