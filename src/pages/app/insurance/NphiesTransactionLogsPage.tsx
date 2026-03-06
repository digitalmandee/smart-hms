import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, FileText, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "eligibility", label: "Eligibility" },
  { value: "submit_claim", label: "Submit Claim" },
  { value: "submit_preauth", label: "Pre-Authorization" },
  { value: "check_claim_status", label: "Status Check" },
  { value: "test_connection", label: "Test Connection" },
];

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  eligible: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  no_update: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  not_eligible: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  partially_approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default function NphiesTransactionLogsPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["nphies-transaction-logs", profile?.organization_id, actionFilter, statusFilter],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = supabase
        .from("nphies_transaction_logs" as any)
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (actionFilter && actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }
      if (statusFilter) {
        query = query.eq("response_status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredLogs = (logs || []).filter((log: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.response_status?.toLowerCase().includes(term) ||
      log.error_message?.toLowerCase().includes(term) ||
      log.claim_id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/insurance/nphies/analytics")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("nphiesTxLogs.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("nphiesTxLogs.description")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("common.loading") === "Loading..." ? "Refresh" : t("common.loading")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("nphiesTxLogs.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("nphiesTxLogs.filterAction")} />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("nphiesTxLogs.filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="not_eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("nphiesTxLogs.logsTitle")} ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("nphiesTxLogs.noLogs")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("nphiesTxLogs.action")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("nphiesTxLogs.claimId")}</TableHead>
                  <TableHead>{t("nphiesTxLogs.errorMessage")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {log.action?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[log.response_status] || "bg-gray-100 text-gray-800"}>
                        {log.response_status?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">
                      {log.claim_id ? log.claim_id.slice(0, 8) + "..." : "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.error_message || "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("nphiesTxLogs.detailTitle")}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">{t("nphiesTxLogs.action")}:</span>
                    <p className="capitalize">{selectedLog.action?.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">{t("common.status")}:</span>
                    <p>{selectedLog.response_status}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">{t("common.date")}:</span>
                    <p>{format(new Date(selectedLog.created_at), "yyyy-MM-dd HH:mm:ss")}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">{t("nphiesTxLogs.claimId")}:</span>
                    <p className="font-mono text-xs">{selectedLog.claim_id || "—"}</p>
                  </div>
                </div>
                {selectedLog.error_message && (
                  <div>
                    <span className="font-medium text-muted-foreground text-sm">{t("nphiesTxLogs.errorMessage")}:</span>
                    <p className="text-destructive text-sm mt-1">{selectedLog.error_message}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-muted-foreground text-sm">{t("nphiesTxLogs.requestPayload")}:</span>
                  <pre className="bg-muted rounded p-3 text-xs overflow-auto mt-1 max-h-[200px]">
                    {JSON.stringify(selectedLog.request_payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">{t("nphiesTxLogs.responsePayload")}:</span>
                  <pre className="bg-muted rounded p-3 text-xs overflow-auto mt-1 max-h-[200px]">
                    {JSON.stringify(selectedLog.response_payload, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
