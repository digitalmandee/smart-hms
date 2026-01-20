import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMedicines } from "@/hooks/useMedicines";
import { usePrescriptionConfig } from "@/hooks/useClinicConfig";
import { PrescriptionItemInput } from "@/hooks/usePrescriptions";
import { Pill, Plus, Trash2, Search, Copy } from "lucide-react";

interface PrescriptionBuilderProps {
  items: PrescriptionItemInput[];
  onChange: (items: PrescriptionItemInput[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  readOnly?: boolean;
}

export function PrescriptionBuilder({
  items,
  onChange,
  notes,
  onNotesChange,
  readOnly = false,
}: PrescriptionBuilderProps) {
  const [search, setSearch] = useState("");
  const [openMedicineSearch, setOpenMedicineSearch] = useState<number | null>(null);
  const { data: medicines = [] } = useMedicines(search);
  const { frequencies, durations, instructions } = usePrescriptionConfig();

  const addItem = () => {
    onChange([
      ...items,
      {
        medicine_name: "",
        dosage: "",
        frequency: "1-0-1",
        duration: "5 days",
        quantity: 1,
        instructions: "",
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<PrescriptionItemInput>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = { ...items[index] };
    onChange([...items, itemToDuplicate]);
  };

  const selectMedicine = (index: number, medicine: { id: string; name: string; strength?: string | null }) => {
    updateItem(index, {
      medicine_id: medicine.id,
      medicine_name: medicine.strength ? `${medicine.name} ${medicine.strength}` : medicine.name,
    });
    setOpenMedicineSearch(null);
    setSearch("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Prescription
          </CardTitle>
          {!readOnly && (
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Medicine
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No medicines added yet</p>
            {!readOnly && (
              <Button variant="outline" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Add First Medicine
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Medicine Name */}
                    <div className="lg:col-span-2 space-y-1">
                      <Label className="text-xs">Medicine</Label>
                      <Popover
                        open={openMedicineSearch === index}
                        onOpenChange={(open) => setOpenMedicineSearch(open ? index : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-start font-normal"
                            disabled={readOnly}
                          >
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            {item.medicine_name || "Search medicine..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search medicine..."
                              value={search}
                              onValueChange={setSearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-2 text-center">
                                  <p className="text-sm text-muted-foreground">No medicine found</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                      updateItem(index, { medicine_name: search });
                                      setOpenMedicineSearch(null);
                                      setSearch("");
                                    }}
                                  >
                                    Use "{search}" anyway
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {medicines.map((medicine) => (
                                  <CommandItem
                                    key={medicine.id}
                                    value={medicine.name}
                                    onSelect={() => selectMedicine(index, medicine)}
                                  >
                                    <div className="flex flex-col">
                                      <span>
                                        {medicine.name}
                                        {medicine.strength && (
                                          <span className="text-muted-foreground ml-1">
                                            {medicine.strength}
                                          </span>
                                        )}
                                      </span>
                                      {medicine.generic_name && (
                                        <span className="text-xs text-muted-foreground">
                                          {medicine.generic_name}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Dosage */}
                    <div className="space-y-1">
                      <Label className="text-xs">Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={item.dosage || ""}
                        onChange={(e) => updateItem(index, { dosage: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                        disabled={readOnly}
                      />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Select
                        value={item.frequency || ""}
                        onValueChange={(v) => updateItem(index, { frequency: v })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.value} - {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Select
                        value={item.duration || ""}
                        onValueChange={(v) => updateItem(index, { duration: v })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((dur) => (
                            <SelectItem key={dur.value} value={dur.value}>
                              {dur.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Instructions */}
                    <div className="lg:col-span-2 space-y-1">
                      <Label className="text-xs">Instructions</Label>
                      <Select
                        value={item.instructions || ""}
                        onValueChange={(v) => updateItem(index, { instructions: v })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select instruction" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructions.map((inst) => (
                            <SelectItem key={inst} value={inst}>
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateItem(index)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prescription Notes */}
        <div className="space-y-2 pt-2">
          <Label>Prescription Notes</Label>
          <Textarea
            placeholder="Any additional notes for the prescription..."
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
