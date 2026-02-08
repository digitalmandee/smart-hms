import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateOPDDepartment, useUpdateOPDDepartment, OPDDepartment } from "@/hooks/useOPDDepartments";
import { useDoctors } from "@/hooks/useDoctors";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(10, "Code must be at most 10 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  rooms: z.string().optional(),
  color: z.string().optional(),
  display_order: z.coerce.number().min(0).optional(),
  head_doctor_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OPDDepartmentFormProps {
  department?: OPDDepartment | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#14b8a6", label: "Teal" },
];

export function OPDDepartmentForm({ department, onSuccess, onCancel }: OPDDepartmentFormProps) {
  const createDepartment = useCreateOPDDepartment();
  const updateDepartment = useUpdateOPDDepartment();
  const { data: doctors, isLoading: loadingDoctors } = useDoctors();

  const isEditing = !!department;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department?.name || "",
      code: department?.code || "",
      description: department?.description || "",
      location: department?.location || "",
      rooms: department?.rooms || "",
      color: department?.color || "#3b82f6",
      display_order: department?.display_order || 0,
      head_doctor_id: department?.head_doctor_id || undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && department) {
        await updateDepartment.mutateAsync({
          id: department.id,
          name: data.name,
          code: data.code,
          description: data.description,
          location: data.location,
          rooms: data.rooms,
          color: data.color,
          display_order: data.display_order,
          head_doctor_id: data.head_doctor_id,
        });
      } else {
        await createDepartment.mutateAsync({
          name: data.name,
          code: data.code,
          description: data.description,
          location: data.location,
          rooms: data.rooms,
          color: data.color,
          display_order: data.display_order,
          head_doctor_id: data.head_doctor_id,
        });
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createDepartment.isPending || updateDepartment.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Medicine OPD" {...field} />
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
                <FormLabel>Code *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MED" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </FormControl>
                <FormDescription>
                  Token prefix (e.g., MED-001)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="General medicine, cardiology, gastroenterology..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Ground Floor, East Wing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rooms</FormLabel>
                <FormControl>
                  <Input placeholder="Rooms 1-5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color">
                        {field.value && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: field.value }}
                            />
                            {COLOR_OPTIONS.find(c => c.value === field.value)?.label || "Custom"}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
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
            name="display_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="head_doctor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Head Doctor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select head doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingDoctors ? (
                      <div className="p-2 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      doctors?.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {(doctor as any).profile?.full_name}
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

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
