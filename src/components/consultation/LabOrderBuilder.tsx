import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useServiceTypes } from "@/hooks/useBilling";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
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
import { TestTube, Plus, Trash2, AlertCircle } from "lucide-react";
import type { LabOrderItemInput } from "@/hooks/useLabOrders";
import { useConfigLabPanels } from "@/hooks/useClinicConfig";

const TEST_CATEGORIES = [
  { value: "blood", label: "Blood" },
  { value: "imaging", label: "Imaging" },
  { value: "pathology", label: "Pathology" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "routine", label: "Routine", color: "secondary" },
  { value: "urgent", label: "Urgent", color: "warning" },
  { value: "stat", label: "STAT", color: "destructive" },
] as const;

interface LabOrderBuilderProps {
  items: LabOrderItemInput[];
  onChange: (items: LabOrderItemInput[]) => void;
  priority: "routine" | "urgent" | "stat";
  onPriorityChange: (priority: "routine" | "urgent" | "stat") => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  readOnly?: boolean;
}

export function LabOrderBuilder({
  items,
  onChange,
  priority,
  onPriorityChange,
  notes,
  onNotesChange,
  readOnly = false,
}: LabOrderBuilderProps) {
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const { data: labPanels = [] } = useConfigLabPanels();
  const { data: serviceTypes = [] } = useServiceTypes();
  const { formatCurrency } = useCurrencyFormatter();

  // Build test list from service_types (lab category)
  const labServiceTypes = useMemo(() => 
    serviceTypes.filter(st => st.category === "lab" || st.category_info?.code === "lab"),
    [serviceTypes]
  );

  // Map service_types to LabOrderItemInput format
  const availableTests: (LabOrderItemInput & { price?: number })[] = useMemo(() =>
    labServiceTypes.map(st => ({
      service_type_id: st.id,
      test_name: st.name,
      test_category: "blood", // default category, can be changed by user
      price: st.default_price || 0,
    })),
    [labServiceTypes]
  );

  // Convert lab panels to quick panels format, mapping to service_type_id
  const quickPanels = labPanels.map(panel => ({
    name: panel.name,
    tests: panel.tests.map(t => {
      const matchingSt = labServiceTypes.find(
        st => st.name.toLowerCase() === t.test_name.toLowerCase()
      );
      return {
        ...t,
        service_type_id: matchingSt?.id,
        price: matchingSt?.default_price || 0,
      };
    }),
  }));

  const addItem = (item: LabOrderItemInput) => {
    // Avoid duplicates
    if (!items.some((i) => i.test_name === item.test_name)) {
      onChange([...items, item]);
    }
  };

  const updateItem = (index: number, updates: Partial<LabOrderItemInput>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addQuickPanel = (panel: { name: string; tests: Array<{ test_name: string; test_category: string; service_type_id?: string; price?: number }> }) => {
    const newItems = panel.tests.filter(
      (t) => !items.some((i) => i.test_name === t.test_name)
    );
    onChange([...items, ...newItems.map((t) => ({ 
      test_name: t.test_name, 
      test_category: t.test_category, 
      service_type_id: t.service_type_id, 
      instructions: "" 
    }))]);
  };

  const filteredTests = availableTests.filter((t) =>
    t.test_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="h-5 w-5" />
            Lab Orders
          </CardTitle>
          {!readOnly && (
            <Popover open={openSearch} onOpenChange={setOpenSearch}>
              <PopoverTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Test
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search tests..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          No test found. Add custom:
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (search.trim()) {
                              addItem({
                                test_name: search.trim(),
                                test_category: "other",
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
                    <CommandGroup heading="Lab Tests">
                      {filteredTests.map((test) => (
                        <CommandItem
                          key={test.test_name}
                          value={test.test_name}
                          onSelect={() => {
                            addItem({ test_name: test.test_name, test_category: test.test_category, service_type_id: test.service_type_id });
                            setSearch("");
                            setOpenSearch(false);
                          }}
                        >
                          <span className="flex-1">{test.test_name}</span>
                          {test.price ? (
                            <span className="text-xs text-muted-foreground mr-2">
                              {formatCurrency(test.price)}
                            </span>
                          ) : null}
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

        {/* Quick Panels */}
        {!readOnly && (
          <div className="space-y-2">
            <Label className="text-sm">Quick Panels</Label>
            <div className="flex flex-wrap gap-2">
              {quickPanels.map((panel) => (
                <Button
                  key={panel.name}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addQuickPanel(panel)}
                >
                  {panel.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Test Items */}
        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No lab tests ordered yet</p>
            {!readOnly && (
              <p className="text-xs mt-1">Click "Add Test" or use Quick Panels above</p>
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
                      <span className="font-medium">{item.test_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.test_category}
                      </Badge>
                    </div>
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
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={item.test_category}
                      onValueChange={(v) => updateItem(index, { test_category: v })}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Instructions</Label>
                    <Input
                      placeholder="e.g., Fasting"
                      value={item.instructions || ""}
                      onChange={(e) =>
                        updateItem(index, { instructions: e.target.value })
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
          <Label>Clinical Notes for Lab</Label>
          <Textarea
            placeholder="Additional clinical information for the lab..."
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
