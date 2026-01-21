import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CreditCard, 
  Pill, 
  Calendar, 
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2 
} from "lucide-react";
import { useDischargeChecklist, useSaveChecklistItem } from "@/hooks/useDischargeChecklist";

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
  autoCheckBilling?: boolean;
  autoCheckSummary?: boolean;
}

export function DischargeChecklist({
  admissionId,
  initialCompleted = [],
  onComplete,
  autoCheckBilling = false,
  autoCheckSummary = false,
}: DischargeChecklistProps) {
  const { data: savedItems, isLoading } = useDischargeChecklist(admissionId);
  const { mutate: saveItem } = useSaveChecklistItem();
  
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [initialized, setInitialized] = useState(false);

  // Load saved items from database
  useEffect(() => {
    if (savedItems && !initialized) {
      const completedIds = savedItems
        .filter(item => item.completed)
        .map(item => item.item_id);
      
      // Merge with initial completed and auto-checks
      const mergedCompleted = new Set([...completedIds, ...initialCompleted]);
      
      if (autoCheckBilling && !mergedCompleted.has("billing_cleared")) {
        mergedCompleted.add("billing_cleared");
      }
      if (autoCheckSummary && !mergedCompleted.has("discharge_summary")) {
        mergedCompleted.add("discharge_summary");
      }
      
      const newCompleted = Array.from(mergedCompleted);
      setCompleted(newCompleted);
      onComplete?.(newCompleted);
      setInitialized(true);
    }
  }, [savedItems, initialized, initialCompleted, autoCheckBilling, autoCheckSummary, onComplete]);

  // Auto-check items when props change
  useEffect(() => {
    if (initialized) {
      let updated = false;
      const newCompleted = [...completed];
      
      if (autoCheckBilling && !completed.includes("billing_cleared")) {
        newCompleted.push("billing_cleared");
        updated = true;
      }
      if (autoCheckSummary && !completed.includes("discharge_summary")) {
        newCompleted.push("discharge_summary");
        updated = true;
      }
      
      if (updated) {
        setCompleted(newCompleted);
        onComplete?.(newCompleted);
      }
    }
  }, [autoCheckBilling, autoCheckSummary, initialized]);

  const handleToggle = (itemId: string) => {
    const isNowCompleted = !completed.includes(itemId);
    const newCompleted = isNowCompleted
      ? [...completed, itemId]
      : completed.filter((id) => id !== itemId);
    
    setCompleted(newCompleted);
    onComplete?.(newCompleted);
    
    // Save to database
    saveItem({
      admissionId,
      itemId,
      completed: isNowCompleted,
    });
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
        return "text-info";
      case "billing":
        return "text-success";
      case "documentation":
        return "text-primary";
      case "medications":
        return "text-warning";
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Discharge Checklist</CardTitle>
          <div className="flex items-center gap-2">
            {allRequiredComplete ? (
              <Badge className="bg-success/10 text-success border-success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready for Discharge
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning border-warning">
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
