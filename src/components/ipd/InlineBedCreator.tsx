import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCreateBed, BED_TYPES } from "@/hooks/useIPD";
import { BedSingle, Loader2 } from "lucide-react";

interface InlineBedCreatorProps {
  wardId: string;
  row: number;
  col: number;
  suggestedBedNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  children: React.ReactNode;
}

export const InlineBedCreator = ({
  wardId,
  row,
  col,
  suggestedBedNumber,
  open,
  onOpenChange,
  onSuccess,
  children,
}: InlineBedCreatorProps) => {
  const [bedNumber, setBedNumber] = useState(suggestedBedNumber);
  const [bedType, setBedType] = useState("standard");
  const createBed = useCreateBed();

  const handleCreate = async () => {
    if (!bedNumber.trim()) return;

    await createBed.mutateAsync({
      ward_id: wardId,
      bed_number: bedNumber.trim(),
      bed_type: bedType,
      position_row: row,
      position_col: col,
    });

    onOpenChange(false);
    onSuccess();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !createBed.isPending) {
      handleCreate();
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BedSingle className="h-4 w-4" />
            Add Bed at Row {row}, Col {col}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bed-number" className="text-xs">
              Bed Number
            </Label>
            <Input
              id="bed-number"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., ICU-01"
              className="h-8"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Bed Type</Label>
            <Select value={bedType} onValueChange={setBedType}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BED_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8"
              onClick={handleCreate}
              disabled={createBed.isPending || !bedNumber.trim()}
            >
              {createBed.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Add Bed"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
