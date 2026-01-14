import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PACUPatientCard } from "@/components/ot/PACUPatientCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HeartPulse, 
  RefreshCw,
  Users
} from "lucide-react";
import { usePACUPatients, useUpdatePostOpRecovery, useDischargeFromPACU, type PostOpRecovery } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PACUPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: patients, isLoading, refetch } = usePACUPatients();
  const updateRecovery = useUpdatePostOpRecovery();
  const dischargeFromPACU = useDischargeFromPACU();

  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PostOpRecovery | null>(null);
  const [dischargeData, setDischargeData] = useState({
    destination: "",
    notes: "",
    aldreteScore: "",
  });

  const handleRefresh = () => {
    refetch();
    toast.success("PACU board refreshed");
  };

  const handleDischargeClick = (patient: PostOpRecovery) => {
    setSelectedPatient(patient);
    setDischargeData({
      destination: "",
      notes: "",
      aldreteScore: patient.final_aldrete_score?.toString() || "",
    });
    setShowDischargeDialog(true);
  };

  const handleDischarge = async () => {
    if (!selectedPatient || !dischargeData.destination) return;

    const surgery = (selectedPatient as any).surgery;
    
    await dischargeFromPACU.mutateAsync({
      id: selectedPatient.id,
      surgeryId: surgery.id,
      destination: dischargeData.destination,
      notes: dischargeData.notes,
    });

    setShowDischargeDialog(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="PACU - Post-Anesthesia Care Unit"
          description="Monitor and manage post-operative recovery patients"
        />
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{patients?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Patients in PACU</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : patients?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HeartPulse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Patients in PACU</h3>
            <p className="text-muted-foreground">
              Patients will appear here after surgery completion
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients?.map(patient => (
            <PACUPatientCard
              key={patient.id}
              recovery={patient}
              onViewDetails={() => {
                const surgery = (patient as any).surgery;
                if (surgery) navigate(`/app/ot/surgeries/${surgery.id}`);
              }}
              onDischarge={() => handleDischargeClick(patient)}
            />
          ))}
        </div>
      )}

      {/* Discharge Dialog */}
      <Dialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge from PACU</DialogTitle>
            <DialogDescription>
              Complete discharge details for the patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Discharge Destination *</Label>
              <Select
                value={dischargeData.destination}
                onValueChange={(value) => setDischargeData(prev => ({ ...prev, destination: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ward">Ward</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="hdu">HDU</SelectItem>
                  <SelectItem value="home">Home (Day Surgery)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aldrete">Final Aldrete Score</Label>
              <Input
                id="aldrete"
                type="number"
                min="0"
                max="10"
                placeholder="0-10"
                value={dischargeData.aldreteScore}
                onChange={(e) => setDischargeData(prev => ({ ...prev, aldreteScore: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Score ≥ 9 typically required for discharge
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Discharge Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or observations..."
                value={dischargeData.notes}
                onChange={(e) => setDischargeData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDischarge}
              disabled={!dischargeData.destination || dischargeFromPACU.isPending}
            >
              Discharge Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
