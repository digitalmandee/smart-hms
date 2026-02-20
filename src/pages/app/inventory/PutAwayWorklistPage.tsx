import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePutAwayTasks } from "@/hooks/usePutAwayTasks";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "in_progress", "completed", "skipped"];
const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", in_progress: "default", completed: "secondary", skipped: "destructive",
};

export default function PutAwayWorklistPage() {
  const [storeId, setStoreId] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();
  const { data: tasks, isLoading } = usePutAwayTasks(storeId, status);

  return (
    <div className="p-6">
      <PageHeader title="Put-Away Tasks" description="Pending put-away tasks from verified GRNs"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Put-Away" }]}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent></Select>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>Tasks {tasks?.length ? `(${tasks.length})` : ""}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Priority</TableHead><TableHead>Quantity</TableHead><TableHead>Suggested Bin</TableHead><TableHead>Actual Bin</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-[80px]">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {tasks?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell><Badge variant={t.priority >= 3 ? "destructive" : "outline"}>{t.priority}</Badge></TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell className="font-mono">{t.suggested_bin?.bin_code || "—"}</TableCell>
                    <TableCell className="font-mono">{t.actual_bin?.bin_code || "—"}</TableCell>
                    <TableCell><Badge variant={statusColors[t.status] || "outline"}>{t.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => navigate(`/app/inventory/putaway/${t.id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {!tasks?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No put-away tasks found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
