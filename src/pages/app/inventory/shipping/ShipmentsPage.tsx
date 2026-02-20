import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useShipments } from "@/hooks/useShipments";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "picked_up", "in_transit", "delivered", "returned", "cancelled"];

export default function ShipmentsPage() {
  const [storeId, setStoreId] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();
  const { data: shipments, isLoading } = useShipments(storeId, status);

  return (
    <div className="p-6">
      <PageHeader title="Shipments" description="Manage outbound shipments and deliveries"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Shipments" }]}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent></Select>
            <Button onClick={() => navigate("/app/inventory/shipping/new")}><Plus className="h-4 w-4 mr-2" />New Shipment</Button>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>Shipments {shipments?.length ? `(${shipments.length})` : ""}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Carrier</TableHead><TableHead>Method</TableHead><TableHead>Tracking</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-[80px]">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {shipments?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.shipment_number}</TableCell>
                    <TableCell>{s.carrier_name || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{s.shipping_method}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{s.tracking_number || "—"}</TableCell>
                    <TableCell><Badge>{s.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => navigate(`/app/inventory/shipping/${s.id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {!shipments?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No shipments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
