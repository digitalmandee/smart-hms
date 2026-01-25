import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BedDouble,
  Home,
  AlertTriangle,
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";
import { PostOpDischargeInstructions } from "./PostOpDischargeInstructions";
import type { PostOpRecovery } from "@/hooks/useOT";

interface PACUDischargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PostOpRecovery | null;
  onDischarge: (data: {
    destination: string;
    notes: string;
    aldreteScore?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function PACUDischargeDialog({
  open,
  onOpenChange,
  patient,
  onDischarge,
  isLoading,
}: PACUDischargeDialogProps) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [aldreteScore, setAldreteScore] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  // Get surgery data from patient
  const surgery = (patient as any)?.surgery;
  const hasAdmission = !!surgery?.admission_id;
  const patientData = surgery?.patient;
  const patientName = patientData
    ? `${patientData.first_name || ""} ${patientData.last_name || ""}`.trim()
    : "Unknown Patient";

  // Ward/bed info would come from admission if available
  const wardInfo = surgery?.admission?.ward?.name || "Original Ward";
  const bedInfo = surgery?.admission?.bed?.bed_number || "";

  // Reset state when dialog opens
  useEffect(() => {
    if (open && patient) {
      setDestination("");
      setNotes("");
      setAldreteScore(patient.final_aldrete_score?.toString() || "");
      setShowInstructions(false);
    }
  }, [open, patient]);

  // Auto-select destination based on patient type
  useEffect(() => {
    if (open && patient && !destination) {
      if (hasAdmission) {
        setDestination("original_ward");
      } else {
        setDestination("home");
      }
    }
  }, [open, patient, hasAdmission, destination]);

  const handleDischarge = async () => {
    if (!destination) return;

    // Map internal destination values to display names
    const destinationMap: Record<string, string> = {
      original_ward: "Ward",
      ward: "Ward",
      icu: "ICU",
      hdu: "HDU",
      home: "Home (Day Surgery)",
    };

    await onDischarge({
      destination: destinationMap[destination] || destination,
      notes,
      aldreteScore: aldreteScore ? parseInt(aldreteScore) : undefined,
    });

    // Navigate based on patient type
    if (destination === "home" && !hasAdmission) {
      // Day surgery patient going home - show instructions or go to checkout
      if (surgery?.invoice_id && surgery?.invoice?.balance_amount > 0) {
        navigate(`/app/billing/invoices/${surgery.invoice_id}`);
      } else {
        setShowInstructions(true);
      }
    } else if (hasAdmission) {
      // IPD patient - go to their admission
      navigate(`/app/ipd/admissions/${surgery.admission_id}`);
    }
  };

  if (showInstructions && patient) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Discharge Instructions</DialogTitle>
            <DialogDescription>
              Print these instructions for the patient before they leave.
            </DialogDescription>
          </DialogHeader>

          <PostOpDischargeInstructions
            patientName={patientName}
            procedureName={surgery?.procedure_name || "Procedure"}
            surgeonName={
              surgery?.lead_surgeon?.profile?.full_name || "Dr. Unknown"
            }
            dischargeDate={new Date().toISOString()}
            specialInstructions={notes}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Discharge from PACU</DialogTitle>
          <DialogDescription>
            Complete discharge details for {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient Type Indicator */}
          <Card
            className={
              hasAdmission
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            }
          >
            <CardContent className="py-3">
              <div className="flex items-center gap-3">
                {hasAdmission ? (
                  <BedDouble className="h-5 w-5 text-blue-600" />
                ) : (
                  <Home className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      hasAdmission ? "text-blue-700" : "text-green-700"
                    }`}
                  >
                    {hasAdmission ? "Inpatient (IPD)" : "Day Surgery Patient"}
                  </p>
                  <p
                    className={`text-sm ${
                      hasAdmission ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    {hasAdmission
                      ? `Will return to ${wardInfo}${bedInfo ? ` - Bed ${bedInfo}` : ""}`
                      : "Will be discharged home with instructions"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Selection */}
          <div className="space-y-2">
            <Label>
              Discharge Destination <span className="text-red-500">*</span>
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {hasAdmission ? (
                  <>
                    <SelectItem value="original_ward">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span>
                          Return to Ward
                          {bedInfo ? ` (${wardInfo} - Bed ${bedInfo})` : ""}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="icu">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>Transfer to ICU</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hdu">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        <span>Transfer to HDU</span>
                      </div>
                    </SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>Home (Day Surgery)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="icu">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>Admit to ICU (Complications)</span>
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Aldrete Score */}
          <div className="space-y-2">
            <Label htmlFor="aldrete">Final Aldrete Score</Label>
            <Input
              id="aldrete"
              type="number"
              min="0"
              max="10"
              placeholder="0-10"
              value={aldreteScore}
              onChange={(e) => setAldreteScore(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Score ≥ 9 typically required for discharge
            </p>
            {aldreteScore && parseInt(aldreteScore) < 9 && (
              <Alert variant="default" className="border-yellow-300 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Aldrete score is below 9. Ensure patient meets discharge
                  criteria.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Discharge Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Discharge Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Post-discharge action indicator */}
          {destination && (
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">After discharge:</span>
                  <Badge variant="secondary">
                    {destination === "home"
                      ? "Print Discharge Instructions"
                      : hasAdmission
                        ? "Redirect to Patient's Ward View"
                        : "Complete"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDischarge} disabled={!destination || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Discharge Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
