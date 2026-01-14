import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWards, useCreateBed, useUpdateBed, BED_TYPES } from "@/hooks/useIPD";
import { useBed, useBulkCreateBeds, BED_FEATURES } from "@/hooks/useBedManagement";
import { ArrowLeft, Bed, Plus, Save } from "lucide-react";

const bedFormSchema = z.object({
  ward_id: z.string().min(1, "Ward is required"),
  bed_number: z.string().min(1, "Bed number is required"),
  bed_type: z.string().optional(),
  position_row: z.coerce.number().min(0).optional(),
  position_col: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  features: z.array(z.string()).optional(),
});

const bulkBedSchema = z.object({
  ward_id: z.string().min(1, "Ward is required"),
  prefix: z.string().min(1, "Prefix is required"),
  start_number: z.coerce.number().min(1, "Start number must be at least 1"),
  count: z.coerce.number().min(1).max(50, "Maximum 50 beds at once"),
  bed_type: z.string().optional(),
  start_row: z.coerce.number().min(1).optional(),
  beds_per_row: z.coerce.number().min(1).max(10).optional(),
});

type BedFormValues = z.infer<typeof bedFormSchema>;
type BulkBedFormValues = z.infer<typeof bulkBedSchema>;

export default function BedFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedWardId = searchParams.get("ward");
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<string>(isEditing ? "single" : "single");

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: bed, isLoading: loadingBed } = useBed(id);
  const { mutate: createBed, isPending: isCreating } = useCreateBed();
  const { mutate: updateBed, isPending: isUpdating } = useUpdateBed();
  const { mutate: bulkCreateBeds, isPending: isBulkCreating } = useBulkCreateBeds();

  const form = useForm<BedFormValues>({
    resolver: zodResolver(bedFormSchema),
    defaultValues: {
      ward_id: preselectedWardId || "",
      bed_number: "",
      bed_type: "",
      position_row: undefined,
      position_col: undefined,
      notes: "",
      features: [],
    },
  });

  const bulkForm = useForm<BulkBedFormValues>({
    resolver: zodResolver(bulkBedSchema),
    defaultValues: {
      ward_id: preselectedWardId || "",
      prefix: "B-",
      start_number: 1,
      count: 10,
      bed_type: "",
      start_row: 1,
      beds_per_row: 5,
    },
  });

  useEffect(() => {
    if (bed) {
      form.reset({
        ward_id: bed.ward_id,
        bed_number: bed.bed_number,
        bed_type: bed.bed_type || "",
        position_row: bed.position_row || undefined,
        position_col: bed.position_col || undefined,
        notes: bed.notes || "",
        features: (bed.features as string[]) || [],
      });
    }
  }, [bed, form]);

  const onSubmit = (data: BedFormValues) => {
    const bedPayload = {
      ward_id: data.ward_id,
      bed_number: data.bed_number,
      bed_type: data.bed_type,
      position_row: data.position_row,
      position_col: data.position_col,
      notes: data.notes,
    };

    if (isEditing) {
      updateBed(
        { id, ...bedPayload },
        { onSuccess: () => navigate("/app/ipd/beds") }
      );
    } else {
      createBed(bedPayload, {
        onSuccess: () => navigate("/app/ipd/beds"),
      });
    }
  };

  const onBulkSubmit = (data: BulkBedFormValues) => {
    const beds: Array<{
      ward_id: string;
      bed_number: string;
      bed_type?: string;
      position_row?: number;
      position_col?: number;
    }> = [];

    for (let i = 0; i < data.count; i++) {
      const number = data.start_number + i;
      const row = data.start_row && data.beds_per_row 
        ? Math.floor(i / data.beds_per_row) + data.start_row 
        : undefined;
      const col = data.beds_per_row 
        ? (i % data.beds_per_row) + 1 
        : undefined;

      beds.push({
        ward_id: data.ward_id,
        bed_number: `${data.prefix}${String(number).padStart(3, "0")}`,
        bed_type: data.bed_type || undefined,
        position_row: row,
        position_col: col,
      });
    }

    bulkCreateBeds(beds, {
      onSuccess: () => navigate("/app/ipd/beds"),
    });
  };

  if (loadingBed) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? `Edit Bed ${bed?.bed_number || ""}` : "Add Beds"}
        description={isEditing ? "Update bed information" : "Add new beds to a ward"}
      />
      
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {!isEditing && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="single">Single Bed</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Create</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Add Single Bed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="ward_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ward *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ward" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(wards || []).map((ward: { id: string; name: string; code: string }) => (
                                  <SelectItem key={ward.id} value={ward.id}>
                                    {ward.name} ({ward.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bed_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bed Number *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., B-001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
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

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="position_row"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Row Position</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" placeholder="Row" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="position_col"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Column Position</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" placeholder="Column" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="features"
                      render={() => (
                        <FormItem>
                          <FormLabel>Bed Features</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {BED_FEATURES.map((feature) => (
                              <FormField
                                key={feature}
                                control={form.control}
                                name="features"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, feature]);
                                          } else {
                                            field.onChange(current.filter((v) => v !== feature));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <Label className="text-sm font-normal capitalize">
                                      {feature.replace(/_/g, " ")}
                                    </Label>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes about the bed" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isCreating ? "Creating..." : "Create Bed"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Bulk Create Beds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...bulkForm}>
                  <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={bulkForm.control}
                        name="ward_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ward *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ward" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(wards || []).map((ward: { id: string; name: string; code: string }) => (
                                  <SelectItem key={ward.id} value={ward.id}>
                                    {ward.name} ({ward.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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

                      <FormField
                        control={bulkForm.control}
                        name="prefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bed Number Prefix *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., B-" />
                            </FormControl>
                            <FormDescription>
                              Beds will be named: {field.value}001, {field.value}002, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={bulkForm.control}
                          name="start_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Number *</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" />
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
                              <FormLabel>Number of Beds *</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" max="50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={bulkForm.control}
                          name="start_row"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Row</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" placeholder="1" />
                              </FormControl>
                              <FormDescription>For bed map layout</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bulkForm.control}
                          name="beds_per_row"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beds Per Row</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" max="10" placeholder="5" />
                              </FormControl>
                              <FormDescription>How many beds per row</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Preview:</strong> This will create {bulkForm.watch("count")} beds numbered from{" "}
                        {bulkForm.watch("prefix")}{String(bulkForm.watch("start_number")).padStart(3, "0")} to{" "}
                        {bulkForm.watch("prefix")}{String(bulkForm.watch("start_number") + bulkForm.watch("count") - 1).padStart(3, "0")}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isBulkCreating}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isBulkCreating ? "Creating..." : `Create ${bulkForm.watch("count")} Beds`}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Mode - Single Form Only */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Edit Bed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ward_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(wards || []).map((ward: { id: string; name: string; code: string }) => (
                              <SelectItem key={ward.id} value={ward.id}>
                                {ward.name} ({ward.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Ward cannot be changed. Use transfer instead.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bed_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bed Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., B-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="position_row"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Row Position</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="Row" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position_col"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Column Position</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="Column" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes about the bed" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
