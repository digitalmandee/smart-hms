import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useBAAgreements, useCreateBAA, useUpdateBAA } from "@/hooks/useBAAgreements";
import { format, differenceInDays } from "date-fns";

const BAA_STATUSES = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "pending_renewal", label: "Pending Renewal" },
  { value: "terminated", label: "Terminated" },
];

export default function BAAManagementPage() {
  const { t } = useTranslation();
  const { data: baas, isLoading } = useBAAgreements();
  const createBAA = useCreateBAA();
  const updateBAA = useUpdateBAA();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    vendor_name: "",
    vendor_contact: "",
    vendor_email: "",
    service_description: "",
    agreement_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    notes: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBAA.mutateAsync({
      ...form,
      expiry_date: form.expiry_date || null,
    } as any);
    setIsDialogOpen(false);
    setForm({ vendor_name: "", vendor_contact: "", vendor_email: "", service_description: "", agreement_date: new Date().toISOString().split("T")[0], expiry_date: "", notes: "" });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      pending_renewal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      terminated: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status] || ""}>{status.replace("_", " ")}</Badge>;
  };

  const getExpiryIndicator = (expiry: string | null) => {
    if (!expiry) return <span className="text-muted-foreground">-</span>;
    const days = differenceInDays(new Date(expiry), new Date());
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-800">{days}d left</Badge>;
    return <span>{format(new Date(expiry), "MMM d, yyyy")}</span>;
  };

  const activeCount = baas?.filter(b => b.status === "active").length || 0;
  const expiringCount = baas?.filter(b => {
    if (!b.expiry_date) return false;
    const days = differenceInDays(new Date(b.expiry_date), new Date());
    return days >= 0 && days <= 30;
  }).length || 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("hipaa.baa_title" as any)}
        description={t("hipaa.baa_description" as any)}
        breadcrumbs={[
          { label: t("nav.settings" as any), href: "/app/settings" },
          { label: t("hipaa.baa_title" as any) },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.active_baas" as any)}</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.total_baas" as any)}</p>
              <p className="text-2xl font-bold">{baas?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.expiring_baas" as any)}</p>
              <p className="text-2xl font-bold">{expiringCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("hipaa.baa_agreements" as any)}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />{t("hipaa.add_baa" as any)}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("hipaa.add_baa" as any)}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("hipaa.vendor_name" as any)}</Label>
                  <Input value={form.vendor_name} onChange={e => setForm({ ...form, vendor_name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("hipaa.vendor_contact" as any)}</Label>
                    <Input value={form.vendor_contact} onChange={e => setForm({ ...form, vendor_contact: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("hipaa.vendor_email" as any)}</Label>
                    <Input type="email" value={form.vendor_email} onChange={e => setForm({ ...form, vendor_email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("hipaa.service_description" as any)}</Label>
                  <Textarea value={form.service_description} onChange={e => setForm({ ...form, service_description: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("hipaa.agreement_date" as any)}</Label>
                    <Input type="date" value={form.agreement_date} onChange={e => setForm({ ...form, agreement_date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("hipaa.expiry_date" as any)}</Label>
                    <Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("common.notes" as any)}</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel" as any)}</Button>
                  <Button type="submit" disabled={createBAA.isPending}>
                    {createBAA.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("common.save" as any)}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !baas?.length ? (
            <p className="text-center text-muted-foreground py-8">{t("hipaa.no_baas" as any)}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hipaa.vendor_name" as any)}</TableHead>
                  <TableHead>{t("hipaa.service_description" as any)}</TableHead>
                  <TableHead>{t("hipaa.agreement_date" as any)}</TableHead>
                  <TableHead>{t("hipaa.expiry_date" as any)}</TableHead>
                  <TableHead>{t("common.status" as any)}</TableHead>
                  <TableHead>{t("common.actions" as any)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {baas.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.vendor_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{b.service_description || "-"}</TableCell>
                    <TableCell>{format(new Date(b.agreement_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{getExpiryIndicator(b.expiry_date)}</TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={b.status}
                        onValueChange={v => updateBAA.mutate({ id: b.id, status: v } as any)}
                      >
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BAA_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
