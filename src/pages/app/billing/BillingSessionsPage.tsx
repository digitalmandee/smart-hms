import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TranslationKey } from "@/lib/i18n/translations/en";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Plus, Eye, Calendar, Download, Printer } from "lucide-react";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import {
  useAllBranchSessions,
  CounterType,
  SessionStatus,
  BillingSession,
} from "@/hooks/useBillingSessions";
import { OpenSessionDialog } from "@/components/billing/OpenSessionDialog";
import { CloseSessionDialog } from "@/components/billing/CloseSessionDialog";

const COUNTER_LABELS: Record<CounterType, TranslationKey> = {
  reception: "billing.counterReception",
  opd: "billing.counterOpd",
  ipd: "billing.counterIpd",
  pharmacy: "billing.counterPharmacy",
  er: "billing.counterEr",
};

const SHIFT_LABELS: Record<string, TranslationKey> = {
  morning: "billing.shiftMorning",
  evening: "billing.shiftEvening",
  night: "billing.shiftNight",
};

export default function BillingSessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [counterFilter, setCounterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [closeSessionId, setCloseSessionId] = useState<string | null>(null);

  const { data: sessions, isLoading } = useAllBranchSessions({
    dateFrom,
    dateTo,
    counterType: counterFilter !== "all" ? (counterFilter as CounterType) : undefined,
    status: statusFilter !== "all" ? (statusFilter as SessionStatus) : undefined,
  });

  const statusBadge = (status: SessionStatus) => {
    const variants: Record<SessionStatus, "default" | "secondary" | "outline"> = {
      open: "default",
      closed: "secondary",
      reconciled: "outline",
    };
    const labels: Record<SessionStatus, string> = {
      open: t("billing.open"),
      closed: t("billing.closed"),
      reconciled: t("billing.reconciled"),
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // User-wise cash summary from sessions
  const cashSummary = sessions?.reduce<
    Record<string, { user: string; counter: string; shift: string; opening: number; collections: number; expected: number; actual: number | null; difference: number | null }>
  >((acc, s) => {
    const key = s.opened_by;
    if (!acc[key]) {
      acc[key] = {
        user: s.opened_by_profile?.full_name || "—",
        counter: t(COUNTER_LABELS[s.counter_type]),
        shift: s.shift ? t(SHIFT_LABELS[s.shift] ?? "billing.shiftMorning") : "—",
        opening: 0,
        collections: 0,
        expected: 0,
        actual: null,
        difference: null,
      };
    }
    acc[key].opening += s.opening_cash || 0;
    acc[key].collections += s.total_collections || 0;
    acc[key].expected += s.expected_cash || 0;
    if (s.actual_cash != null) {
      acc[key].actual = (acc[key].actual || 0) + s.actual_cash;
    }
    if (s.cash_difference != null) {
      acc[key].difference = (acc[key].difference || 0) + s.cash_difference;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.sessionsPage")}
        description={t("billing.sessionsPageDesc")}
        breadcrumbs={[
          { label: t("nav.billing"), href: "/app/billing" },
          { label: t("billing.sessionsPage") },
        ]}
        actions={
          <Button onClick={() => setShowOpenDialog(true)}>
            <Plus className="h-4 w-4" />
            {t("billing.openBillingSession")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("common.date")}</label>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("billing.counter")}</label>
          <Select value={counterFilter} onValueChange={setCounterFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {(Object.keys(COUNTER_LABELS) as CounterType[]).map((ct) => (
                <SelectItem key={ct} value={ct}>{t(COUNTER_LABELS[ct])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("common.status")}</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="open">{t("billing.open")}</SelectItem>
              <SelectItem value="closed">{t("billing.closed")}</SelectItem>
              <SelectItem value="reconciled">{t("billing.reconciled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cash Summary */}
      {cashSummary && Object.keys(cashSummary).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("billing.cashSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("billing.user")}</TableHead>
                    <TableHead>{t("billing.counter")}</TableHead>
                    <TableHead>{t("billing.shift")}</TableHead>
                    <TableHead className="text-right">{t("billing.openingCash")}</TableHead>
                    <TableHead className="text-right">{t("billing.collections")}</TableHead>
                    <TableHead className="text-right">{t("billing.expectedCash")}</TableHead>
                    <TableHead className="text-right">{t("billing.actualCash")}</TableHead>
                    <TableHead className="text-right">{t("billing.difference")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(cashSummary).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.user}</TableCell>
                      <TableCell>{row.counter}</TableCell>
                      <TableCell>{row.shift}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.opening)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.collections)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.expected)}</TableCell>
                      <TableCell className="text-right">{row.actual != null ? formatCurrency(row.actual) : "—"}</TableCell>
                      <TableCell className={`text-right font-medium ${row.difference != null && row.difference < 0 ? "text-destructive" : row.difference != null && row.difference > 0 ? "text-green-600" : ""}`}>
                        {row.difference != null ? formatCurrency(row.difference) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("billing.allSessions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("billing.sessionNumber")}</TableHead>
                    <TableHead>{t("billing.user")}</TableHead>
                    <TableHead>{t("billing.counter")}</TableHead>
                    <TableHead>{t("billing.shift")}</TableHead>
                    <TableHead className="text-right">{t("billing.openingCash")}</TableHead>
                    <TableHead className="text-right">{t("billing.collections")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("billing.openedAt")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions && sessions.length > 0 ? (
                    sessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm">{s.session_number}</TableCell>
                        <TableCell>{s.opened_by_profile?.full_name || "—"}</TableCell>
                        <TableCell>{t(COUNTER_LABELS[s.counter_type])}</TableCell>
                        <TableCell>{s.shift ? t(SHIFT_LABELS[s.shift] ?? "billing.shiftMorning") : "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.opening_cash)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.total_collections)}</TableCell>
                        <TableCell>{statusBadge(s.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(s.opened_at), "hh:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/app/billing/sessions/${s.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {s.status === "open" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCloseSessionId(s.id)}
                              >
                                {t("billing.closeSession")}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OpenSessionDialog open={showOpenDialog} onOpenChange={setShowOpenDialog} />
      {closeSessionId && (
        <CloseSessionDialog
          open={!!closeSessionId}
          onOpenChange={(open) => !open && setCloseSessionId(null)}
          sessionId={closeSessionId}
        />
      )}
    </div>
  );
}
