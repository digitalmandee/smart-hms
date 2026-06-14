import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogCriticalNotification } from "@/hooks/useCriticalNotifications";
import { useAuth } from "@/contexts/AuthContext";

export interface FlaggedResult {
  testName: string;
  resultValue?: string | number | null;
  unit?: string | null;
  lowCritical?: number | null;
  highCritical?: number | null;
  labOrderId?: string | null;
  labOrderItemId?: string | null;
  patientId?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  flagged: FlaggedResult;
}

export function LogCriticalCallbackDialog({ open, onOpenChange, flagged }: Props) {
  const { profile } = useAuth();
  const log = useLogCriticalNotification();

  const [severity, setSeverity] = useState<string>("critical");
  const [channel, setChannel] = useState<string>("call");
  const [toRole, setToRole] = useState<string>("doctor");
  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [resultValue, setResultValue] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setSeverity("critical");
    setChannel("call");
    setToRole("doctor");
    setToName("");
    setToPhone("");
    setResultValue(
      flagged.resultValue != null ? String(flagged.resultValue) : ""
    );
    setNotes("");
  }, [open, flagged.resultValue]);

  const handleSubmit = async () => {
    if (!toName.trim()) return;
    await log.mutateAsync({
      organization_id: profile?.organization_id ?? null,
      branch_id: (profile as { branch_id?: string } | null)?.branch_id ?? null,
      lab_order_id: flagged.labOrderId ?? null,
      lab_order_item_id: flagged.labOrderItemId ?? null,
      patient_id: flagged.patientId ?? null,
      test_name: flagged.testName,
      result_value: resultValue || null,
      unit: flagged.unit ?? null,
      low_critical: flagged.lowCritical ?? null,
      high_critical: flagged.highCritical ?? null,
      severity,
      notified_to_name: toName.trim(),
      notified_to_role: toRole,
      notified_to_phone: toPhone || null,
      notification_channel: channel,
      notes: notes || null,
      status: "notified",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log critical callback</DialogTitle>
          <DialogDescription>
            Record who was contacted about this critical/panic result and how.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="font-medium">{flagged.testName}</div>
            <div className="text-xs text-muted-foreground">
              Value: {resultValue || "—"} {flagged.unit || ""}
              {(flagged.lowCritical != null || flagged.highCritical != null) && (
                <>
                  {" "}
                  · critical ref {flagged.lowCritical ?? "?"}–
                  {flagged.highCritical ?? "?"}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="panic">Panic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone call</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="in_person">In person</SelectItem>
                  <SelectItem value="portal">Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Notified role</Label>
              <Select value={toRole} onValueChange={setToRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="ward">Ward</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Notified to (name)</Label>
              <Input
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Dr. ..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Phone (optional)</Label>
              <Input
                value={toPhone}
                onChange={(e) => setToPhone(e.target.value)}
                placeholder="+966 ..."
              />
            </div>
            <div className="space-y-1">
              <Label>Result value</Label>
              <Input
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was communicated, any orders given..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!toName.trim() || log.isPending}
            onClick={handleSubmit}
          >
            Save callback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
