import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePutAwayTask, useCompletePutAway } from "@/hooks/usePutAwayTasks";
import { useWarehouseBins } from "@/hooks/useWarehouseBins";
import { InlineBarcodeScannerInput } from "@/components/inventory/InlineBarcodeScannerInput";
import { CheckCircle, ArrowLeft, Package, MapPin, Clock, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

function useItemDetails(itemId?: string | null) {
  return useQuery({
    queryKey: ["inventory-item-detail", itemId],
    queryFn: async () => {
      const { data, error } = await queryTable("inventory_items")
        .select("id, name, item_code, barcode, batch_number, unit")
        .eq("id", itemId!)
        .single();
      if (error) throw error;
      return data as { id: string; name: string; item_code: string; barcode: string | null; batch_number: string | null; unit: string | null };
    },
    enabled: !!itemId,
  });
}

export default function PutAwayTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading } = usePutAwayTask(id);
  const { data: bins } = useWarehouseBins(task?.store_id);
  const { data: itemDetails } = useItemDetails(task?.item_id);
  const completePutAway = useCompletePutAway();
  const [selectedBin, setSelectedBin] = useState("");
  const [notes, setNotes] = useState("");

  const handleScanBin = useCallback((code: string) => {
    const matchedBin = bins?.find((b) => b.bin_code === code && b.is_active);
    if (matchedBin) {
      setSelectedBin(matchedBin.id);
      toast.success(`Bin matched: ${matchedBin.bin_code}`);
    } else {
      toast.error(`No active bin found with code: ${code}`);
    }
  }, [bins]);

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;
  if (!task) return <div className="p-6"><p className="text-muted-foreground">Task not found.</p></div>;

  const handleComplete = async () => {
    await completePutAway.mutateAsync({ id: task.id, actual_bin_id: selectedBin, notes: notes || undefined });
    navigate("/app/inventory/putaway");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Put-Away Task"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Put-Away", href: "/app/inventory/putaway" }, { label: "Task" }]}
        actions={<Button variant="outline" onClick={() => navigate("/app/inventory/putaway")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
      />

      {/* Item Details Card */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Item Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Item Name</p>
              <p className="font-medium">{itemDetails?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Item Code</p>
              <p className="font-mono">{itemDetails?.item_code || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Barcode</p>
              <p className="font-mono">{itemDetails?.barcode || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch</p>
              <p className="font-mono">{itemDetails?.batch_number || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Details */}
        <Card>
          <CardHeader><CardTitle>Task Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={statusColors[task.status] || ""}>{task.status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant={task.priority >= 3 ? "destructive" : "outline"}>{task.priority}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{task.quantity} {itemDetails?.unit || ""}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Suggested Bin</span>
              <span className="font-mono flex items-center gap-1"><MapPin className="h-3 w-3" />{task.suggested_bin?.bin_code || "None"}</span>
            </div>
            {task.actual_bin && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Actual Bin</span>
                <span className="font-mono flex items-center gap-1"><MapPin className="h-3 w-3 text-green-500" />{task.actual_bin.bin_code}</span>
              </div>
            )}
            {task.grn_id && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">GRN Reference</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate(`/app/inventory/grn/${task.grn_id}`)}>
                  <LinkIcon className="h-3 w-3 mr-1" />View GRN
                </Button>
              </div>
            )}
            {task.started_at && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Started At</span>
                <span className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(task.started_at).toLocaleString()}</span>
              </div>
            )}
            {task.completed_at && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed At</span>
                <span className="text-sm flex items-center gap-1"><Clock className="h-3 w-3 text-green-500" />{new Date(task.completed_at).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Put-Away */}
        {task.status !== "completed" && (
          <Card>
            <CardHeader><CardTitle>Complete Put-Away</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Scan Bin Barcode</Label>
                <InlineBarcodeScannerInput
                  onScan={handleScanBin}
                  placeholder="Scan bin barcode to auto-select..."
                  autoFocus
                />
              </div>
              <div>
                <Label>Or Select Bin Manually</Label>
                <Select value={selectedBin} onValueChange={setSelectedBin}>
                  <SelectTrigger><SelectValue placeholder="Choose bin" /></SelectTrigger>
                  <SelectContent>{bins?.filter((b) => b.is_active).map((b) => <SelectItem key={b.id} value={b.id}>{b.bin_code} ({b.zone?.zone_code || "No zone"})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." /></div>
              <Button onClick={handleComplete} disabled={!selectedBin || completePutAway.isPending} className="w-full"><CheckCircle className="h-4 w-4 mr-2" />Mark Complete</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
