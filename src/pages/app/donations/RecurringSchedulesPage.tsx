import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarClock, AlertTriangle, Plus } from "lucide-react";
import { useRecurringSchedules, useCreateRecurringSchedule, useFinancialDonors } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { format, isPast, isToday, addDays } from "date-fns";
import { useState } from "react";

const FREQUENCIES = ["weekly", "monthly", "quarterly", "semi_annual", "annually"];
const PURPOSES = ["general", "building_fund", "equipment", "patient_welfare", "zakat", "sadaqah", "fitrana", "other"];

export default function RecurringSchedulesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { data: schedules, isLoading } = useRecurringSchedules();
  const { data: donors } = useFinancialDonors();
  const createSchedule = useCreateRecurringSchedule();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    donor_id: "", amount: "", frequency: "monthly", purpose: "general",
    start_date: new Date().toISOString().split("T")[0],
  });

  const getStatus = (nextDue: string, isActive: boolean) => {
    if (!isActive) return "inactive";
    const dueDate = new Date(nextDue);
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
    if (isToday(dueDate)) return "due_today";
    const threeDaysAhead = addDays(new Date(), 3);
    if (dueDate <= threeDaysAhead) return "upcoming";
    return "active";
  };

  const statusColor: Record<string, string> = {
    overdue: "destructive", due_today: "default", upcoming: "secondary", active: "outline", inactive: "secondary",
  };

  const handleCreate = async () => {
    if (!form.donor_id || !form.amount) return;
    await createSchedule.mutateAsync({
      organization_id: profile?.organization_id,
      donor_id: form.donor_id,
      amount: Number(form.amount),
      frequency: form.frequency,
      purpose: form.purpose,
      start_date: form.start_date,
      next_due_date: form.start_date,
      is_active: true,
      total_collected: 0,
      installments_paid: 0,
      reminder_days_before: 3,
    });
    setOpen(false);
    setForm({ donor_id: "", amount: "", frequency: "monthly", purpose: "general", start_date: new Date().toISOString().split("T")[0] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.recurringSchedules")}
        description={t("donations.recurringDesc")}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.recurringSchedules") },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{t("donations.addSchedule")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("donations.createSchedule")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("donations.selectDonor")} *</Label>
                  <Select value={form.donor_id} onValueChange={(v) => setForm({ ...form, donor_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t("donations.selectDonor")} /></SelectTrigger>
                    <SelectContent>
                      {donors?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("donations.amount")} *</Label>
                    <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("donations.frequency.monthly")}</Label>
                    <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{t(`donations.frequency.${f}` as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("donations.purposeLabel")}</Label>
                    <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PURPOSES.map((p) => <SelectItem key={p} value={p}>{t(`donations.purpose.${p}` as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("donations.startDate")}</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={createSchedule.isPending} className="w-full">
                  {t("common.save")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !schedules?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t("donations.noRecurringSchedules")}</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => {
            const status = getStatus(s.next_due_date, s.is_active);
            return (
              <Card key={s.id} className={status === "overdue" ? "border-destructive" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {status === "overdue" ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CalendarClock className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <h3 className="font-semibold">{(s as any).financial_donors?.name || "Unknown"}</h3>
                        <p className="text-sm text-muted-foreground">
                          PKR {Number(s.amount).toLocaleString()} / {t(`donations.frequency.${s.frequency}` as any)}
                          {s.purpose && ` · ${t(`donations.purpose.${s.purpose}` as any)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={statusColor[status] as any}>
                        {status === "overdue" ? t("donations.overdue") :
                         status === "due_today" ? t("donations.dueToday") :
                         status === "upcoming" ? t("donations.upcoming") :
                         status === "inactive" ? t("donations.inactive") : t("donations.active")}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {t("donations.nextDue")}: {format(new Date(s.next_due_date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span>{t("donations.collected")}: PKR {Number(s.total_collected).toLocaleString()}</span>
                    <span>{t("donations.installments")}: {s.installments_paid}</span>
                    {s.end_date && <span>{t("donations.endsOn")}: {format(new Date(s.end_date), "dd MMM yyyy")}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
