import { useDialysisMachines, useCreateDialysisMachine, useUpdateDialysisMachine } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Monitor, Shield } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
  available: "default",
  in_use: "secondary",
  maintenance: "outline",
  out_of_service: "destructive",
};

export default function DialysisMachinesPage() {
  const { data: machines, isLoading } = useDialysisMachines();
  const createMachine = useCreateDialysisMachine();
  const updateMachine = useUpdateDialysisMachine();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ machine_number: "", serial_number: "", model: "", manufacturer: "", chair_number: "" });

  const handleSubmit = () => {
    if (!form.machine_number) return;
    createMachine.mutate(form, { onSuccess: () => { setOpen(false); setForm({ machine_number: "", serial_number: "", model: "", manufacturer: "", chair_number: "" }); } });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMachine.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Machines"
        description="Machine inventory, status, and disinfection tracking"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Machines" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Machine</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Dialysis Machine</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Machine Number *</Label><Input value={form.machine_number} onChange={e => setForm(f => ({ ...f, machine_number: e.target.value }))} /></div>
                <div><Label>Chair Number</Label><Input value={form.chair_number} onChange={e => setForm(f => ({ ...f, chair_number: e.target.value }))} /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
                <div><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
                <div><Label>Serial Number</Label><Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
                <Button onClick={handleSubmit} disabled={createMachine.isPending} className="w-full">{createMachine.isPending ? "Adding..." : "Add Machine"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !machines?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No machines configured yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m: any) => (
            <Card key={m.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><Monitor className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-semibold">{m.machine_number}</p>
                      <p className="text-xs text-muted-foreground">{m.model || "–"} • {m.manufacturer || "–"}</p>
                    </div>
                  </div>
                  <Badge variant={statusColors[m.status] as any}>{m.status}</Badge>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Chair: {m.chair_number || "–"} • S/N: {m.serial_number || "–"}</p>
                  {m.last_disinfected_at && (
                    <p className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3" />
                      Disinfected: {new Date(m.last_disinfected_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Select onValueChange={v => handleStatusChange(m.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Change status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
