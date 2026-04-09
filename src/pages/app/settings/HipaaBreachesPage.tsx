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
import { Plus, AlertTriangle, Loader2, Clock, ShieldAlert } from "lucide-react";
import { useHipaaBreaches, useCreateHipaaBreach, useUpdateHipaaBreach } from "@/hooks/useHipaaBreaches";
import { format, differenceInDays } from "date-fns";

const BREACH_TYPES = [
  { value: "unauthorized_access", label: "Unauthorized Access" },
  { value: "loss", label: "Loss" },
  { value: "theft", label: "Theft" },
  { value: "improper_disposal", label: "Improper Disposal" },
  { value: "hacking", label: "Hacking/IT Incident" },
  { value: "other", label: "Other" },
];

const RISK_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "contained", label: "Contained" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function HipaaBreachesPage() {
  const { t } = useTranslation();
  const { data: breaches, isLoading } = useHipaaBreaches();
  const createBreach = useCreateHipaaBreach();
  const updateBreach = useUpdateHipaaBreach();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    incident_date: new Date().toISOString().split("T")[0],
    discovery_date: new Date().toISOString().split("T")[0],
    breach_type: "other" as string,
    individuals_affected_count: 0,
    description: "",
    root_cause: "",
    corrective_actions: "",
    risk_assessment: "medium" as string,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBreach.mutateAsync(form);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      investigating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      contained: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      closed: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return <Badge className={colors[risk] || ""}>{risk}</Badge>;
  };

  const getDeadlineBadge = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return <Badge variant="destructive">Overdue by {Math.abs(days)}d</Badge>;
    if (days <= 14) return <Badge className="bg-orange-100 text-orange-800">{days}d left</Badge>;
    return <Badge className="bg-green-100 text-green-800">{days}d left</Badge>;
  };

  const openCount = breaches?.filter(b => b.status !== "closed" && b.status !== "resolved").length || 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("hipaa.breach_title" as any)}
        description={t("hipaa.breach_description" as any)}
        breadcrumbs={[
          { label: t("nav.settings" as any), href: "/app/settings" },
          { label: t("hipaa.breach_title" as any) },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.open_breaches" as any)}</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.total_breaches" as any)}</p>
              <p className="text-2xl font-bold">{breaches?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.pending_notification" as any)}</p>
              <p className="text-2xl font-bold">
                {breaches?.filter(b => b.notification_status === "pending").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("hipaa.breach_incidents" as any)}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />{t("hipaa.report_breach" as any)}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("hipaa.report_breach" as any)}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("hipaa.incident_date" as any)}</Label>
                    <Input type="date" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("hipaa.discovery_date" as any)}</Label>
                    <Input type="date" value={form.discovery_date} onChange={e => setForm({ ...form, discovery_date: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("hipaa.breach_type" as any)}</Label>
                    <Select value={form.breach_type} onValueChange={v => setForm({ ...form, breach_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BREACH_TYPES.map(bt => <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("hipaa.risk_level" as any)}</Label>
                    <Select value={form.risk_assessment} onValueChange={v => setForm({ ...form, risk_assessment: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RISK_LEVELS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("hipaa.affected_count" as any)}</Label>
                  <Input type="number" min={0} value={form.individuals_affected_count} onChange={e => setForm({ ...form, individuals_affected_count: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.description" as any)}</Label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("hipaa.root_cause" as any)}</Label>
                  <Textarea value={form.root_cause} onChange={e => setForm({ ...form, root_cause: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>{t("hipaa.corrective_actions" as any)}</Label>
                  <Textarea value={form.corrective_actions} onChange={e => setForm({ ...form, corrective_actions: e.target.value })} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel" as any)}</Button>
                  <Button type="submit" disabled={createBreach.isPending}>
                    {createBreach.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
          ) : !breaches?.length ? (
            <p className="text-center text-muted-foreground py-8">{t("hipaa.no_breaches" as any)}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hipaa.incident_date" as any)}</TableHead>
                  <TableHead>{t("hipaa.breach_type" as any)}</TableHead>
                  <TableHead>{t("hipaa.affected_count" as any)}</TableHead>
                  <TableHead>{t("hipaa.risk_level" as any)}</TableHead>
                  <TableHead>{t("common.status" as any)}</TableHead>
                  <TableHead>{t("hipaa.notification_deadline" as any)}</TableHead>
                  <TableHead>{t("common.actions" as any)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breaches.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{format(new Date(b.incident_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="capitalize">{b.breach_type.replace("_", " ")}</TableCell>
                    <TableCell>{b.individuals_affected_count}</TableCell>
                    <TableCell>{getRiskBadge(b.risk_assessment)}</TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell>{getDeadlineBadge(b.notification_deadline)}</TableCell>
                    <TableCell>
                      {b.status !== "closed" && (
                        <Select
                          value={b.status}
                          onValueChange={v => updateBreach.mutate({ id: b.id, status: v } as any)}
                        >
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
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
