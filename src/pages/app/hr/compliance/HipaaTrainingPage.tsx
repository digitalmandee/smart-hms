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
import { Plus, GraduationCap, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useHipaaTrainingRecords, useCreateHipaaTraining } from "@/hooks/useHipaaTraining";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";

const TRAINING_TYPES = [
  { value: "initial", label: "Initial HIPAA Training" },
  { value: "annual_refresher", label: "Annual Refresher" },
  { value: "breach_response", label: "Breach Response" },
  { value: "phi_handling", label: "PHI Handling" },
];

export default function HipaaTrainingPage() {
  const { t } = useTranslation();
  const { data: records, isLoading } = useHipaaTrainingRecords();
  const createTraining = useCreateHipaaTraining();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["profiles-list"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name");
      return data || [];
    },
  });

  const [form, setForm] = useState({
    employee_id: "",
    training_type: "initial" as string,
    training_date: new Date().toISOString().split("T")[0],
    trainer_name: "",
    notes: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTraining.mutateAsync(form);
    setIsDialogOpen(false);
    setForm({ employee_id: "", training_type: "initial", training_date: new Date().toISOString().split("T")[0], trainer_name: "", notes: "" });
  };

  const getStatusBadge = (record: any) => {
    if (!record.expiry_date) return <Badge>Unknown</Badge>;
    const days = differenceInDays(new Date(record.expiry_date), new Date());
    if (days < 0) return <Badge variant="destructive">{t("hipaa.training_expired" as any)}</Badge>;
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-800">{t("hipaa.training_due_soon" as any)}</Badge>;
    return <Badge className="bg-green-100 text-green-800">{t("hipaa.training_completed" as any)}</Badge>;
  };

  const getProfileName = (id: string) => profiles?.find(p => p.id === id)?.full_name || "Unknown";

  const expiredCount = records?.filter(r => r.expiry_date && new Date(r.expiry_date) < new Date()).length || 0;
  const dueSoonCount = records?.filter(r => {
    if (!r.expiry_date) return false;
    const days = differenceInDays(new Date(r.expiry_date), new Date());
    return days >= 0 && days <= 30;
  }).length || 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("hipaa.training_title" as any)}
        description={t("hipaa.training_description" as any)}
        breadcrumbs={[
          { label: t("nav.hr" as any), href: "/app/hr" },
          { label: t("hipaa.training_title" as any) },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.total_trained" as any)}</p>
              <p className="text-2xl font-bold">{records?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.training_expired" as any)}</p>
              <p className="text-2xl font-bold">{expiredCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <GraduationCap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("hipaa.training_due_soon" as any)}</p>
              <p className="text-2xl font-bold">{dueSoonCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("hipaa.training_records" as any)}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />{t("hipaa.add_training" as any)}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("hipaa.add_training" as any)}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("hipaa.employee" as any)}</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {profiles?.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name || p.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("hipaa.training_type" as any)}</Label>
                    <Select value={form.training_type} onValueChange={v => setForm({ ...form, training_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRAINING_TYPES.map(tt => <SelectItem key={tt.value} value={tt.value}>{tt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("hipaa.training_date" as any)}</Label>
                    <Input type="date" value={form.training_date} onChange={e => setForm({ ...form, training_date: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("hipaa.trainer_name" as any)}</Label>
                  <Input value={form.trainer_name} onChange={e => setForm({ ...form, trainer_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.notes" as any)}</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel" as any)}</Button>
                  <Button type="submit" disabled={createTraining.isPending}>
                    {createTraining.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
          ) : !records?.length ? (
            <p className="text-center text-muted-foreground py-8">{t("hipaa.no_training_records" as any)}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hipaa.employee" as any)}</TableHead>
                  <TableHead>{t("hipaa.training_type" as any)}</TableHead>
                  <TableHead>{t("hipaa.training_date" as any)}</TableHead>
                  <TableHead>{t("hipaa.expiry_date" as any)}</TableHead>
                  <TableHead>{t("hipaa.trainer_name" as any)}</TableHead>
                  <TableHead>{t("common.status" as any)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{getProfileName(r.employee_id)}</TableCell>
                    <TableCell className="capitalize">{r.training_type.replace("_", " ")}</TableCell>
                    <TableCell>{format(new Date(r.training_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{r.expiry_date ? format(new Date(r.expiry_date), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell>{r.trainer_name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(r)}</TableCell>
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
