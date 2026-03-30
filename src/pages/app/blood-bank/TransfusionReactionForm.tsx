import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateTransfusionReaction, useUpdateTransfusion, type ReactionSeverity, type TransfusionStatus } from "@/hooks/useBloodBank";

interface TransfusionReactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfusionId: string;
}

const REACTION_TYPES = [
  "Febrile non-hemolytic",
  "Allergic / Urticarial",
  "Hemolytic (Acute)",
  "Hemolytic (Delayed)",
  "Anaphylactic",
  "TRALI",
  "Bacterial contamination",
  "Circulatory overload (TACO)",
  "Other",
];

const SYMPTOM_OPTIONS = [
  "Fever", "Chills", "Rigors", "Rash / Urticaria", "Itching",
  "Dyspnea", "Hypotension", "Hypertension", "Tachycardia",
  "Nausea / Vomiting", "Back pain", "Chest pain",
  "Hemoglobinuria", "Jaundice", "Anxiety",
];

export function TransfusionReactionForm({ open, onOpenChange, transfusionId }: TransfusionReactionFormProps) {
  const createReaction = useCreateTransfusionReaction();
  const updateTransfusion = useUpdateTransfusion();

  const [reactionType, setReactionType] = useState("");
  const [severity, setSeverity] = useState<ReactionSeverity>("mild");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [actionsTaken, setActionsTaken] = useState("");
  const [medicationsGiven, setMedicationsGiven] = useState("");
  const [outcome, setOutcome] = useState("");
  const [vitals, setVitals] = useState({ bp: "", hr: "", temp: "", spo2: "" });

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSubmit = async () => {
    if (!reactionType) return;

    // Record the reaction
    await createReaction.mutateAsync({
      transfusion_id: transfusionId,
      reaction_type: reactionType,
      severity,
      symptoms: selectedSymptoms,
      vitals_at_reaction: vitals,
      actions_taken: actionsTaken || undefined,
      medications_given: medicationsGiven || undefined,
      outcome: outcome || undefined,
    });

    // Stop the transfusion
    await updateTransfusion.mutateAsync({
      id: transfusionId,
      status: 'stopped' as TransfusionStatus,
      completed_at: new Date().toISOString(),
    });

    onOpenChange(false);
  };

  const isPending = createReaction.isPending || updateTransfusion.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-destructive">⚠ Record Transfusion Reaction</DialogTitle>
          <DialogDescription>
            Document the adverse reaction. The transfusion will be stopped automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Reaction Type & Severity */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Reaction Type *</Label>
              <Select value={reactionType} onValueChange={setReactionType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {REACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as ReactionSeverity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="life_threatening">Life Threatening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label>Symptoms</Label>
            <div className="grid grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSymptoms.includes(s)}
                    onCheckedChange={() => toggleSymptom(s)}
                    id={`symptom-${s}`}
                  />
                  <label htmlFor={`symptom-${s}`} className="text-sm cursor-pointer">{s}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals at Reaction */}
          <div className="space-y-2">
            <Label>Vitals at Reaction</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="BP (e.g. 90/60)" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} />
              <Input placeholder="HR (bpm)" value={vitals.hr} onChange={(e) => setVitals({ ...vitals, hr: e.target.value })} />
              <Input placeholder="Temp (°C)" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} />
              <Input placeholder="SpO2 (%)" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} />
            </div>
          </div>

          {/* Actions & Meds */}
          <div className="space-y-2">
            <Label>Actions Taken</Label>
            <Textarea
              placeholder="e.g. Transfusion stopped, IV normal saline started, patient repositioned..."
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Medications Given</Label>
            <Textarea
              placeholder="e.g. Hydrocortisone 100mg IV, Chlorphenamine 10mg IV..."
              value={medicationsGiven}
              onChange={(e) => setMedicationsGiven(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Outcome</Label>
            <Input
              placeholder="e.g. Symptoms resolved, patient stable"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!reactionType || isPending}>
            {isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording...</>
            ) : (
              "Record Reaction & Stop Transfusion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
