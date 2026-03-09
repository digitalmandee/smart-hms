import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Scan, Plus, Trash2, AlertCircle } from "lucide-react";
import { IMAGING_MODALITIES, type ImagingModality } from "@/hooks/useImaging";

export interface ImagingOrderItemInput {
  modality: ImagingModality;
  procedure_name: string;
  clinical_indication?: string;
  body_part?: string;
}

const PRIORITY_OPTIONS = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "stat", label: "STAT" },
] as const;

const COMMON_IMAGING_PROCEDURES: ImagingOrderItemInput[] = [
  { modality: "xray", procedure_name: "Chest X-Ray (PA)", body_part: "Chest" },
  { modality: "xray", procedure_name: "Chest X-Ray (AP/Lateral)", body_part: "Chest" },
  { modality: "xray", procedure_name: "X-Ray Spine (Cervical)", body_part: "Cervical Spine" },
  { modality: "xray", procedure_name: "X-Ray Spine (Lumbar)", body_part: "Lumbar Spine" },
  { modality: "xray", procedure_name: "X-Ray Pelvis", body_part: "Pelvis" },
  { modality: "xray", procedure_name: "X-Ray Hand", body_part: "Hand" },
  { modality: "xray", procedure_name: "X-Ray Knee", body_part: "Knee" },
  { modality: "xray", procedure_name: "X-Ray Shoulder", body_part: "Shoulder" },
  { modality: "xray", procedure_name: "X-Ray Abdomen (Erect)", body_part: "Abdomen" },
  { modality: "ultrasound", procedure_name: "USG Abdomen (Complete)", body_part: "Abdomen" },
  { modality: "ultrasound", procedure_name: "USG Pelvis", body_part: "Pelvis" },
  { modality: "ultrasound", procedure_name: "USG KUB", body_part: "Kidney/Ureter/Bladder" },
  { modality: "ultrasound", procedure_name: "USG Thyroid", body_part: "Thyroid" },
  { modality: "ultrasound", procedure_name: "USG Obstetric", body_part: "Uterus" },
  { modality: "ultrasound", procedure_name: "Doppler (Lower Limb)", body_part: "Lower Limb" },
  { modality: "ct_scan", procedure_name: "CT Brain (Plain)", body_part: "Brain" },
  { modality: "ct_scan", procedure_name: "CT Brain (Contrast)", body_part: "Brain" },
  { modality: "ct_scan", procedure_name: "CT Chest (HRCT)", body_part: "Chest" },
  { modality: "ct_scan", procedure_name: "CT Abdomen & Pelvis", body_part: "Abdomen/Pelvis" },
  { modality: "ct_scan", procedure_name: "CT Angiography", body_part: "Vascular" },
  { modality: "mri", procedure_name: "MRI Brain", body_part: "Brain" },
  { modality: "mri", procedure_name: "MRI Spine (Cervical)", body_part: "Cervical Spine" },
  { modality: "mri", procedure_name: "MRI Spine (Lumbar)", body_part: "Lumbar Spine" },
  { modality: "mri", procedure_name: "MRI Knee", body_part: "Knee" },
  { modality: "mri", procedure_name: "MRI Shoulder", body_part: "Shoulder" },
  { modality: "ecg", procedure_name: "12-Lead ECG", body_part: "Heart" },
  { modality: "echo", procedure_name: "2D Echocardiography", body_part: "Heart" },
  { modality: "echo", procedure_name: "Stress Echo", body_part: "Heart" },
  { modality: "mammography", procedure_name: "Bilateral Mammography", body_part: "Breast" },
  { modality: "dexa", procedure_name: "DEXA Scan (Bone Density)", body_part: "Spine/Hip" },
];

interface RadiologyOrderBuilderProps {
  items: ImagingOrderItemInput[];
  onChange: (items: ImagingOrderItemInput[]) => void;
  priority: "routine" | "urgent" | "stat";
  onPriorityChange: (priority: "routine" | "urgent" | "stat") => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  readOnly?: boolean;
}

export function RadiologyOrderBuilder({
  items,
  onChange,
  priority,
  onPriorityChange,
  notes,
  onNotesChange,
  readOnly = false,
}: RadiologyOrderBuilderProps) {
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const addItem = (item: ImagingOrderItemInput) => {
    if (!items.some((i) => i.procedure_name === item.procedure_name)) {
      onChange([...items, item]);
    }
  };

  const updateItem = (index: number, updates: Partial<ImagingOrderItemInput>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const filteredProcedures = COMMON_IMAGING_PROCEDURES.filter((p) =>
    p.procedure_name.toLowerCase().includes(search.toLowerCase()) ||
    p.body_part?.toLowerCase().includes(search.toLowerCase()) ||
    p.modality.toLowerCase().includes(search.toLowerCase())
  );

  const getModalityLabel = (modality: ImagingModality) =>
    IMAGING_MODALITIES.find((m) => m.value === modality)?.label || modality;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scan className="h-5 w-5" />
            Imaging Orders
          </CardTitle>
          {!readOnly && (
            <Popover open={openSearch} onOpenChange={setOpenSearch}>
              <PopoverTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Study
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search imaging procedures..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          No procedure found. Add custom:
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (search.trim()) {
                              addItem({
                                modality: "other",
                                procedure_name: search.trim(),
                              });
                              setSearch("");
                              setOpenSearch(false);
                            }
                          }}
                        >
                          Add "{search}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Common Procedures">
                      {filteredProcedures.map((proc) => (
                        <CommandItem
                          key={proc.procedure_name}
                          value={proc.procedure_name}
                          onSelect={() => {
                            addItem(proc);
                            setSearch("");
                            setOpenSearch(false);
                          }}
                        >
                          <span>{proc.procedure_name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {getModalityLabel(proc.modality)}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Selection */}
        {!readOnly && (
          <div className="space-y-2">
            <Label className="text-sm">Priority</Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={priority === opt.value ? "default" : "outline"}
                  className={priority === opt.value && opt.value === "stat" ? "bg-destructive hover:bg-destructive/90" : ""}
                  onClick={() => onPriorityChange(opt.value)}
                >
                  {opt.value === "stat" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Scan className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No imaging studies ordered yet</p>
            {!readOnly && (
              <p className="text-xs mt-1">Click "Add Study" to order imaging</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-2 bg-muted/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.procedure_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getModalityLabel(item.modality)}
                      </Badge>
                    </div>
                    {item.body_part && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Body part: {item.body_part}
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Modality</Label>
                    <Select
                      value={item.modality}
                      onValueChange={(v) => updateItem(index, { modality: v as ImagingModality })}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGING_MODALITIES.map((mod) => (
                          <SelectItem key={mod.value} value={mod.value}>
                            {mod.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Clinical Indication</Label>
                    <Input
                      placeholder="e.g., Rule out fracture"
                      value={item.clinical_indication || ""}
                      onChange={(e) =>
                        updateItem(index, { clinical_indication: e.target.value })
                      }
                      className="h-8"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clinical Notes */}
        <div className="space-y-2 pt-2">
          <Label>Clinical Notes for Radiology</Label>
          <Textarea
            placeholder="Additional clinical information for the radiologist..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
