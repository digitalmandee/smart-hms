import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useWards, useCreateWard, useUpdateWard } from "@/hooks/useIPD";
import { useAuth } from "@/contexts/AuthContext";
import { Save } from "lucide-react";
import { toast } from "sonner";

// Ward types matching database enum: general, semi_private, private, deluxe, vip, icu, nicu, picu, ccu, isolation, emergency, maternity, pediatric, surgical
const wardFormSchema = z.object({
  name: z.string().min(1, "Ward name is required"),
  code: z.string().min(1, "Ward code is required"),
  ward_type: z.enum([
    "general", "semi_private", "private", "deluxe", "vip",
    "icu", "nicu", "picu", "ccu", "isolation", "emergency",
    "maternity", "pediatric", "surgical"
  ]),
  total_beds: z.coerce.number().min(1, "Must have at least 1 bed"),
  building: z.string().optional(),
  floor: z.string().optional(),
  room_section: z.string().optional(),
  contact_extension: z.string().optional(),
  is_active: z.boolean().default(true),
  auto_create_beds: z.boolean().default(false),
});

type WardFormValues = z.infer<typeof wardFormSchema>;

const wardTypes = [
  { value: "general", label: "General Ward" },
  { value: "semi_private", label: "Semi-Private" },
  { value: "private", label: "Private" },
  { value: "deluxe", label: "Deluxe" },
  { value: "vip", label: "VIP" },
  { value: "icu", label: "ICU" },
  { value: "nicu", label: "NICU" },
  { value: "picu", label: "PICU" },
  { value: "ccu", label: "CCU" },
  { value: "isolation", label: "Isolation" },
  { value: "emergency", label: "Emergency" },
  { value: "maternity", label: "Maternity" },
  { value: "pediatric", label: "Pediatric" },
  { value: "surgical", label: "Surgical" },
];

export default function WardFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const { data: wards } = useWards();
  const { mutateAsync: createWard, isPending: isCreatingWard } = useCreateWard();
  const { mutateAsync: updateWard, isPending: isUpdatingWard } = useUpdateWard();
  const isEditing = Boolean(id);

  const form = useForm<WardFormValues>({
    resolver: zodResolver(wardFormSchema),
    defaultValues: {
      name: "",
      code: "",
      ward_type: "general",
      total_beds: 10,
      building: "",
      floor: "",
      room_section: "",
      contact_extension: "",
      is_active: true,
      auto_create_beds: false,
    },
  });

  useEffect(() => {
    if (isEditing && wards) {
      const ward = wards.find((w) => w.id === id);
      if (ward) {
        form.reset({
          name: ward.name,
          code: ward.code,
          ward_type: ward.ward_type as any || "general",
          total_beds: ward.total_beds || 10,
          building: (ward as any).building || "",
          floor: ward.floor || "",
          room_section: (ward as any).room_section || "",
          contact_extension: ward.contact_extension || "",
          is_active: ward.is_active ?? true,
          auto_create_beds: false,
        });
      }
    }
  }, [isEditing, id, wards, form]);

  const onSubmit = async (values: WardFormValues) => {
    if (!profile?.branch_id) {
      toast.error("Missing branch context");
      return;
    }

    try {
      if (isEditing && id) {
        await updateWard({ 
          id, 
          name: values.name,
          code: values.code,
          ward_type: values.ward_type,
          total_beds: values.total_beds,
          building: values.building,
          floor: values.floor,
          room_section: values.room_section,
          contact_extension: values.contact_extension,
          is_active: values.is_active,
        });
        toast.success("Ward updated successfully");
      } else {
        await createWard({
          name: values.name,
          code: values.code,
          ward_type: values.ward_type,
          branch_id: profile.branch_id,
          building: values.building,
          floor: values.floor,
          room_section: values.room_section,
          total_beds: values.total_beds,
          contact_extension: values.contact_extension,
        });
        toast.success("Ward created successfully");
      }
      navigate("/app/ipd/wards");
    } catch (error) {
      toast.error(isEditing ? "Failed to update ward" : "Failed to create ward");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Ward" : "New Ward"}
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "Wards", href: "/app/ipd/wards" },
          { label: isEditing ? "Edit" : "New Ward" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ward Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., General Ward A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GW-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wardTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="total_beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Beds *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Building, Block A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ground Floor, 2nd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room/Section</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Section A, Wing B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_extension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Extension</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Ward is available for admissions
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/app/ipd/wards")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingWard || isUpdatingWard}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Ward" : "Create Ward"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
