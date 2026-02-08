import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSpecializations } from "@/hooks/useConfiguration";
import { useAssignSpecializations, OPDDepartment } from "@/hooks/useOPDDepartments";
import { Loader2, Save, Stethoscope } from "lucide-react";

interface OPDDepartmentSpecializationsProps {
  department: OPDDepartment;
  onSuccess?: () => void;
}

export function OPDDepartmentSpecializations({
  department,
  onSuccess,
}: OPDDepartmentSpecializationsProps) {
  const { data: allSpecializations, isLoading: loadingSpecs } = useSpecializations();
  const assignSpecializations = useAssignSpecializations();

  // Get current assigned specialization IDs
  const currentSpecIds = department.specializations?.map((s) => s.specialization_id) || [];
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSpecIds);

  // Update selected when department changes
  useEffect(() => {
    setSelectedIds(department.specializations?.map((s) => s.specialization_id) || []);
  }, [department]);

  const handleToggle = (specId: string) => {
    setSelectedIds((prev) =>
      prev.includes(specId)
        ? prev.filter((id) => id !== specId)
        : [...prev, specId]
    );
  };

  const handleSave = async () => {
    try {
      await assignSpecializations.mutateAsync({
        opdDepartmentId: department.id,
        specializationIds: selectedIds,
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const hasChanges = JSON.stringify(selectedIds.sort()) !== JSON.stringify(currentSpecIds.sort());

  if (loadingSpecs) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: department.color || "#3b82f6" }}
            />
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <CardDescription>
                Assign specializations to this OPD department
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {department.code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allSpecializations?.map((spec) => {
            const isSelected = selectedIds.includes(spec.id);
            return (
              <div
                key={spec.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                onClick={() => handleToggle(spec.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(spec.id)}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Label className="cursor-pointer truncate">{spec.name}</Label>
                </div>
              </div>
            );
          })}
        </div>

        {allSpecializations?.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No specializations configured. Add specializations in Settings first.
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} specialization(s) selected
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || assignSpecializations.isPending}
          >
            {assignSpecializations.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
