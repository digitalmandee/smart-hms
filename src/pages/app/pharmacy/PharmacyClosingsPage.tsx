import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePOSSessionHistory } from "@/hooks/usePOSSessions";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/currency";
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import {
  DollarSign, TrendingUp, AlertTriangle, Clock, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function PharmacyClosingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = usePOSSessionHistory();
  const [dateFilter, setDateFilter] = useState("all");

  const closedSessions = useMemo(() => {
    let filtered = sessions.filter((s) => s.status === "closed");
    if (dateFilter === "today") {
      filtered = filtered.filter((s) => isToday(parseISO(s.opened_at)));
    } else if (dateFilter === "week") {
      filtered = filtered.filter((s) => isThisWeek(parseISO(s.opened_at)));
    } else if (dateFilter === "month") {
      filtered = filtered.filter((s) => isThisMonth(parseISO(s.opened_at)));
    }
    return filtered;
  }, [sessions, dateFilter]);

  const totalRevenue = closedSessions.reduce((s, r) => s + Number(r.total_sales || 0), 0);
  const totalDifference = closedSessions.reduce((s, r) => s + Number(r.cash_difference || 0), 0);
  const avgDurationMins = closedSessions.length > 0
    ? closedSessions.reduce((s, r) => {
        if (!r.opened_at || !r.closed_at) return s;
        return s + (new Date(r.closed_at).getTime() - new Date(r.opened_at).getTime()) / 60000;
      }, 0) / closedSessions.length
    : 0;

  const exportColumns = [
    { key: "session_number", header: "Session #" },
    { key: "cashier", header: t("pos.cashier"), format: (v: any, row: any) => row?.opener?.full_name || "-" },
    { key: "opened_at", header: t("pos.openedAt"), format: (v: any) => v ? format(parseISO(v), "MMM dd, yyyy HH:mm") : "-" },
    { key: "closed_at", header: t("pos.closedAt"), format: (v: any) => v ? format(parseISO(v), "MMM dd, yyyy HH:mm") : "-" },
    { key: "opening_balance", header: t("pos.openingBalance"), format: (v: any) => formatCurrency(Number(v || 0)), align: "right" as const },
    { key: "total_sales", header: t("pharmacy.totalSales"), format: (v: any) => formatCurrency(Number(v || 0)), align: "right" as const },
    { key: "expected_cash", header: t("pos.expectedCash"), format: (v: any) => formatCurrency(Number(v || 0)), align: "right" as const },
    { key: "closing_balance", header: t("pos.closingBalance"), format: (v: any) => formatCurrency(Number(v || 0)), align: "right" as const },
    { key: "cash_difference", header: t("pos.cashDifference"), format: (v: any) => formatCurrency(Number(v || 0)), align: "right" as const },
  ];

  const summaryRow = {
    session_number: `Total: ${closedSessions.length} sessions`,
    total_sales: formatCurrency(totalRevenue),
    cash_difference: formatCurrency(totalDifference),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("pharmacy.closings")}</h1>
          <p className="text-muted-foreground">{t("pharmacy.closingsDesc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="today">{t("common.today")}</SelectItem>
              <SelectItem value="week">{t("common.thisWeek")}</SelectItem>
              <SelectItem value="month">{t("common.thisMonth")}</SelectItem>
            </SelectContent>
          </Select>
          <ReportExportButton
            data={closedSessions}
            filename="pharmacy-closings"
            columns={exportColumns}
            title={t("pharmacy.closings")}
            pdfOptions={{
              title: t("pharmacy.closings"),
              subtitle: `${dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}`,
            }}
            summaryRow={summaryRow}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("pharmacy.totalSessions")}</p>
            </div>
            <p className="text-2xl font-bold mt-1">{closedSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">{t("pharmacy.totalRevenue")}</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">{t("pharmacy.totalCashDifference")}</p>
            </div>
            <p className={`text-2xl font-bold mt-1 ${totalDifference === 0 ? "text-green-600" : "text-destructive"}`}>
              {formatCurrency(Math.abs(totalDifference))}
              {totalDifference > 0 ? " Over" : totalDifference < 0 ? " Short" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">{t("pharmacy.avgSessionDuration")}</p>
            </div>
            <p className="text-2xl font-bold mt-1">{Math.round(avgDurationMins)} min</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session #</TableHead>
                <TableHead>{t("pos.cashier")}</TableHead>
                <TableHead>{t("pos.openedAt")}</TableHead>
                <TableHead>{t("pos.closedAt")}</TableHead>
                <TableHead className="text-right">{t("pos.openingBalance")}</TableHead>
                <TableHead className="text-right">{t("pharmacy.totalSales")}</TableHead>
                <TableHead className="text-right">{t("pos.expectedCash")}</TableHead>
                <TableHead className="text-right">{t("pos.closingBalance")}</TableHead>
                <TableHead className="text-right">{t("pos.cashDifference")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : closedSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No closed sessions found
                  </TableCell>
                </TableRow>
              ) : (
                closedSessions.map((s) => {
                  const diff = Number(s.cash_difference || 0);
                  return (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/app/pharmacy/pos/sessions/${s.id}`)}
                    >
                      <TableCell className="font-mono text-sm">{s.session_number}</TableCell>
                      <TableCell>{s.opener?.full_name || "-"}</TableCell>
                      <TableCell className="text-sm">{format(parseISO(s.opened_at), "MMM dd HH:mm")}</TableCell>
                      <TableCell className="text-sm">{s.closed_at ? format(parseISO(s.closed_at), "MMM dd HH:mm") : "-"}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(Number(s.opening_balance || 0))}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">{formatCurrency(Number(s.total_sales || 0))}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(Number(s.expected_cash || 0))}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(Number(s.closing_balance || 0))}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={diff === 0 ? "default" : "destructive"}
                          className="font-mono"
                        >
                          {diff > 0 && <ArrowUp className="h-3 w-3 mr-1" />}
                          {diff < 0 && <ArrowDown className="h-3 w-3 mr-1" />}
                          {diff === 0 && <Minus className="h-3 w-3 mr-1" />}
                          {formatCurrency(Math.abs(diff))}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
