import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Link, AlertTriangle, Loader2 } from "lucide-react";
import { useLinkPatientToER } from "@/hooks/useEmergency";
import { useNavigate } from "react-router-dom";

interface LinkPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  erRegistrationId: string;
  onSuccess?: () => void;
}

export const LinkPatientModal = ({
  open,
  onOpenChange,
  erRegistrationId,
  onSuccess,
}: LinkPatientModalProps) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const linkMutation = useLinkPatientToER();
  const navigate = useNavigate();

  const handleLink = async () => {
    if (!selectedPatient) return;

    await linkMutation.mutateAsync({
      erRegistrationId,
      patientId: selectedPatient.id,
    });

    onOpenChange(false);
    setSelectedPatient(null);
    onSuccess?.();
  };

  const handleCreatePatient = () => {
    // Navigate to patient form with return URL
    navigate(`/app/patients/new?returnTo=/app/emergency/${erRegistrationId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Patient Record
          </DialogTitle>
          <DialogDescription>
            Search for an existing patient or create a new patient record to link with this emergency registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                A patient record must be linked before IPD admission or further processing.
              </p>
            </div>
          </div>

          <div>
            <PatientSearch
              onSelect={(patient) => setSelectedPatient(patient)}
            />
          </div>

          {selectedPatient && (
            <Card className="border-primary">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MRN: {selectedPatient.patient_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPatient(null)}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">or</span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleCreatePatient}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Patient Record
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedPatient || linkMutation.isPending}
          >
            {linkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Link Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
