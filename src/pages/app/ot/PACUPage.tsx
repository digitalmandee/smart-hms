import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PACUPatientCard } from "@/components/ot/PACUPatientCard";
import { PACUDischargeDialog } from "@/components/ot/PACUDischargeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartPulse, RefreshCw, Users } from "lucide-react";
import { usePACUPatients, useDischargeFromPACU, type PostOpRecovery } from "@/hooks/useOT";
import { toast } from "sonner";

export default function PACUPage() {
  const navigate = useNavigate();
  
  const { data: patients, isLoading, refetch } = usePACUPatients();
  const dischargeFromPACU = useDischargeFromPACU();

  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PostOpRecovery | null>(null);

  const handleRefresh = () => {
    refetch();
    toast.success("PACU board refreshed");
  };

  const handleDischargeClick = (patient: PostOpRecovery) => {
    setSelectedPatient(patient);
    setShowDischargeDialog(true);
  };

  const handleDischarge = async (data: {
    destination: string;
    notes: string;
    aldreteScore?: number;
  }) => {
    if (!selectedPatient) return;

    const surgery = (selectedPatient as any).surgery;
    
    await dischargeFromPACU.mutateAsync({
      id: selectedPatient.id,
      surgeryId: surgery.id,
      destination: data.destination,
      notes: data.notes,
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

      {/* Enhanced Discharge Dialog */}
      <PACUDischargeDialog
        open={showDischargeDialog}
        onOpenChange={setShowDischargeDialog}
        patient={selectedPatient}
        onDischarge={handleDischarge}
        isLoading={dischargeFromPACU.isPending}
      />
    </div>
  );
}
