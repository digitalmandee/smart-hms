import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useSaveChecklist, type SurgicalSafetyChecklist } from "@/hooks/useOT";

interface WHOChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surgeryId: string;
  checklist?: SurgicalSafetyChecklist | null;
  readOnly?: boolean;
}

const signInItems = [
  { key: "patient_identity", label: "Patient identity confirmed" },
  { key: "site_marked", label: "Surgical site marked" },
  { key: "consent_completed", label: "Consent completed" },
  { key: "anesthesia_check", label: "Anesthesia safety check complete" },
  { key: "pulse_oximeter", label: "Pulse oximeter functioning" },
  { key: "allergies_checked", label: "Known allergies checked" },
  { key: "airway_risk", label: "Difficult airway/aspiration risk assessed" },
  { key: "blood_loss_risk", label: "Risk of blood loss assessed" },
];

const timeOutItems = [
  { key: "team_introduced", label: "All team members introduced" },
  { key: "patient_confirmed", label: "Patient, site, procedure confirmed" },
  { key: "antibiotic_given", label: "Antibiotic prophylaxis given (if applicable)" },
  { key: "imaging_displayed", label: "Essential imaging displayed" },
  { key: "critical_events", label: "Anticipated critical events discussed" },
  { key: "equipment_issues", label: "Equipment issues addressed" },
];

const signOutItems = [
  { key: "procedure_recorded", label: "Procedure recorded correctly" },
  { key: "counts_correct", label: "Instrument, sponge, needle counts correct" },
  { key: "specimen_labeled", label: "Specimen labeled (if applicable)" },
  { key: "equipment_problems", label: "Equipment problems addressed" },
  { key: "recovery_concerns", label: "Key recovery concerns communicated" },
];

export function WHOChecklistModal({ open, onOpenChange, surgeryId, checklist, readOnly = false }: WHOChecklistModalProps) {
  const saveChecklist = useSaveChecklist();
  
  const [signInData, setSignInData] = useState<Record<string, boolean>>(
    (checklist?.sign_in_data as Record<string, boolean>) || {}
  );
  const [timeOutData, setTimeOutData] = useState<Record<string, boolean>>(
    (checklist?.time_out_data as Record<string, boolean>) || {}
  );
  const [signOutData, setSignOutData] = useState<Record<string, boolean>>(
    (checklist?.sign_out_data as Record<string, boolean>) || {}
  );

  const handleSavePhase = async (phase: 'sign_in' | 'time_out' | 'sign_out') => {
    const data = phase === 'sign_in' ? signInData : phase === 'time_out' ? timeOutData : signOutData;
    await saveChecklist.mutateAsync({ surgeryId, phase, data });
  };

  const getPhaseStatus = (phase: 'sign_in' | 'time_out' | 'sign_out') => {
    if (phase === 'sign_in' && checklist?.sign_in_completed) return 'completed';
    if (phase === 'time_out' && checklist?.time_out_completed) return 'completed';
    if (phase === 'sign_out' && checklist?.sign_out_completed) return 'completed';
    return 'pending';
  };

  const renderChecklistItems = (
    items: { key: string; label: string }[],
    data: Record<string, boolean>,
    setData: (data: Record<string, boolean>) => void,
    isCompleted: boolean
  ) => (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center space-x-3">
          <Checkbox
            id={item.key}
            checked={data[item.key] || false}
            disabled={isCompleted || readOnly}
            onCheckedChange={(checked) => 
              setData({ ...data, [item.key]: checked as boolean })
            }
          />
          <Label 
            htmlFor={item.key} 
            className={(isCompleted || readOnly) ? "text-muted-foreground" : ""}
          >
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            WHO Surgical Safety Checklist
          </DialogTitle>
          <DialogDescription>
            Complete all three phases for patient safety
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sign_in" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sign_in" className="gap-2">
              {getPhaseStatus('sign_in') === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Sign In
            </TabsTrigger>
            <TabsTrigger value="time_out" className="gap-2">
              {getPhaseStatus('time_out') === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Time Out
            </TabsTrigger>
            <TabsTrigger value="sign_out" className="gap-2">
              {getPhaseStatus('sign_out') === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Sign Out
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sign_in" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Before Induction of Anesthesia</CardTitle>
                  {checklist?.sign_in_completed && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderChecklistItems(
                  signInItems, 
                  signInData, 
                  setSignInData, 
                  !!checklist?.sign_in_completed
                )}
                {!checklist?.sign_in_completed && !readOnly && (
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => handleSavePhase('sign_in')}
                    disabled={saveChecklist.isPending}
                  >
                    Complete Sign In
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time_out" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Before Skin Incision</CardTitle>
                  {checklist?.time_out_completed && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderChecklistItems(
                  timeOutItems, 
                  timeOutData, 
                  setTimeOutData, 
                  !!checklist?.time_out_completed
                )}
                {!checklist?.time_out_completed && !readOnly && (
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => handleSavePhase('time_out')}
                    disabled={saveChecklist.isPending || !checklist?.sign_in_completed}
                  >
                    Complete Time Out
                  </Button>
                )}
                {!checklist?.sign_in_completed && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete Sign In first
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sign_out" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Before Patient Leaves OR</CardTitle>
                  {checklist?.sign_out_completed && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderChecklistItems(
                  signOutItems, 
                  signOutData, 
                  setSignOutData, 
                  !!checklist?.sign_out_completed
                )}
                {!checklist?.sign_out_completed && !readOnly && (
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => handleSavePhase('sign_out')}
                    disabled={saveChecklist.isPending || !checklist?.time_out_completed}
                  >
                    Complete Sign Out
                  </Button>
                )}
                {!checklist?.time_out_completed && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete Time Out first
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
