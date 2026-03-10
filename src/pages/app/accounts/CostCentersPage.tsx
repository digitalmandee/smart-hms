import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { useCostCenters, useCreateCostCenter, useUpdateCostCenter } from "@/hooks/useCostCenters";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function CostCentersPage() {
  const { data: centers, isLoading } = useCostCenters();
  const createMutation = useCreateCostCenter();
  const updateMutation = useUpdateCostCenter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => { setOpen(false); setForm({ name: "", code: "" }); },
    });
  };

  return (
    <div>
      <PageHeader
        title="Cost Centers"
        description="Track profitability by department or cost center"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Cost Centers" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Cost Center</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Cost Center</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Code</Label>
                  <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. CC-OPD" />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. OPD Department" />
                </div>
                <Button onClick={handleCreate} disabled={!form.name || !form.code || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Cost Centers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(centers || []).map((cc: any) => (
                  <TableRow key={cc.id}>
                    <TableCell className="font-mono">{cc.code}</TableCell>
                    <TableCell className="font-medium">{cc.name}</TableCell>
                    <TableCell>{cc.departments?.name || "—"}</TableCell>
                    <TableCell><Badge variant={cc.is_active ? "default" : "secondary"}>{cc.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cc.is_active}
                          onCheckedChange={(checked) => updateMutation.mutate({ id: cc.id, is_active: checked })}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!centers || centers.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No cost centers created yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
