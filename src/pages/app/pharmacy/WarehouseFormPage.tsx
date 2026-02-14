import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, useCreateStore, useUpdateStore } from "@/hooks/useStores";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";

export default function WarehouseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { profile } = useAuth();
  const { data: existing } = useStore(id || "");
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  const [form, setForm] = useState({
    name: "",
    code: "",
    store_type: "pharmacy",
    description: "",
    is_central: false,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        code: existing.code || "",
        store_type: existing.store_type,
        description: existing.description || "",
        is_central: existing.is_central,
      });
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.branch_id) return;

    if (isEdit) {
      await updateStore.mutateAsync({
        id: id!,
        name: form.name,
        code: form.code || undefined,
        store_type: form.store_type,
        description: form.description || undefined,
      });
    } else {
      await createStore.mutateAsync({
        name: form.name,
        code: form.code || undefined,
        store_type: form.store_type,
        description: form.description || undefined,
        branch_id: profile.branch_id,
        is_central: form.is_central,
        context: "pharmacy",
      });
    }
    navigate("/app/pharmacy/warehouses");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Warehouse" : "Create Warehouse"}
        description={isEdit ? "Update warehouse details" : "Add a new pharmacy warehouse"}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy/warehouses")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle>Warehouse Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. WH-01" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.store_type} onValueChange={(v) => setForm({ ...form, store_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="cold_storage">Cold Storage</SelectItem>
                    <SelectItem value="narcotics">Narcotics</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch id="central" checked={form.is_central} onCheckedChange={(v) => setForm({ ...form, is_central: v })} />
                <Label htmlFor="central">Central Warehouse</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={createStore.isPending || updateStore.isPending}>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Create"} Warehouse
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
