import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trophy, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useRecordSurgeryOutcome, type SurgeryOutcome } from "@/hooks/useSurgeryConfirmation";
import { cn } from "@/lib/utils";

interface SurgeryOutcomeFormProps {
  surgeryId: string;
  surgeryNumber: string;
  currentOutcome?: SurgeryOutcome | null;
  currentNotes?: string | null;
  onSuccess?: () => void;
  className?: string;
}

const outcomeOptions: { 
  value: SurgeryOutcome; 
  label: string; 
  description: string;
  icon: typeof Trophy;
  colorClass: string;
}[] = [
  {
    value: 'successful',
    label: 'Successful',
    description: 'Surgery completed without major complications',
    icon: Trophy,
    colorClass: 'border-green-500 bg-green-50 text-green-700 data-[state=checked]:ring-green-500',
  },
  {
    value: 'failed',
    label: 'Failed / Complications',
    description: 'Surgery had significant complications or did not achieve goals',
    icon: XCircle,
    colorClass: 'border-red-500 bg-red-50 text-red-700 data-[state=checked]:ring-red-500',
  },
  {
    value: 'unknown',
    label: 'Outcome Pending',
    description: 'Outcome cannot be determined yet (e.g., awaiting pathology)',
    icon: Clock,
    colorClass: 'border-yellow-500 bg-yellow-50 text-yellow-700 data-[state=checked]:ring-yellow-500',
  },
];

export function SurgeryOutcomeForm({
  surgeryId,
  surgeryNumber,
  currentOutcome,
  currentNotes,
  onSuccess,
  className,
}: SurgeryOutcomeFormProps) {
  const [outcome, setOutcome] = useState<SurgeryOutcome | undefined>(currentOutcome || undefined);
  const [notes, setNotes] = useState(currentNotes || '');
  
  const recordOutcome = useRecordSurgeryOutcome();

  const handleSubmit = async () => {
    if (!outcome) return;
    
    await recordOutcome.mutateAsync({
      surgeryId,
      outcome,
      notes: notes.trim() || undefined,
    });
    
    onSuccess?.();
  };

  const isEditing = !!currentOutcome;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {isEditing ? 'Update Surgery Outcome' : 'Record Surgery Outcome'}
        </CardTitle>
        <CardDescription>
          Document the outcome for surgery {surgeryNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outcome Selection */}
        <div className="space-y-3">
          <Label className="text-base">Outcome</Label>
          <RadioGroup
            value={outcome}
            onValueChange={(value) => setOutcome(value as SurgeryOutcome)}
            className="grid gap-3"
          >
            {outcomeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:border-primary/50",
                    outcome === option.value && option.colorClass,
                    outcome !== option.value && "border-muted"
                  )}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="outcome-notes">
            Outcome Notes
            {outcome === 'failed' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          <Textarea
            id="outcome-notes"
            placeholder={
              outcome === 'failed'
                ? "Please describe the complications or reasons for failure..."
                : outcome === 'successful'
                ? "Any additional notes about the surgery outcome..."
                : "Notes about the pending outcome..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={cn(
              outcome === 'failed' && !notes.trim() && "border-red-300 focus-visible:ring-red-500"
            )}
          />
          {outcome === 'failed' && !notes.trim() && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Notes are required for failed outcomes
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!outcome || recordOutcome.isPending || (outcome === 'failed' && !notes.trim())}
          className="w-full"
          size="lg"
        >
          {recordOutcome.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recording...
            </>
          ) : isEditing ? (
            'Update Outcome'
          ) : (
            'Record Outcome'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
