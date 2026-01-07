import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { LabOrderItem } from "@/hooks/useLabOrders";
import { TemplateField, useLabTestTemplates } from "@/hooks/useLabTestTemplates";
import { cn } from "@/lib/utils";

interface TestResultFormProps {
  item: LabOrderItem;
  onSave: (itemId: string, results: Record<string, string | number>, notes: string) => Promise<void>;
  isSaving?: boolean;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  collected: { label: "Collected", className: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
};

export function TestResultForm({ item, onSave, isSaving }: TestResultFormProps) {
  const { data: templates } = useLabTestTemplates();
  const [results, setResults] = useState<Record<string, string | number>>({});
  const [notes, setNotes] = useState("");

  // Find matching template
  const template = templates?.find((t) =>
    item.test_name.toLowerCase().includes(t.test_name.toLowerCase()) ||
    t.test_name.toLowerCase().includes(item.test_name.toLowerCase())
  );

  // Initialize from existing values
  useEffect(() => {
    if (item.result_values) {
      setResults(item.result_values as Record<string, string | number>);
    }
    if (item.result_notes) {
      setNotes(item.result_notes);
    }
  }, [item.result_values, item.result_notes]);

  const handleResultChange = (fieldName: string, value: string) => {
    setResults((prev) => ({ ...prev, [fieldName]: value }));
  };

  const isValueAbnormal = (field: TemplateField, value: string | number): boolean => {
    if (field.type === "text" || !value) return false;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return false;
    if (field.normal_min !== null && numValue < field.normal_min) return true;
    if (field.normal_max !== null && numValue > field.normal_max) return true;
    return false;
  };

  const handleSave = async () => {
    await onSave(item.id, results, notes);
  };

  const status = statusConfig[item.status] || statusConfig.pending;
  const isCompleted = item.status === "completed";

  return (
    <Card className={cn(isCompleted && "bg-muted/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {item.test_name}
            {isCompleted && <Check className="h-4 w-4 text-green-600" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{item.test_category}</Badge>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </div>
        {item.instructions && (
          <p className="text-sm text-muted-foreground mt-1">
            Instructions: {item.instructions}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template-based fields */}
        {template ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {template.fields.map((field) => {
              const value = results[field.name] || "";
              const isAbnormal = isValueAbnormal(field, value);

              return (
                <div key={field.name} className="space-y-1">
                  <Label className="text-sm">
                    {field.name}
                    {field.unit && (
                      <span className="text-muted-foreground ml-1">({field.unit})</span>
                    )}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={field.type === "text" ? "text" : "text"}
                      value={value}
                      onChange={(e) => handleResultChange(field.name, e.target.value)}
                      className={cn(
                        isAbnormal && "border-red-500 bg-red-50 text-red-900 font-medium"
                      )}
                      disabled={isCompleted}
                    />
                  </div>
                  {field.normal_min !== null && field.normal_max !== null && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {field.normal_min} - {field.normal_max}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Free-text result if no template */
          <div className="space-y-2">
            <Label>Result</Label>
            <Textarea
              value={results["result"] as string || ""}
              onChange={(e) => handleResultChange("result", e.target.value)}
              placeholder="Enter test result..."
              disabled={isCompleted}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            disabled={isCompleted}
            rows={2}
          />
        </div>

        {/* Save button */}
        {!isCompleted && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save & Complete Test
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
