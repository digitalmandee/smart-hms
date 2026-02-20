import { useState } from "react";
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
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function PutAwayTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading } = usePutAwayTask(id);
  const { data: bins } = useWarehouseBins(task?.store_id);
  const completePutAway = useCompletePutAway();
  const [selectedBin, setSelectedBin] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;
  if (!task) return <div className="p-6"><p className="text-muted-foreground">Task not found.</p></div>;

  const handleComplete = async () => {
    await completePutAway.mutateAsync({ id: task.id, actual_bin_id: selectedBin, notes: notes || undefined });
    navigate("/app/inventory/putaway");
  };

  return (
    <div className="p-6">
      <PageHeader title="Put-Away Task"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Put-Away", href: "/app/inventory/putaway" }, { label: "Task" }]}
        actions={<Button variant="outline" onClick={() => navigate("/app/inventory/putaway")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Task Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge>{task.status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant={task.priority >= 3 ? "destructive" : "outline"}>{task.priority}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{task.quantity}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Suggested Bin</span><span className="font-mono">{task.suggested_bin?.bin_code || "None"}</span></div>
            {task.actual_bin && <div className="flex justify-between"><span className="text-muted-foreground">Actual Bin</span><span className="font-mono">{task.actual_bin.bin_code}</span></div>}
          </CardContent>
        </Card>

        {task.status !== "completed" && (
          <Card>
            <CardHeader><CardTitle>Complete Put-Away</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Actual Bin</Label>
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
