import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWards, useBeds } from "@/hooks/useIPD";
import { useBedTransfer } from "@/hooks/useAdmissions";
import { ArrowRight, Bed, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSFER_REASONS = [
  "Medical necessity",
  "Patient request",
  "Isolation required",
  "Step-down care",
  "Step-up care (ICU)",
  "Room upgrade",
  "Bed maintenance",
  "Ward consolidation",
  "Other",
] as const;

const transferSchema = z.object({
  to_ward_id: z.string().min(1, "Destination ward is required"),
  to_bed_id: z.string().min(1, "Destination bed is required"),
  reason: z.string().min(1, "Transfer reason is required"),
  notes: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface BedTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admission: {
    id: string;
    admission_number: string;
    patient?: {
      first_name: string;
      last_name: string;
      patient_number: string;
    };
    ward?: {
      id: string;
      name: string;
      code: string;
    };
    bed?: {
      id: string;
      bed_number: string;
    };
  };
  onSuccess?: () => void;
}

export const BedTransferModal = ({
  open,
  onOpenChange,
  admission,
  onSuccess,
}: BedTransferModalProps) => {
  const [selectedWardId, setSelectedWardId] = useState<string>("");

  const { data: wards } = useWards();
  const { data: destinationBeds, isLoading: loadingBeds } = useBeds(selectedWardId || undefined);
  const { mutate: transferBed, isPending: isTransferring } = useBedTransfer();

  const availableBeds = destinationBeds?.filter(
    (bed: { status: string; id: string }) => 
      bed.status === "available" || bed.status === "reserved"
  ) || [];

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      to_ward_id: "",
      to_bed_id: "",
      reason: "",
      notes: "",
    },
  });

  // Reset bed selection when ward changes
  useEffect(() => {
    if (selectedWardId) {
      form.setValue("to_bed_id", "");
    }
  }, [selectedWardId, form]);

  const onSubmit = (data: TransferFormValues) => {
    transferBed(
      {
        admissionId: admission.id,
        fromBedId: admission.bed?.id,
        fromWardId: admission.ward?.id,
        toBedId: data.to_bed_id,
        toWardId: data.to_ward_id,
        reason: data.reason,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedWardId("");
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setSelectedWardId("");
    onOpenChange(false);
  };

  const selectedDestinationWard = wards?.find((w: { id: string }) => w.id === selectedWardId);
  const selectedDestinationBed = availableBeds.find(
    (b: { id: string }) => b.id === form.watch("to_bed_id")
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transfer Patient to New Bed
          </DialogTitle>
          <DialogDescription>
            Move the patient from their current bed to a new location
          </DialogDescription>
        </DialogHeader>

        {/* Current Location Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" />
            Patient Information
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Patient:</span>
              <p className="font-medium">
                {admission.patient?.first_name} {admission.patient?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {admission.patient?.patient_number}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Admission:</span>
              <p className="font-medium">{admission.admission_number}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Current Location
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Ward: {admission.ward?.name || "Not assigned"}
            </Badge>
            <Badge variant="secondary">
              Bed: {admission.bed?.bed_number || "Not assigned"}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Destination Ward */}
              <FormField
                control={form.control}
                name="to_ward_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Ward *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedWardId(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(wards || []).map((ward: { 
                          id: string; 
                          name: string; 
                          code: string;
                          beds?: Array<{ status: string }>;
                        }) => {
                          const availableCount = ward.beds?.filter(
                            (b) => b.status === "available"
                          ).length || 0;
                          return (
                            <SelectItem key={ward.id} value={ward.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{ward.name} ({ward.code})</span>
                                <Badge
                                  variant={availableCount > 0 ? "default" : "secondary"}
                                  className="ml-2"
                                >
                                  {availableCount} available
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination Bed */}
              <FormField
                control={form.control}
                name="to_bed_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Bed *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedWardId || loadingBeds}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              !selectedWardId 
                                ? "Select ward first" 
                                : loadingBeds 
                                ? "Loading..." 
                                : "Select bed"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBeds.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No available beds in this ward
                          </div>
                        ) : (
                          availableBeds.map((bed: { 
                            id: string; 
                            bed_number: string; 
                            bed_type?: string;
                            status: string;
                          }) => (
                            <SelectItem key={bed.id} value={bed.id}>
                              <div className="flex items-center gap-2">
                                <Bed className="h-4 w-4" />
                                <span>{bed.bed_number}</span>
                                {bed.bed_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {bed.bed_type}
                                  </Badge>
                                )}
                                {bed.status === "reserved" && (
                                  <Badge variant="secondary" className="text-xs">
                                    Reserved
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transfer Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Reason *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSFER_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional information about this transfer..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Preview */}
            {selectedDestinationWard && selectedDestinationBed && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Transfer Preview</p>
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{admission.ward?.name || "N/A"}</p>
                    <p className="text-primary">{admission.bed?.bed_number || "N/A"}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <p className="text-muted-foreground">To</p>
                    <p className="font-medium">{selectedDestinationWard.name}</p>
                    <p className="text-primary">{selectedDestinationBed.bed_number}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTransferring}>
                {isTransferring ? "Transferring..." : "Confirm Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
