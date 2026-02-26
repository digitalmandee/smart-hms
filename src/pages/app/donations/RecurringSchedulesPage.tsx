import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { useRecurringSchedules } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { format, isPast, isToday, addDays } from "date-fns";

export default function RecurringSchedulesPage() {
  const t = useTranslation();
  const { data: schedules, isLoading } = useRecurringSchedules();

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
    overdue: "destructive",
    due_today: "default",
    upcoming: "secondary",
    active: "outline",
    inactive: "secondary",
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
