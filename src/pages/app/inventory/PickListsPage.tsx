import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePickLists } from "@/hooks/usePickingPacking";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

const STATUS_OPTIONS = ["all", "draft", "assigned", "in_progress", "completed", "cancelled"];

export default function PickListsPage() {
  const [storeId, setStoreId] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();
  const { data: lists, isLoading } = usePickLists(storeId, status);

  return (
    <div className="p-6">
      <PageHeader title="Pick Lists" description="Manage picking lists for order fulfillment"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Pick Lists" }]}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent></Select>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>Pick Lists {lists?.length ? `(${lists.length})` : ""}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Strategy</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-[80px]">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {lists?.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono">{l.pick_list_number}</TableCell>
                    <TableCell><Badge variant="outline">{l.pick_strategy}</Badge></TableCell>
                    <TableCell>{l.priority}</TableCell>
                    <TableCell><Badge>{l.status}</Badge></TableCell>
                    <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => navigate(`/app/inventory/picking/${l.id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {!lists?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No pick lists found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
