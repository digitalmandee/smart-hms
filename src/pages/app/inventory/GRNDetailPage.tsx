import { useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { GRNStatusBadge } from "@/components/inventory/GRNStatusBadge";
import { PrintableGRN } from "@/components/inventory/PrintableGRN";
import { InlineBarcodeScannerInput } from "@/components/inventory/InlineBarcodeScannerInput";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Printer, Package, CheckCircle2, FileCheck, AlertCircle, RotateCcw,
  ShieldCheck, ShieldX, ShieldAlert,
} from "lucide-react";

import { useGRN, useVerifyGRN, usePostGRN } from "@/hooks/useGRN";
import { usePrint } from "@/hooks/usePrint";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function GRNDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  const { data: grn, isLoading } = useGRN(id || "");
  const verifyMutation = useVerifyGRN();
  const postMutation = usePostGRN();
  const { printRef, handlePrint } = usePrint();
  const queryClient = useQueryClient();

  const qcMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      const { error } = await (supabase as any)
        .from("grn_items")
        .update({ qc_status: status })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grn", id] });
      toast.success("QC status updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update QC status"),
  });

  const getQcBadge = (status: string) => {
    switch (status) {
      case "passed": return <Badge className="bg-emerald-600 text-white">Passed</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      case "quarantine": return <Badge className="bg-amber-500 text-white">Quarantine</Badge>;
      default: return <Badge variant="secondary">Pending QC</Badge>;
    }
  };

  const canQC = grn && ["draft", "pending_verification"].includes(grn.status);

  const handleVerify = async () => {
    if (!grn) return;
    try {
      await verifyMutation.mutateAsync(grn.id);
      toast.success("GRN verified and stock updated");
    } catch {
      // Error handled by mutation
    }
  };

  const handlePost = async () => {
    if (!grn) return;
    try {
      await postMutation.mutateAsync(grn.id);
      toast.success("GRN posted successfully");
    } catch {
      // Error handled by mutation
    }
  };

  const handleScan = useCallback(async (code: string) => {
    if (!grn?.items) return;
    // Look up item by barcode/item_code
    const { data: foundItem } = await (supabase as any)
      .from("inventory_items")
      .select("id, name, item_code, barcode")
      .or(`barcode.eq.${code},item_code.eq.${code}`)
      .limit(1)
      .maybeSingle();

    if (!foundItem) {
      toast.error("Item not found for this barcode");
      return;
    }

    const match = grn.items.find((i: any) => i.item_id === foundItem.id);
    if (!match) {
      toast.error(`"${foundItem.name}" is not in this GRN`);
      return;
    }

    setHighlightedItem(match.id);
    toast.success(`Found: ${foundItem.name} — Expected qty: ${match.quantity_received}`);
    setTimeout(() => setHighlightedItem(null), 3000);
  }, [grn]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">GRN not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/inventory/grn")}>
          Back to GRN List
        </Button>
      </div>
    );
  }

  const canVerify = grn.status === "draft";
  const canPost = grn.status === "verified";
  const totalAmount = grn.items?.reduce(
    (sum, item) => sum + (item.quantity_accepted * item.unit_cost), 0
  ) || 0;
  const totalRejected = grn.items?.reduce(
    (sum, item) => sum + (item.quantity_rejected || 0), 0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Hidden printable component */}
      <div className="hidden">
        <PrintableGRN ref={printRef} grn={grn} branding={branding} />
      </div>

      <PageHeader
        title={`GRN: ${grn.grn_number}`}
        description={`Goods received on ${format(new Date(grn.received_date), "MMMM dd, yyyy")}`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/grn")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <Button variant="outline" onClick={() => handlePrint({ title: grn.grn_number || "GRN" })}>
          <Printer className="mr-2 h-4 w-4" />Print
        </Button>
        {canVerify && (
          <Button onClick={handleVerify} disabled={verifyMutation.isPending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />Verify & Update Stock
          </Button>
        )}
        {canPost && (
          <Button onClick={handlePost} disabled={postMutation.isPending}>
            <FileCheck className="mr-2 h-4 w-4" />Post GRN
          </Button>
        )}
        {totalRejected > 0 && grn.status !== "draft" && (
          <Button variant="outline" asChild>
            <Link to={`/app/inventory/rtv/new?grn_id=${grn.id}&vendor_id=${grn.vendor_id}`}>
              <RotateCcw className="mr-2 h-4 w-4" />Create RTV ({totalRejected} rejected)
            </Link>
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <Card className={
        grn.status === "posted" ? "border-emerald-200 bg-emerald-50"
          : grn.status === "verified" ? "border-blue-200 bg-blue-50" : ""
      }>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {grn.status === "posted" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : grn.status === "verified" ? (
                <FileCheck className="h-6 w-6 text-blue-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">
                  {grn.status === "posted" ? "GRN Posted"
                    : grn.status === "verified" ? "GRN Verified - Ready to Post"
                    : "Draft GRN - Pending Verification"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {grn.status === "posted" ? "Stock has been updated and GRN is finalized"
                    : grn.status === "verified" ? "Stock updated. Click Post to finalize"
                    : "Review items and click Verify to update stock"}
                </p>
              </div>
            </div>
            <GRNStatusBadge status={grn.status} />
          </div>
        </CardContent>
      </Card>

      {/* Linked Requisition Banner */}
      {(grn as any).requisition_id && (
        <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-semibold text-indigo-900 dark:text-indigo-100">Linked Requisition</p>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    {grn.status === "verified" || grn.status === "posted"
                      ? "Goods received — requester has been notified to accept stock"
                      : "This GRN is linked to a stock requisition. Verify to notify the requester."}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/inventory/requisitions/${(grn as any).requisition_id}`}>
                  View Requisition
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GRN Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>GRN Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">GRN Number</p>
                <p className="font-medium">{grn.grn_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received Date</p>
                <p className="font-medium">{format(new Date(grn.received_date), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PO Number</p>
                {grn.purchase_order ? (
                  <Button variant="link" className="p-0 h-auto"
                    onClick={() => navigate(`/app/inventory/purchase-orders/${grn.purchase_order_id}`)}>
                    {grn.purchase_order.po_number}
                  </Button>
                ) : <p className="font-medium">—</p>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{grn.branch?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendor & Invoice</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{grn.vendor?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{grn.invoice_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Amount</p>
                <p className="font-medium">{grn.invoice_amount ? formatCurrency(grn.invoice_amount) : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-medium text-lg">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner for receiving */}
      {grn.status === "draft" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scan to Receive Items</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineBarcodeScannerInput
              onScan={handleScan}
              placeholder="Scan barcode to match against PO items..."
              autoFocus
            />
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader><CardTitle>Items Received</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="text-center">Accepted</TableHead>
                <TableHead className="text-center">Rejected</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">QC Status</TableHead>
                {canQC && <TableHead className="text-center">QC Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grn.items?.map((item) => (
                <TableRow key={item.id} className={cn(
                  highlightedItem === item.id && "bg-emerald-100 dark:bg-emerald-900/30 transition-colors duration-500"
                )}>
                  <TableCell className="font-medium">{item.item?.name || item.medicine?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-center">{item.quantity_received}</TableCell>
                  <TableCell className="text-center text-emerald-600">{item.quantity_accepted || 0}</TableCell>
                  <TableCell className="text-center">
                    {item.quantity_rejected > 0 ? (
                      <Badge variant="destructive">{item.quantity_rejected}</Badge>
                    ) : "0"}
                  </TableCell>
                  <TableCell>{item.batch_number || "—"}</TableCell>
                  <TableCell>{item.expiry_date ? format(new Date(item.expiry_date), "MMM yyyy") : "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency((item.quantity_accepted || 0) * (item.unit_cost || 0))}
                  </TableCell>
                  <TableCell className="text-center">
                    {getQcBadge((item as any).qc_status || "pending_qc")}
                  </TableCell>
                  {canQC && (
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                          onClick={() => qcMutation.mutate({ itemId: item.id, status: "passed" })}
                          disabled={qcMutation.isPending}>
                          <ShieldCheck className="h-3 w-3 mr-1" />Pass
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive"
                          onClick={() => qcMutation.mutate({ itemId: item.id, status: "failed" })}
                          disabled={qcMutation.isPending}>
                          <ShieldX className="h-3 w-3 mr-1" />Fail
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                          onClick={() => qcMutation.mutate({ itemId: item.id, status: "quarantine" })}
                          disabled={qcMutation.isPending}>
                          <ShieldAlert className="h-3 w-3 mr-1" />Quarantine
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {grn.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{grn.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
