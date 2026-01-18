import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCreateBed, BED_TYPES } from "@/hooks/useIPD";
import { useBulkCreateBeds } from "@/hooks/useBedManagement";
import { Plus, Grid3X3 } from "lucide-react";

const singleBedSchema = z.object({
  bed_number: z.string().min(1, "Bed number is required"),
  bed_type: z.string().optional(),
  position_row: z.coerce.number().min(1).optional(),
  position_col: z.coerce.number().min(1).optional(),
});

const bulkBedSchema = z.object({
  prefix: z.string().min(1, "Prefix is required"),
  start_number: z.coerce.number().min(1, "Start number must be at least 1"),
  count: z.coerce.number().min(1, "Must create at least 1 bed").max(50, "Maximum 50 beds at once"),
  bed_type: z.string().optional(),
  start_row: z.coerce.number().min(1).optional(),
  cols_per_row: z.coerce.number().min(1).max(10).optional(),
});

interface QuickAddBedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wardId: string;
  wardName?: string;
  onSuccess?: () => void;
}

export const QuickAddBedModal = ({
  open,
  onOpenChange,
  wardId,
  wardName,
  onSuccess,
}: QuickAddBedModalProps) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  
  const { mutate: createBed, isPending: isCreating } = useCreateBed();
  const { mutate: bulkCreateBeds, isPending: isBulkCreating } = useBulkCreateBeds();

  const singleForm = useForm({
    resolver: zodResolver(singleBedSchema),
    defaultValues: {
      bed_number: "",
      bed_type: "General",
      position_row: undefined,
      position_col: undefined,
    },
  });

  const bulkForm = useForm({
    resolver: zodResolver(bulkBedSchema),
    defaultValues: {
      prefix: "B",
      start_number: 1,
      count: 5,
      bed_type: "General",
      start_row: 1,
      cols_per_row: 4,
    },
  });

  const handleSingleSubmit = (values: z.infer<typeof singleBedSchema>) => {
    createBed(
      {
        ward_id: wardId,
        bed_number: values.bed_number,
        bed_type: values.bed_type,
        position_row: values.position_row,
        position_col: values.position_col,
      },
      {
        onSuccess: () => {
          singleForm.reset();
          onSuccess?.();
          onOpenChange(false);
        },
      }
    );
  };

  const handleBulkSubmit = (values: z.infer<typeof bulkBedSchema>) => {
    const beds = [];
    let row = values.start_row || 1;
    let col = 1;
    const colsPerRow = values.cols_per_row || 4;

    for (let i = 0; i < values.count; i++) {
      beds.push({
        ward_id: wardId,
        bed_number: `${values.prefix}${values.start_number + i}`,
        bed_type: values.bed_type || "General",
        position_row: row,
        position_col: col,
        status: "available" as const,
      });

      col++;
      if (col > colsPerRow) {
        col = 1;
        row++;
      }
    }

    bulkCreateBeds(beds, {
      onSuccess: () => {
        bulkForm.reset();
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Beds to {wardName || "Ward"}</DialogTitle>
          <DialogDescription>
            Create new beds individually or in bulk with automatic numbering.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant={mode === "single" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("single")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Single Bed
          </Button>
          <Button
            type="button"
            variant={mode === "bulk" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("bulk")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Bulk Add
          </Button>
        </div>

        {mode === "single" ? (
          <Form {...singleForm}>
            <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)} className="space-y-4">
              <FormField
                control={singleForm.control}
                name="bed_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., B1, ICU-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={singleForm.control}
                name="bed_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BED_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={singleForm.control}
                  name="position_row"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Row Position</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={singleForm.control}
                  name="position_col"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Column Position</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add Bed"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(handleBulkSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={bulkForm.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix *</FormLabel>
                      <FormControl>
                        <Input placeholder="B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bulkForm.control}
                  name="start_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start #</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bulkForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={bulkForm.control}
                name="bed_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BED_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Grid Layout (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bulkForm.control}
                    name="start_row"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Row</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bulkForm.control}
                    name="cols_per_row"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beds Per Row</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={10} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Preview: Will create beds{" "}
                  <strong>
                    {bulkForm.watch("prefix")}
                    {bulkForm.watch("start_number")}
                  </strong>{" "}
                  through{" "}
                  <strong>
                    {bulkForm.watch("prefix")}
                    {bulkForm.watch("start_number") + bulkForm.watch("count") - 1}
                  </strong>
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isBulkCreating}>
                  {isBulkCreating ? "Creating..." : `Create ${bulkForm.watch("count")} Beds`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
