import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  Pill, 
  Package, 
  TestTube,
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface QuickActionPanelProps {
  surgeryId: string;
  onAddVital: (vital: VitalReading) => Promise<void>;
  onAddDrug: (drug: DrugLog) => Promise<void>;
  onAddSpecimen?: (specimen: SpecimenEntry) => Promise<void>;
  isLoading?: boolean;
}

interface VitalReading {
  time: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse?: number;
  spo2?: number;
  etco2?: number;
  notes?: string;
}

interface DrugLog {
  time: string;
  drug_name: string;
  dose: string;
  route: string;
  notes?: string;
}

interface SpecimenEntry {
  description: string;
  label: string;
  sendToPathology: boolean;
}

export function QuickActionPanel({
  surgeryId,
  onAddVital,
  onAddDrug,
  onAddSpecimen,
  isLoading,
}: QuickActionPanelProps) {
  const [vitalDialogOpen, setVitalDialogOpen] = useState(false);
  const [drugDialogOpen, setDrugDialogOpen] = useState(false);
  const [specimenDialogOpen, setSpecimenDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Vital form state
  const [vitalForm, setVitalForm] = useState<VitalReading>({
    time: new Date().toISOString(),
    bp_systolic: undefined,
    bp_diastolic: undefined,
    pulse: undefined,
    spo2: undefined,
    etco2: undefined,
    notes: "",
  });

  // Drug form state
  const [drugForm, setDrugForm] = useState<DrugLog>({
    time: new Date().toISOString(),
    drug_name: "",
    dose: "",
    route: "IV",
    notes: "",
  });

  // Specimen form state
  const [specimenForm, setSpecimenForm] = useState<SpecimenEntry>({
    description: "",
    label: "",
    sendToPathology: true,
  });

  const handleAddVital = async () => {
    try {
      setSubmitting(true);
      await onAddVital({ ...vitalForm, time: new Date().toISOString() });
      toast.success("Vital reading recorded");
      setVitalDialogOpen(false);
      setVitalForm({
        time: new Date().toISOString(),
        bp_systolic: undefined,
        bp_diastolic: undefined,
        pulse: undefined,
        spo2: undefined,
        etco2: undefined,
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to record vital");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDrug = async () => {
    if (!drugForm.drug_name || !drugForm.dose) {
      toast.error("Please enter drug name and dose");
      return;
    }
    try {
      setSubmitting(true);
      await onAddDrug({ ...drugForm, time: new Date().toISOString() });
      toast.success("Drug administration logged");
      setDrugDialogOpen(false);
      setDrugForm({
        time: new Date().toISOString(),
        drug_name: "",
        dose: "",
        route: "IV",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to log drug");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSpecimen = async () => {
    if (!specimenForm.description) {
      toast.error("Please enter specimen description");
      return;
    }
    if (onAddSpecimen) {
      try {
        setSubmitting(true);
        await onAddSpecimen(specimenForm);
        toast.success("Specimen logged");
        setSpecimenDialogOpen(false);
        setSpecimenForm({ description: "", label: "", sendToPathology: true });
      } catch (error) {
        toast.error("Failed to log specimen");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const actions = [
    {
      icon: Activity,
      label: "Add Vital",
      onClick: () => setVitalDialogOpen(true),
      color: "text-green-600",
    },
    {
      icon: Pill,
      label: "Log Drug",
      onClick: () => setDrugDialogOpen(true),
      color: "text-blue-600",
    },
    {
      icon: TestTube,
      label: "Add Specimen",
      onClick: () => setSpecimenDialogOpen(true),
      color: "text-purple-600",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            disabled={isLoading}
            className="gap-2"
          >
            <action.icon className={`h-4 w-4 ${action.color}`} />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Add Vital Dialog */}
      <Dialog open={vitalDialogOpen} onOpenChange={setVitalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Record Vital Signs
            </DialogTitle>
            <DialogDescription>
              Add current vital readings to the surgery record
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Systolic BP</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={vitalForm.bp_systolic || ""}
                  onChange={(e) =>
                    setVitalForm((prev) => ({
                      ...prev,
                      bp_systolic: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Diastolic BP</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={vitalForm.bp_diastolic || ""}
                  onChange={(e) =>
                    setVitalForm((prev) => ({
                      ...prev,
                      bp_diastolic: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pulse</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={vitalForm.pulse || ""}
                  onChange={(e) =>
                    setVitalForm((prev) => ({
                      ...prev,
                      pulse: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>SpO2 %</Label>
                <Input
                  type="number"
                  placeholder="98"
                  value={vitalForm.spo2 || ""}
                  onChange={(e) =>
                    setVitalForm((prev) => ({
                      ...prev,
                      spo2: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>EtCO2</Label>
                <Input
                  type="number"
                  placeholder="35"
                  value={vitalForm.etco2 || ""}
                  onChange={(e) =>
                    setVitalForm((prev) => ({
                      ...prev,
                      etco2: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any observations..."
                value={vitalForm.notes}
                onChange={(e) =>
                  setVitalForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setVitalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVital} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Vital
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Drug Dialog */}
      <Dialog open={drugDialogOpen} onOpenChange={setDrugDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              Log Drug Administration
            </DialogTitle>
            <DialogDescription>
              Record medication given during surgery
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Drug Name *</Label>
              <Input
                placeholder="e.g., Fentanyl, Propofol"
                value={drugForm.drug_name}
                onChange={(e) =>
                  setDrugForm((prev) => ({ ...prev, drug_name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dose *</Label>
                <Input
                  placeholder="e.g., 100mcg, 200mg"
                  value={drugForm.dose}
                  onChange={(e) =>
                    setDrugForm((prev) => ({ ...prev, dose: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Route</Label>
                <Input
                  placeholder="IV, IM, SC"
                  value={drugForm.route}
                  onChange={(e) =>
                    setDrugForm((prev) => ({ ...prev, route: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={drugForm.notes}
                onChange={(e) =>
                  setDrugForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrugDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDrug} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Log Drug
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Specimen Dialog */}
      <Dialog open={specimenDialogOpen} onOpenChange={setSpecimenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              Log Specimen
            </DialogTitle>
            <DialogDescription>
              Record specimen collected during surgery
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="e.g., Appendix, Gallbladder"
                value={specimenForm.description}
                onChange={(e) =>
                  setSpecimenForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder="Container label"
                value={specimenForm.label}
                onChange={(e) =>
                  setSpecimenForm((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pathology"
                checked={specimenForm.sendToPathology}
                onChange={(e) =>
                  setSpecimenForm((prev) => ({
                    ...prev,
                    sendToPathology: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="pathology">Send to Pathology</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSpecimenDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSpecimen} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Specimen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
