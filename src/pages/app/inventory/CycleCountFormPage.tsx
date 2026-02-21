import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useWarehouseZones } from "@/hooks/useWarehouseZones";
import { useCreateCycleCount } from "@/hooks/useCycleCounts";
import { useDefaultStore } from "@/hooks/useDefaultStore";

export default function CycleCountFormPage() {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [countType, setCountType] = useState("full");
  const [notes, setNotes] = useState("");
  useDefaultStore(storeId, setStoreId, false);

  const { data: zones } = useWarehouseZones(storeId);
  const createMutation = useCreateCycleCount();

  const handleSubmit = async () => {
    if (!storeId) return;
    const result = await createMutation.mutateAsync({
      store_id: storeId,
      zone_id: zoneId || undefined,
      count_type: countType,
      notes: notes || undefined,
    });
    navigate(`/app/inventory/cycle-counts/${result.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Cycle Count" description="Create a physical inventory count session" />
      <Button variant="outline" onClick={() => navigate("/app/inventory/cycle-counts")}>
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      <Card>
        <CardHeader><CardTitle>Count Details</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div>
            <Label>Warehouse *</Label>
            <StoreSelector value={storeId} onChange={setStoreId} />
          </div>
          <div>
            <Label>Count Type</Label>
            <Select value={countType} onValueChange={setCountType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Count</SelectItem>
                <SelectItem value="zone">Zone Count</SelectItem>
                <SelectItem value="random">Random Sample</SelectItem>
                <SelectItem value="abc">ABC Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {countType === "zone" && (
            <div>
              <Label>Zone</Label>
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                <SelectContent>
                  {zones?.map((z) => (
                    <SelectItem key={z.id} value={z.id}>{z.zone_name} ({z.zone_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any instructions or notes..." />
          </div>
          <Button onClick={handleSubmit} disabled={!storeId || createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />Create Cycle Count
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
