import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BedPicker } from "./BedPicker";
import { useBeds } from "@/hooks/useIPD";
import { useIPDBedTypeRates, getBedDailyRate } from "@/hooks/useIPDBedTypeRates";

export interface IPDBedSelection {
  wardId: string;
  bedId: string;
  bedNumber?: string;
  bedType?: string;
  wardName?: string;
  dailyRate?: number;
}

interface IPDBedPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selection: IPDBedSelection) => void;
}

export function IPDBedPickerDialog({
  open,
  onOpenChange,
  onConfirm,
}: IPDBedPickerDialogProps) {
  const [selectedBed, setSelectedBed] = useState<{ wardId?: string; bedId?: string }>({});
  
  const { data: beds } = useBeds(selectedBed.wardId);
  const { data: bedTypeRates } = useIPDBedTypeRates();

  const selectedBedData = beds?.find((b: { id: string }) => b.id === selectedBed.bedId);

  const handleConfirm = () => {
    if (!selectedBed.wardId || !selectedBed.bedId || !selectedBedData) return;

    const dailyRate = getBedDailyRate(selectedBedData.bed_type, bedTypeRates);

    onConfirm({
      wardId: selectedBed.wardId,
      bedId: selectedBed.bedId,
      bedNumber: selectedBedData.bed_number,
      bedType: selectedBedData.bed_type,
      wardName: selectedBedData.ward?.name,
      dailyRate,
    });
    
    onOpenChange(false);
    setSelectedBed({});
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedBed({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Available Bed</DialogTitle>
        </DialogHeader>

        <BedPicker
          value={selectedBed}
          onChange={(value) => setSelectedBed(value)}
          showOnlyAvailable={true}
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedBed.wardId || !selectedBed.bedId}
          >
            Select Bed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
