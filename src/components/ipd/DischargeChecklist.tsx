import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  CreditCard, 
  Pill, 
  Calendar, 
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2 
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: "clinical" | "billing" | "documentation" | "medications";
  required: boolean;
}

const defaultChecklist: ChecklistItem[] = [
  {
    id: "discharge_summary",
    label: "Discharge Summary Completed",
    description: "All sections filled and signed by attending physician",
    category: "documentation",
    required: true,
  },
  {
    id: "diagnosis_updated",
    label: "Final Diagnosis Updated",
    description: "ICD codes assigned for billing",
    category: "clinical",
    required: true,
  },
  {
    id: "medications_reconciled",
    label: "Medication Reconciliation Done",
    description: "All medications reviewed and discharge meds confirmed",
    category: "medications",
    required: true,
  },
  {
    id: "prescription_printed",
    label: "Discharge Prescription Printed",
    description: "Prescription given to patient/attendant",
    category: "medications",
    required: true,
  },
  {
    id: "billing_cleared",
    label: "Bills Cleared",
    description: "All pending bills paid or payment plan arranged",
    category: "billing",
    required: true,
  },
  {
    id: "deposit_refunded",
    label: "Deposit Refund Processed",
    description: "Excess deposit refunded to patient",
    category: "billing",
    required: false,
  },
  {
    id: "follow_up_scheduled",
    label: "Follow-up Appointment Scheduled",
    description: "OPD appointment booked with relevant department",
    category: "clinical",
    required: true,
  },
  {
    id: "instructions_explained",
    label: "Discharge Instructions Explained",
    description: "Patient/attendant understands care instructions",
    category: "clinical",
    required: true,
  },
  {
    id: "reports_handed",
    label: "Investigation Reports Handed Over",
    description: "All lab reports, imaging CDs given to patient",
    category: "documentation",
    required: true,
  },
  {
    id: "valuables_returned",
    label: "Patient Belongings Returned",
    description: "All personal belongings checked and returned",
    category: "documentation",
    required: true,
  },
  {
    id: "nursing_clearance",
    label: "Nursing Station Clearance",
    description: "Ward nurse confirms patient ready for discharge",
    category: "clinical",
    required: true,
  },
  {
    id: "bed_vacated",
    label: "Bed Marked as Vacant",
    description: "Bed status updated in system",
    category: "documentation",
    required: true,
  },
];

interface DischargeChecklistProps {
  admissionId: string;
  initialCompleted?: string[];
  onComplete?: (completed: string[]) => void;
}

export function DischargeChecklist({
  admissionId,
  initialCompleted = [],
  onComplete,
}: DischargeChecklistProps) {
  const [completed, setCompleted] = useState<string[]>(initialCompleted);

  const handleToggle = (itemId: string) => {
    const newCompleted = completed.includes(itemId)
      ? completed.filter((id) => id !== itemId)
      : [...completed, itemId];
    
    setCompleted(newCompleted);
    onComplete?.(newCompleted);
  };

  const requiredItems = defaultChecklist.filter((item) => item.required);
  const requiredCompleted = requiredItems.filter((item) => completed.includes(item.id));
  const progress = (requiredCompleted.length / requiredItems.length) * 100;
  const allRequiredComplete = requiredCompleted.length === requiredItems.length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "clinical":
        return <ClipboardCheck className="h-4 w-4" />;
      case "billing":
        return <CreditCard className="h-4 w-4" />;
      case "documentation":
        return <FileText className="h-4 w-4" />;
      case "medications":
        return <Pill className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "clinical":
        return "text-blue-600";
      case "billing":
        return "text-green-600";
      case "documentation":
        return "text-purple-600";
      case "medications":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  const groupedByCategory = defaultChecklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryLabels: Record<string, string> = {
    clinical: "Clinical",
    billing: "Billing & Finance",
    documentation: "Documentation",
    medications: "Medications",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Discharge Checklist</CardTitle>
          <div className="flex items-center gap-2">
            {allRequiredComplete ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready for Discharge
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {requiredItems.length - requiredCompleted.length} Items Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {requiredCompleted.length} of {requiredItems.length} required items completed
            </p>
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedByCategory).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className={getCategoryColor(category)}>
                {getCategoryIcon(category)}
              </span>
              {categoryLabels[category]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={item.id}
                  checked={completed.includes(item.id)}
                  onCheckedChange={() => handleToggle(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={item.id}
                      className={`text-sm font-medium cursor-pointer ${
                        completed.includes(item.id) ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.label}
                    </label>
                    {item.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
