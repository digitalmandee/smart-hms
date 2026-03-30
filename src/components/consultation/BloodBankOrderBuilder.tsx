import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Droplets } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface BloodBankOrderItem {
  component_type: string;
  units_requested: number;
  clinical_indication: string;
  hemoglobin_level: number | null;
}

const COMPONENT_TYPES = [
  { value: "whole_blood", labelKey: "blood.wholeBlood" },
  { value: "packed_rbc", labelKey: "blood.packedRBC" },
  { value: "ffp", labelKey: "blood.ffp" },
  { value: "platelets", labelKey: "blood.platelets" },
  { value: "cryoprecipitate", labelKey: "blood.cryoprecipitate" },
  { value: "granulocytes", labelKey: "blood.granulocytes" },
];

const PRIORITY_OPTIONS = [
  { value: "routine", labelKey: "blood.routine" },
  { value: "urgent", labelKey: "blood.urgent" },
  { value: "emergency", labelKey: "blood.emergency" },
];

interface BloodBankOrderBuilderProps {
  items: BloodBankOrderItem[];
  onChange: (items: BloodBankOrderItem[]) => void;
  priority: "routine" | "urgent" | "emergency";
  onPriorityChange: (p: "routine" | "urgent" | "emergency") => void;
  notes: string;
  onNotesChange: (n: string) => void;
  patientBloodGroup?: string;
}

export function BloodBankOrderBuilder({
  items,
  onChange,
  priority,
  onPriorityChange,
  notes,
  onNotesChange,
  patientBloodGroup,
}: BloodBankOrderBuilderProps) {
  const { t } = useTranslation();

  const addItem = () => {
    onChange([
      ...items,
      { component_type: "packed_rbc", units_requested: 1, clinical_indication: "", hemoglobin_level: null },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BloodBankOrderItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold">{t("blood.bloodProducts" as any, "Blood Products")}</h3>
          {patientBloodGroup && (
            <Badge variant="outline" className="font-mono">
              🩸 {patientBloodGroup}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          {t("blood.addProduct" as any, "Add Product")}
        </Button>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-3">
        <Label>{t("blood.priority" as any, "Priority")}</Label>
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey as any, opt.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Droplets className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>{t("blood.noProductsAdded" as any, "No blood products added")}</p>
          <p className="text-xs mt-1">{t("blood.clickAddProduct" as any, "Click 'Add Product' to request blood components")}</p>
        </div>
      )}

      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("blood.componentType" as any, "Component Type")}</Label>
                <Select value={item.component_type} onValueChange={(v) => updateItem(index, "component_type", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {t(ct.labelKey as any, ct.value.replace(/_/g, " "))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("blood.unitsRequired" as any, "Units Required")}</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={item.units_requested}
                  onChange={(e) => updateItem(index, "units_requested", parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("blood.hemoglobinLevel" as any, "Hemoglobin (g/dL)")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 7.5"
                  value={item.hemoglobin_level ?? ""}
                  onChange={(e) => updateItem(index, "hemoglobin_level", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("blood.clinicalIndication" as any, "Clinical Indication")}</Label>
              <Input
                placeholder={t("blood.indicationPlaceholder" as any, "e.g. Acute blood loss, Anemia")}
                value={item.clinical_indication}
                onChange={(e) => updateItem(index, "clinical_indication", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">{t("common.notes" as any, "Notes")}</Label>
          <Textarea
            placeholder={t("blood.notesPlaceholder" as any, "Additional notes for blood bank...")}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
