import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GripVertical, MoveUp, MoveDown } from "lucide-react";

export interface BankSheetField {
  id: string;
  key: string;
  header: string;
  enabled: boolean;
}

const DEFAULT_FIELDS: BankSheetField[] = [
  { id: "1", key: "employeeName", header: "Employee Name", enabled: true },
  { id: "2", key: "employeeNumber", header: "Employee Number", enabled: true },
  { id: "3", key: "department", header: "Department", enabled: false },
  { id: "4", key: "designation", header: "Designation", enabled: false },
  { id: "5", key: "bankName", header: "Bank Name", enabled: true },
  { id: "6", key: "branchCode", header: "Branch Code", enabled: false },
  { id: "7", key: "accountNumber", header: "Account Number", enabled: true },
  { id: "8", key: "iban", header: "IBAN", enabled: false },
  { id: "9", key: "basicSalary", header: "Basic Salary", enabled: false },
  { id: "10", key: "grossSalary", header: "Gross Salary", enabled: false },
  { id: "11", key: "deductions", header: "Deductions", enabled: false },
  { id: "12", key: "netSalary", header: "Net Salary", enabled: true },
];

const STORAGE_KEY = "bankSheetTemplateFields";

interface BankSheetTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fields: BankSheetField[]) => void;
}

export function BankSheetTemplateDialog({
  open,
  onOpenChange,
  onSave,
}: BankSheetTemplateDialogProps) {
  const [fields, setFields] = useState<BankSheetField[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFields(JSON.parse(saved));
      } catch {
        setFields(DEFAULT_FIELDS);
      }
    } else {
      setFields(DEFAULT_FIELDS);
    }
  }, [open]);

  const handleToggle = (id: string, checked: boolean) => {
    setFields(prev =>
      prev.map(f => (f.id === id ? { ...f, enabled: checked } : f))
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    onSave(fields);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFields(DEFAULT_FIELDS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Bank Sheet Template</DialogTitle>
          <DialogDescription>
            Select which fields to include in the bank sheet export and reorder them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Checkbox
                id={`field-${field.id}`}
                checked={field.enabled}
                onCheckedChange={(checked) => handleToggle(field.id, !!checked)}
              />
              <Label htmlFor={`field-${field.id}`} className="flex-1 cursor-pointer">
                {field.header}
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveField(index, "up")}
                  disabled={index === 0}
                >
                  <MoveUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveField(index, "down")}
                  disabled={index === fields.length - 1}
                >
                  <MoveDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useBankSheetTemplate() {
  const [fields, setFields] = useState<BankSheetField[]>(DEFAULT_FIELDS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFields(JSON.parse(saved));
      } catch {
        setFields(DEFAULT_FIELDS);
      }
    }
  }, []);

  return { fields, setFields, DEFAULT_FIELDS };
}
