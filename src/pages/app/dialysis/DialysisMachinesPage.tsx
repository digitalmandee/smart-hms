import { useDialysisMachines, useCreateDialysisMachine, useUpdateDialysisMachine } from "@/hooks/useDialysis";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { ReportTable } from "@/components/reports/ReportTable";

const statusColors: Record<string, string> = {
  available: "default",
  in_use: "secondary",
  maintenance: "outline",
  out_of_service: "destructive",
};

export default function DialysisMachinesPage() {
  const { t } = useTranslation();
  const { data: machines, isLoading } = useDialysisMachines();
  const createMachine = useCreateDialysisMachine();
  const updateMachine = useUpdateDialysisMachine();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({ machine_number: "", serial_number: "", model: "", manufacturer: "", chair_number: "" });

  const handleSubmit = () => {
    if (!form.machine_number) return;
    createMachine.mutate(form, { onSuccess: () => { setOpen(false); setForm({ machine_number: "", serial_number: "", model: "", manufacturer: "", chair_number: "" }); } });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMachine.mutate({ id, status });
  };

  const filteredMachines = useMemo(() => {
    if (!machines) return [];
    if (statusFilter === "all") return machines;
    return machines.filter((m: any) => m.status === statusFilter);
  }, [machines, statusFilter]);

  const columns = [
    { key: "machine_number", label: t("dialysis.machineNo", "Machine #"), sortable: true },
    { key: "chair_number", label: t("dialysis.chairNo", "Chair #"), sortable: true, render: (v: any) => v || "–" },
    { key: "model", label: t("dialysis.model", "Model"), sortable: true, render: (v: any) => v || "–" },
    { key: "manufacturer", label: t("dialysis.manufacturer", "Manufacturer"), render: (v: any) => v || "–" },
    { key: "serial_number", label: t("dialysis.serialNo", "S/N"), render: (v: any) => v || "–" },
    {
      key: "status",
      label: t("common.status"),
      sortable: true,
      render: (v: any) => <Badge variant={statusColors[v] as any}>{v?.replace("_", " ")}</Badge>,
    },
    {
      key: "last_disinfected_at",
      label: t("dialysis.lastDisinfected", "Last Disinfected"),
      render: (v: any) =>
        v ? (
          <span className="flex items-center gap-1 text-xs">
            <Shield className="h-3 w-3" />
            {new Date(v).toLocaleDateString()}
          </span>
        ) : "–",
    },
    {
      key: "id",
      label: t("common.actions"),
      render: (_: any, row: any) => (
        <Select onValueChange={v => handleStatusChange(row.id, v)}>
          <SelectTrigger className="w-32 h-7 text-xs"><SelectValue placeholder={t("dialysis.changeStatus", "Change")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{t("dialysis.available", "Available")}</SelectItem>
            <SelectItem value="in_use">{t("dialysis.inUse", "In Use")}</SelectItem>
            <SelectItem value="maintenance">{t("dialysis.maintenance", "Maintenance")}</SelectItem>
            <SelectItem value="out_of_service">{t("dialysis.outOfService", "Out of Service")}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("dialysis.machines")}
        description={t("dialysis.machinesDesc", "Machine inventory, status, and disinfection tracking")}
        breadcrumbs={[{ label: t("dialysis.dashboard"), href: "/app/dialysis" }, { label: t("dialysis.machines") }]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="available">{t("dialysis.available", "Available")}</SelectItem>
                <SelectItem value="in_use">{t("dialysis.inUse", "In Use")}</SelectItem>
                <SelectItem value="maintenance">{t("dialysis.maintenance", "Maintenance")}</SelectItem>
                <SelectItem value="out_of_service">{t("dialysis.outOfService", "Out of Service")}</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("dialysis.addMachine", "Add Machine")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("dialysis.addMachine")}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label className="text-xs">{t("dialysis.machineNo")} *</Label><Input className="h-9" value={form.machine_number} onChange={e => setForm(f => ({ ...f, machine_number: e.target.value }))} /></div>
                  <div><Label className="text-xs">{t("dialysis.chairNo")}</Label><Input className="h-9" value={form.chair_number} onChange={e => setForm(f => ({ ...f, chair_number: e.target.value }))} /></div>
                  <div><Label className="text-xs">{t("dialysis.model")}</Label><Input className="h-9" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
                  <div><Label className="text-xs">{t("dialysis.manufacturer")}</Label><Input className="h-9" value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
                  <div><Label className="text-xs">{t("dialysis.serialNo")}</Label><Input className="h-9" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
                  <Button onClick={handleSubmit} disabled={createMachine.isPending} className="w-full">{createMachine.isPending ? t("common.loading") : t("dialysis.addMachine")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      {isLoading ? <p className="text-muted-foreground">{t("common.loading")}</p> : !machines?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t("dialysis.noMachines", "No machines configured yet.")}</CardContent></Card>
      ) : (
        <ReportTable data={filteredMachines} columns={columns} pageSize={20} />
      )}
    </div>
  );
}
