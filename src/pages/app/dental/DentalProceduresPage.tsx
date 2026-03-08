import { useDentalProcedures, useCreateDentalProcedure } from "@/hooks/useDental";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["preventive", "restorative", "endodontic", "periodontic", "prosthodontic", "oral_surgery", "orthodontic", "diagnostic", "other"];

export default function DentalProceduresPage() {
  const { data: procedures, isLoading } = useDentalProcedures();
  const createProc = useCreateDentalProcedure();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", category: "restorative", default_cost: 0, duration_minutes: 30 });

  const handleSubmit = () => {
    if (!form.code || !form.name) return;
    createProc.mutate(form, { onSuccess: () => { setOpen(false); setForm({ code: "", name: "", category: "restorative", default_cost: 0, duration_minutes: 30 }); } });
  };

  const grouped = (procedures || []).reduce((acc: Record<string, any[]>, p: any) => {
    const cat = p.category || "other";
    (acc[cat] = acc[cat] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Procedures"
        description="CDT procedure catalog with pricing"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Procedures" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Procedure</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Dental Procedure</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="D2140" /></div>
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Amalgam Filling" /></div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cost (SAR)</Label><Input type="number" value={form.default_cost} onChange={e => setForm(f => ({ ...f, default_cost: Number(e.target.value) }))} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} /></div>
                </div>
                <Button onClick={handleSubmit} disabled={createProc.isPending} className="w-full">{createProc.isPending ? "Adding..." : "Add Procedure"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !Object.keys(grouped).length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No procedures configured yet. Add your CDT catalog.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([cat, procs]) => (
          <Card key={cat}>
            <CardHeader><CardTitle className="capitalize">{cat.replace("_", " ")}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(procs as any[]).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-mono text-sm mr-2">{p.code}</span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{p.duration_minutes}min</span>
                      <Badge variant="secondary">{p.default_cost} SAR</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
