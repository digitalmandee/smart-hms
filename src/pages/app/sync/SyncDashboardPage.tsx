import { useMemo, useState } from "react";
import { useOfflineSync, useOutboxItems } from "@/hooks/useOfflineSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { offlineDB } from "@/lib/offline-sync/db";
import type { OutboxItem, OutboxStatus } from "@/lib/offline-sync/types";
import { ConflictDetailDialog } from "./ConflictDetailDialog";
import { RotateCw, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_TONE: Record<OutboxStatus, string> = {
  pending: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  processing: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  applied: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  conflict: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  failed: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

export default function SyncDashboardPage() {
  const { online, pending, failed, conflicts, applied, forceSync } = useOfflineSync();
  const items = useOutboxItems() ?? [];
  const [tab, setTab] = useState<OutboxStatus | "all">("all");
  const [selected, setSelected] = useState<OutboxItem | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "pending") return items.filter((i) => i.status === "pending" || i.status === "processing");
    return items.filter((i) => i.status === tab);
  }, [items, tab]);

  const handleSync = async () => {
    const r = await forceSync();
    toast({ title: "Sync triggered", description: `Processed ${r.processed} items` });
  };

  const handleRetry = async (it: OutboxItem) => {
    await offlineDB.outbox.update(it.client_uuid, { status: "pending", retries: 0, next_attempt_at: Date.now(), last_error: undefined });
    toast({ title: "Re-queued", description: it.entity_type });
  };

  const handleDelete = async (it: OutboxItem) => {
    await offlineDB.outbox.delete(it.client_uuid);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Offline sync</h1>
          <p className="text-sm text-muted-foreground">
            Queued writes from this device. {online ? "Online — syncing automatically." : "Currently offline — items will sync on reconnect."}
          </p>
        </div>
        <Button onClick={handleSync} disabled={!online}>
          <RefreshCw className="h-4 w-4 mr-2" /> Sync now
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending" value={pending} tone="text-sky-700" />
        <StatCard label="Conflicts" value={conflicts} tone="text-amber-700" />
        <StatCard label="Failed" value={failed} tone="text-rose-700" />
        <StatCard label="Applied (recent)" value={applied} tone="text-emerald-700" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outbox</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as OutboxStatus | "all")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="conflict">Conflicts</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((it) => (
                      <TableRow key={it.client_uuid}>
                        <TableCell className="font-mono text-xs">{it.entity_type}</TableCell>
                        <TableCell>{it.operation}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_TONE[it.status]}>
                            {it.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(it.client_created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{it.retries}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={it.last_error}>
                          {it.last_error}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {it.status === "conflict" && (
                            <Button size="sm" variant="outline" onClick={() => setSelected(it)}>
                              Resolve
                            </Button>
                          )}
                          {(it.status === "failed" || it.status === "conflict") && (
                            <Button size="sm" variant="ghost" onClick={() => handleRetry(it)}>
                              <RotateCw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(it)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selected && (
        <ConflictDetailDialog
          item={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-3xl font-semibold ${tone}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
