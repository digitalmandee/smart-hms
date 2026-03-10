import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Shield, Clock } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";

const FINANCIAL_ENTITIES = [
  "journal_entry", "invoice", "payment", "credit_note", "expense",
  "vendor_payment", "patient_deposit", "payroll_run", "bank_transaction",
  "fixed_asset", "budget", "billing_session",
];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  approve: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  reverse: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  post: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
};

export default function FinancialAuditLogPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [daysBack, setDaysBack] = useState("30");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["financial-audit-logs", profile?.organization_id, entityFilter, daysBack],
    queryFn: async () => {
      const fromDate = subDays(new Date(), parseInt(daysBack)).toISOString();

      let query = supabase
        .from("audit_logs")
        .select(`
          id, action, entity_type, entity_id, old_values, new_values,
          created_at, ip_address, user_agent,
          user:profiles!audit_logs_user_id_fkey(id, first_name, last_name)
        `)
        .gte("created_at", fromDate)
        .order("created_at", { ascending: false })
        .limit(500);

      if (entityFilter !== "all") {
        query = query.eq("entity_type", entityFilter);
      } else {
        query = query.in("entity_type", FINANCIAL_ENTITIES);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredLogs = logs?.filter(log => {
    if (!search) return true;
    const s = search.toLowerCase();
    const userName = `${log.user?.first_name || ""} ${log.user?.last_name || ""}`.toLowerCase();
    return (
      log.entity_type?.toLowerCase().includes(s) ||
      log.action?.toLowerCase().includes(s) ||
      log.entity_id?.toLowerCase().includes(s) ||
      userName.includes(s)
    );
  }) || [];

  const getActionBadge = (action: string) => {
    const colorClass = ACTION_COLORS[action] || "bg-muted text-muted-foreground";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{action}</span>;
  };

  const formatEntityType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return <span className="text-muted-foreground">—</span>;

    const changes: string[] = [];
    if (newValues && typeof newValues === "object") {
      Object.keys(newValues).forEach(key => {
        if (key === "updated_at" || key === "created_at") return;
        const oldVal = oldValues?.[key];
        const newVal = newValues[key];
        if (oldVal !== newVal) {
          changes.push(`${key}: ${oldVal ?? "∅"} → ${newVal}`);
        }
      });
    }

    if (changes.length === 0) return <span className="text-muted-foreground text-xs">No field changes</span>;

    return (
      <div className="max-w-xs">
        {changes.slice(0, 3).map((c, i) => (
          <div key={i} className="text-xs text-muted-foreground truncate">{c}</div>
        ))}
        {changes.length > 3 && <div className="text-xs text-muted-foreground">+{changes.length - 3} more</div>}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Financial Audit Log"
        description="Track all financial transaction modifications for compliance"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Audit Log" },
        ]}
      />

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by entity, action, user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Financial</SelectItem>
                  {FINANCIAL_ENTITIES.map(e => (
                    <SelectItem key={e} value={e}>{formatEntityType(e)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={daysBack} onValueChange={setDaysBack}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredLogs.map(l => l.user?.id).filter(Boolean)).size}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Entity Types</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredLogs.map(l => l.entity_type)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Showing {filteredLogs.length} financial audit events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(parseISO(log.created_at), "dd MMM yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.user ? `${log.user.first_name} ${log.user.last_name}` : "System"}
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatEntityType(log.entity_type)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {log.entity_id?.substring(0, 8) || "—"}
                        </TableCell>
                        <TableCell>{renderChanges(log.old_values, log.new_values)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No audit log entries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
