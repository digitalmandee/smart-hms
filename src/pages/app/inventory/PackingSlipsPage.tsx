import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePackingSlips } from "@/hooks/usePickingPacking";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";

const STATUS_OPTIONS = ["all", "draft", "packed", "verified", "shipped"];

export default function PackingSlipsPage() {
  const [storeId, setStoreId] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();
  const { data: slips, isLoading } = usePackingSlips(storeId, status);

  return (
    <div className="p-6">
      <PageHeader title="Packing Slips" description="Manage packing slips for dispatch"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Packing Slips" }]}
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/app/inventory/packing/new")}><Plus className="h-4 w-4 mr-2" />New Packing Slip</Button>
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent></Select>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>Packing Slips {slips?.length ? `(${slips.length})` : ""}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Items</TableHead><TableHead>Boxes</TableHead><TableHead>Weight</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-[80px]">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {slips?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.packing_slip_number}</TableCell>
                    <TableCell>{s.total_items}</TableCell>
                    <TableCell>{s.box_count}</TableCell>
                    <TableCell>{s.total_weight ? `${s.total_weight} kg` : "—"}</TableCell>
                    <TableCell><Badge>{s.status}</Badge></TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => navigate(`/app/inventory/packing/${s.id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {!slips?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No packing slips found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
