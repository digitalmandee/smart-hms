import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calculator, PlayCircle } from "lucide-react";
import { useFixedAssets, useCreateFixedAsset, calculateDepreciation } from "@/hooks/useFixedAssets";
import { useDepreciationPosting } from "@/hooks/useDepreciationPosting";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

export default function FixedAssetsPage() {
  const { data: assets, isLoading } = useFixedAssets();
  const createMutation = useCreateFixedAsset();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [scheduleAsset, setScheduleAsset] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", category: "", purchase_date: "", purchase_cost: "",
    useful_life_months: "60", depreciation_method: "straight_line", salvage_value: "0",
  });

  const handleCreate = () => {
    createMutation.mutate({
      name: form.name,
      category: form.category,
      purchase_date: form.purchase_date,
      purchase_cost: parseFloat(form.purchase_cost),
      useful_life_months: parseInt(form.useful_life_months),
      depreciation_method: form.depreciation_method,
      salvage_value: parseFloat(form.salvage_value || "0"),
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: "", category: "", purchase_date: "", purchase_cost: "", useful_life_months: "60", depreciation_method: "straight_line", salvage_value: "0" });
      },
    });
  };

  const activeAssets = (assets || []).filter((a: any) => a.status === "active");
  const totalCost = activeAssets.reduce((s: number, a: any) => s + Number(a.purchase_cost), 0);
  const totalNBV = activeAssets.reduce((s: number, a: any) => s + Number(a.net_book_value || 0), 0);
  const totalDep = activeAssets.reduce((s: number, a: any) => s + Number(a.accumulated_depreciation || 0), 0);

  return (
    <div>
      <PageHeader
        title="Fixed Asset Register"
        description="Track hospital equipment, depreciation, and disposals"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Fixed Assets" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Register Asset</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Register Fixed Asset</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Asset Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="MRI Machine" /></div>
                  <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Medical Equipment" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} /></div>
                  <div><Label>Purchase Cost</Label><Input type="number" value={form.purchase_cost} onChange={e => setForm(p => ({ ...p, purchase_cost: e.target.value }))} placeholder="0.00" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Useful Life (months)</Label><Input type="number" value={form.useful_life_months} onChange={e => setForm(p => ({ ...p, useful_life_months: e.target.value }))} /></div>
                  <div><Label>Salvage Value</Label><Input type="number" value={form.salvage_value} onChange={e => setForm(p => ({ ...p, salvage_value: e.target.value }))} placeholder="0.00" /></div>
                </div>
                <div>
                  <Label>Depreciation Method</Label>
                  <Select value={form.depreciation_method} onValueChange={v => setForm(p => ({ ...p, depreciation_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight_line">Straight Line</SelectItem>
                      <SelectItem value="reducing_balance">Reducing Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={!form.name || !form.purchase_date || !form.purchase_cost || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Registering..." : "Register Asset"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalCost)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Accumulated Depreciation</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{formatCurrency(totalDep)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Book Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalNBV)}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="register">
          <TabsList><TabsTrigger value="register">Asset Register</TabsTrigger><TabsTrigger value="schedule">Depreciation Schedule</TabsTrigger></TabsList>
          <TabsContent value="register">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Accum. Dep.</TableHead>
                        <TableHead className="text-right">NBV</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(assets || []).map((asset: any) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono text-sm">{asset.asset_code}</TableCell>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.category || "—"}</TableCell>
                          <TableCell>{format(new Date(asset.purchase_date), "dd MMM yyyy")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(asset.purchase_cost)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(asset.accumulated_depreciation)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(asset.net_book_value)}</TableCell>
                          <TableCell className="capitalize">{(asset.depreciation_method || "").replace("_", " ")}</TableCell>
                          <TableCell><Badge variant={asset.status === "active" ? "default" : "secondary"}>{asset.status}</Badge></TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => setScheduleAsset(asset)}>
                              <Calculator className="h-3 w-3 mr-1" />Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!assets || assets.length === 0) && (
                        <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No fixed assets registered</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Depreciation Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleAsset ? (() => {
                  const schedule = calculateDepreciation(scheduleAsset);
                  const displaySchedule = schedule.filter((_, i) => i % 12 === 11 || i === schedule.length - 1); // yearly summary
                  return (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">{scheduleAsset.name} — {scheduleAsset.depreciation_method?.replace("_", " ")}</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">Annual Depreciation</TableHead>
                            <TableHead className="text-right">Accumulated</TableHead>
                            <TableHead className="text-right">Net Book Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displaySchedule.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell>Year {i + 1}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.expense * 12)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.accumulated)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(row.nbv)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })() : (
                  <p className="text-center text-muted-foreground py-8">Select an asset from the register tab to view its depreciation schedule</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
