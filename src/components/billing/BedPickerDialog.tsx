import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BedPicker } from "@/components/ipd/BedPicker";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Bed } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BedBookingData {
  bedId: string;
  wardId: string;
  startDate: Date;
  endDate: Date;
  nights: number;
}

interface BedPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: BedBookingData) => void;
  title?: string;
}

export function BedPickerDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Select Room/Bed",
}: BedPickerDialogProps) {
  const [selectedBed, setSelectedBed] = useState<{ wardId: string; bedId: string }>({ wardId: "", bedId: "" });
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1));

  const nights = differenceInDays(endDate, startDate);

  const handleConfirm = () => {
    if (!selectedBed.bedId || nights < 1) return;
    
    onConfirm({
      bedId: selectedBed.bedId,
      wardId: selectedBed.wardId,
      startDate,
      endDate,
      nights,
    });
    
    // Reset state
    setSelectedBed({ wardId: "", bedId: "" });
    setStartDate(new Date());
    setEndDate(addDays(new Date(), 1));
  };

  const isValid = selectedBed.bedId && nights >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        if (date >= endDate) {
                          setEndDate(addDays(date, 1));
                        }
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date <= startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {nights > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Booking for <span className="font-semibold text-foreground">{nights} night{nights > 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Bed Selection */}
          <div className="space-y-2">
            <Label>Select Bed</Label>
            <BedPicker
              value={selectedBed}
              onChange={setSelectedBed}
              showOnlyAvailable
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
