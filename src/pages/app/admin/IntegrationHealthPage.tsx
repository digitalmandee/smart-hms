import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, ShieldOff, Wifi } from "lucide-react";
import {
  useRecentClientErrors,
  useRecentEdgeErrors,
  useGatewayCircuitStates,
} from "@/hooks/useAdminMonitoring";
import { formatDistanceToNow } from "date-fns";

const KSA_GATEWAYS = [
  "nphies",
  "zatca",
  "wasfaty",
  "tatmeen",
  "nafath",
  "sehhaty",
  "hesn",
];

export default function IntegrationHealthPage() {
  const { data: clientErrors = [], isLoading: loadingClient } = useRecentClientErrors();
  const { data: edgeErrors = [], isLoading: loadingEdge } = useRecentEdgeErrors();
  const { data: circuits = [] } = useGatewayCircuitStates();

  const circuitMap = new Map(circuits.map((c) => [c.gateway, c]));
  const groupedEdge = edgeErrors.reduce<Record<string, typeof edgeErrors>>((acc, e) => {
    const key = e.integration ?? e.function_name;
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integration Health"
        description="Last 24 hours of client crashes, edge function failures, and KSA gateway circuit state."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client crashes (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingClient ? "…" : clientErrors.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(clientErrors.map((e) => e.stack_hash)).size} unique stacks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge failures (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingEdge ? "…" : edgeErrors.length}</div>
            <p className="text-xs text-muted-foreground">
              across {Object.keys(groupedEdge).length} functions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open circuits</CardTitle>
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {circuits.filter((c) => c.state === "open").length}
            </div>
            <p className="text-xs text-muted-foreground">of {KSA_GATEWAYS.length} KSA gateways</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4" /> KSA Gateway Circuit Breakers
          </CardTitle>
          <CardDescription>
            Closed = healthy. Open = upstream failed 5+ times consecutively; new calls are rejected
            until the next retry window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {KSA_GATEWAYS.map((g) => {
              const c = circuitMap.get(g);
              const state = c?.state ?? "closed";
              const variant =
                state === "open" ? "destructive" : state === "half_open" ? "secondary" : "default";
              return (
                <div
                  key={g}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium uppercase">{g}</p>
                    {c?.last_failure_at && (
                      <p className="text-xs text-muted-foreground">
                        Last failure {formatDistanceToNow(new Date(c.last_failure_at))} ago ·
                        consecutive: {c.consecutive_failures}
                      </p>
                    )}
                  </div>
                  <Badge variant={variant}>{state}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="edge">
        <TabsList>
          <TabsTrigger value="edge">Edge errors</TabsTrigger>
          <TabsTrigger value="client">Client errors</TabsTrigger>
        </TabsList>
        <TabsContent value="edge">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-start">When</th>
                      <th className="p-3 text-start">Function</th>
                      <th className="p-3 text-start">Status</th>
                      <th className="p-3 text-start">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edgeErrors.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No edge errors in the last 24 hours.</td></tr>
                    )}
                    {edgeErrors.map((e) => (
                      <tr key={e.id} className="border-t">
                        <td className="p-3 whitespace-nowrap text-muted-foreground">
                          {formatDistanceToNow(new Date(e.occurred_at))} ago
                        </td>
                        <td className="p-3 font-mono text-xs">{e.function_name}{e.integration ? ` · ${e.integration}` : ""}</td>
                        <td className="p-3"><Badge variant="outline">{e.status_code ?? "—"}</Badge></td>
                        <td className="p-3 max-w-md truncate" title={e.message}>{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="client">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-start">When</th>
                      <th className="p-3 text-start">Route</th>
                      <th className="p-3 text-start">Role</th>
                      <th className="p-3 text-start">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientErrors.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No client errors in the last 24 hours.</td></tr>
                    )}
                    {clientErrors.map((e) => (
                      <tr key={e.id} className="border-t">
                        <td className="p-3 whitespace-nowrap text-muted-foreground">
                          {formatDistanceToNow(new Date(e.occurred_at))} ago
                        </td>
                        <td className="p-3 font-mono text-xs">{e.route ?? "—"}</td>
                        <td className="p-3">{e.user_role ?? "—"}</td>
                        <td className="p-3 max-w-md truncate" title={e.message}>{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
