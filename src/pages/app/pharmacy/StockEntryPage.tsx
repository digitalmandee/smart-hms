import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMedicines } from "@/hooks/useMedicines";
import { useAddStock } from "@/hooks/usePharmacy";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/hooks/useStores";
import { useStoreRacks, useRackAssignments } from "@/hooks/useStoreRacks";
import { RackSelector } from "@/components/pharmacy/RackSelector";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stockSchema = z.object({
  medicine_id: z.string().min(1, "Please select a medicine"),
  batch_number: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0).optional(),
  selling_price: z.coerce.number().min(0).optional(),
  expiry_date: z.string().optional(),
  supplier_name: z.string().optional(),
  reorder_level: z.coerce.number().min(0).optional(),
});

type StockFormData = z.infer<typeof stockSchema>;

export default function StockEntryPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [medicineSearch, setMedicineSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedRackId, setSelectedRackId] = useState<string>("");

  const { data: medicines } = useMedicines(medicineSearch);
  const { data: stores } = useStores(undefined, "pharmacy");
  const { data: rackAssignments } = useRackAssignments();
  const addStock = useAddStock();

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      medicine_id: "",
      batch_number: "",
      quantity: 0,
      unit_price: undefined,
      selling_price: undefined,
      expiry_date: "",
      supplier_name: "",
      reorder_level: 10,
    },
  });

  const medicineId = form.watch("medicine_id");
  const selectedMedicine = medicines?.find((m) => m.id === medicineId);

  // Auto-suggest rack based on existing assignment
  const suggestedAssignment = rackAssignments?.find(
    (a) => a.medicine_id === medicineId && (!selectedStoreId || a.store_id === selectedStoreId)
  );

  // When medicine changes, auto-fill store/rack from assignment
  const prevMedicineIdRef = useState<string>("");
  if (medicineId && medicineId !== prevMedicineIdRef[0]) {
    prevMedicineIdRef[1](medicineId);
    if (suggestedAssignment) {
      if (!selectedStoreId) setSelectedStoreId(suggestedAssignment.store_id);
      setSelectedRackId(suggestedAssignment.rack_id);
    }
  }

  const onSubmit = (data: StockFormData) => {
    if (!profile?.branch_id) {
      return;
    }

    addStock.mutate(
      {
        medicine_id: data.medicine_id,
        branch_id: profile.branch_id,
        batch_number: data.batch_number || null,
        quantity: data.quantity,
        unit_price: data.unit_price || null,
        selling_price: data.selling_price || null,
        expiry_date: data.expiry_date || null,
        supplier_name: data.supplier_name || null,
        reorder_level: data.reorder_level || 10,
        vendor_id: null,
        store_id: selectedStoreId || null,
      },
      {
        onSuccess: () => navigate("/app/pharmacy/inventory"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Stock"
        description="Add new inventory stock for a medicine"
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicine_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Medicine *</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedMedicine?.name || "Select medicine"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search medicine..." 
                            value={medicineSearch}
                            onValueChange={setMedicineSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No medicine found.</CommandEmpty>
                            <CommandGroup>
                              {medicines?.map((medicine) => (
                                <CommandItem
                                  key={medicine.id}
                                  value={medicine.name}
                                  onSelect={() => {
                                    field.onChange(medicine.id);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      medicine.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <p>{medicine.name}</p>
                                    {medicine.generic_name && (
                                      <p className="text-xs text-muted-foreground">
                                        {medicine.generic_name}
                                      </p>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Warehouse</label>
                  <Select value={selectedStoreId || "none"} onValueChange={(v) => { setSelectedStoreId(v === "none" ? "" : v); setSelectedRackId(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No warehouse</SelectItem>
                      {stores?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Rack Location</label>
                  <RackSelector
                    storeId={selectedStoreId || undefined}
                    value={selectedRackId}
                    onChange={setSelectedRackId}
                    placeholder="Select rack (optional)"
                    disabled={!selectedStoreId}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="batch_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., B2026-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selling_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorder_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Pharma Distributors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app/pharmacy/inventory")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addStock.isPending}>
                  {addStock.isPending ? "Adding..." : "Add Stock"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
