import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles } from "lucide-react";
import { useSurgeonFeeTemplates, SurgeonFeeTemplate } from "@/hooks/useSurgeonFeeTemplates";

interface SurgeonTemplateSelectorProps {
  surgeonId: string | undefined;
  selectedTemplateId: string | undefined;
  onSelect: (template: SurgeonFeeTemplate | null) => void;
  disabled?: boolean;
}

export function SurgeonTemplateSelector({
  surgeonId,
  selectedTemplateId,
  onSelect,
  disabled = false,
}: SurgeonTemplateSelectorProps) {
  const { data: templates, isLoading } = useSurgeonFeeTemplates(surgeonId);

  const availableTemplates = useMemo(() => {
    return templates || [];
  }, [templates]);

  const handleSelect = (value: string) => {
    if (value === "none") {
      onSelect(null);
      return;
    }
    const template = availableTemplates.find((t) => t.id === value);
    if (template) {
      onSelect(template);
    }
  };

  if (!surgeonId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm">Apply Fee Template</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (availableTemplates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Apply Fee Template (Optional)
      </Label>
      <Select
        value={selectedTemplateId || "none"}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a template or enter manually" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Enter charges manually</span>
          </SelectItem>
          {availableTemplates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{template.procedure_name}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  Rs. {template.total_package.toLocaleString()}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedTemplateId && (
        <p className="text-xs text-muted-foreground">
          Template applied. You can still adjust individual charges below.
        </p>
      )}
    </div>
  );
}
