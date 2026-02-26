import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDailyClosingHistory } from "@/hooks/useDailyClosing";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export default function DailyClosingHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: closings, isLoading } = useDailyClosingHistory(days);

  const filtered = closings?.filter(
    (c) => statusFilter === "all" || c.status === statusFilter
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.closingHistory")}
        description={t("billing.closingHistoryDesc")}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/billing/daily-closing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("billing.dailyClosing")}
          </Button>
        }
      />

      <div className="flex gap-3 flex-wrap">
        <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{t("billing.last7Days")}</SelectItem>
            <SelectItem value="30">{t("billing.last30Days")}</SelectItem>
            <SelectItem value="90">{t("billing.last90Days")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="draft">{t("billing.statusDraft")}</SelectItem>
            <SelectItem value="submitted">{t("billing.statusSubmitted")}</SelectItem>
            <SelectItem value="approved">{t("billing.statusApproved")}</SelectItem>
            <SelectItem value="rejected">{t("billing.statusRejected")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("billing.noClosingsFound")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("billing.closingNumber")}</TableHead>
                  <TableHead>{t("billing.grandTotal")}</TableHead>
                  <TableHead>{t("billing.cashCollected")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("billing.closedBy")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((closing) => (
                  <TableRow key={closing.id}>
                    <TableCell className="font-medium">
                      {format(new Date(closing.closing_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {closing.closing_number}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(closing.grand_total)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(closing.total_cash_collected)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[closing.status] || ""}>
                        {closing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {closing.closed_by_profile?.full_name || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/billing/daily-closing`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
