import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCriticalNotifications,
  useAcknowledgeCriticalNotification,
  CriticalNotification,
} from "@/hooks/useCriticalNotifications";
import { format } from "date-fns";

function severityBadge(severity: string) {
  const s = (severity || "").toLowerCase();
  if (s === "panic") return <Badge variant="destructive">PANIC</Badge>;
  return <Badge variant="destructive">CRITICAL</Badge>;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "acknowledged")
    return (
      <Badge variant="default" className="bg-emerald-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Acknowledged
      </Badge>
    );
  if (s === "escalated") return <Badge variant="destructive">Escalated</Badge>;
  if (s === "notified") return <Badge variant="secondary">Notified</Badge>;
  return (
    <Badge variant="outline">
      <Clock className="mr-1 h-3 w-3" />
      Pending
    </Badge>
  );
}

export default function LabCriticalCallbackPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("open");
  const statusFilter =
    tab === "open" ? undefined : tab === "acknowledged" ? "acknowledged" : undefined;

  const { data: rows = [], isLoading } = useCriticalNotifications(statusFilter);
  const ack = useAcknowledgeCriticalNotification();

  const [ackRow, setAckRow] = useState<CriticalNotification | null>(null);
  const [ackName, setAckName] = useState("");

  const filtered = rows.filter((r) => {
    if (tab === "open") return r.status !== "acknowledged";
    if (tab === "acknowledged") return r.status === "acknowledged";
    return true;
  });

  return (
    <div className="container mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Critical-Value Callback Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Required record of who was contacted for every critical/panic lab result,
              when, and when they acknowledged it.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Callbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Test / Result</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Notified to</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-end">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                        No callbacks in this view.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">
                        {format(new Date(r.notified_at), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.test_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.result_value} {r.unit}
                          {(r.low_critical != null || r.high_critical != null) && (
                            <>
                              {" "}
                              · ref{" "}
                              {r.low_critical ?? "?"}–{r.high_critical ?? "?"}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{severityBadge(r.severity)}</TableCell>
                      <TableCell>
                        <div>{r.notified_to_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.notified_to_role || ""}
                          {r.notified_to_phone ? ` · ${r.notified_to_phone}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.notification_channel ? (
                          <span className="inline-flex items-center gap-1">
                            <PhoneCall className="h-3 w-3" />
                            {r.notification_channel}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-end">
                        {r.status !== "acknowledged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAckRow(r);
                              setAckName("");
                            }}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!ackRow} onOpenChange={(o) => !o && setAckRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge callback</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {ackRow?.test_name} — {ackRow?.result_value} {ackRow?.unit}
            </div>
            <div className="space-y-1">
              <Label>Acknowledged by (clinician name)</Label>
              <Input
                value={ackName}
                onChange={(e) => setAckName(e.target.value)}
                placeholder="Dr. ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAckRow(null)}>
              Cancel
            </Button>
            <Button
              disabled={!ackName.trim() || ack.isPending}
              onClick={async () => {
                if (!ackRow) return;
                await ack.mutateAsync({
                  id: ackRow.id,
                  acknowledged_by_name: ackName.trim(),
                });
                setAckRow(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
