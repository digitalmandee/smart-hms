import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateDietChart, DIET_TYPES } from "@/hooks/useDietCharts";
import { UtensilsCrossed } from "lucide-react";

const schema = z.object({
  diet_type: z.string().min(1, "Diet type is required"),
  custom_diet: z.string().optional(),
  restrictions: z.string().optional(),
  allergies: z.string().optional(),
  preferences: z.string().optional(),
  calories_target: z.coerce.number().optional(),
  protein_target: z.coerce.number().optional(),
  carbs_target: z.coerce.number().optional(),
  fat_target: z.coerce.number().optional(),
  fluid_restriction_ml: z.coerce.number().optional(),
  special_instructions: z.string().optional(),
  effective_from: z.string(),
  effective_to: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DIET_TYPE_LABELS: Record<string, string> = {
  normal: "Normal / Regular",
  soft: "Soft Diet",
  liquid: "Full Liquid",
  clear_liquid: "Clear Liquid",
  npo: "NPO (Nothing By Mouth)",
  diabetic: "Diabetic Diet",
  renal: "Renal Diet",
  cardiac: "Cardiac Diet",
  low_sodium: "Low Sodium",
  high_protein: "High Protein",
  low_fat: "Low Fat",
  bland: "Bland Diet",
  pureed: "Pureed",
  tube_feeding: "Tube Feeding",
  custom: "Custom Diet",
};

interface DietChartFormProps {
  admissionId: string;
  patientAllergies?: string[];
  onSuccess?: () => void;
}

export function DietChartForm({ admissionId, patientAllergies = [], onSuccess }: DietChartFormProps) {
  const { mutate: createDietChart, isPending } = useCreateDietChart();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      diet_type: "",
      custom_diet: "",
      restrictions: "",
      allergies: patientAllergies.join(", "),
      preferences: "",
      calories_target: undefined,
      protein_target: undefined,
      carbs_target: undefined,
      fat_target: undefined,
      fluid_restriction_ml: undefined,
      special_instructions: "",
      effective_from: format(new Date(), "yyyy-MM-dd"),
      effective_to: "",
    },
  });

  const dietType = form.watch("diet_type");

  const onSubmit = (values: FormValues) => {
    createDietChart(
      {
        admission_id: admissionId,
        diet_type: values.diet_type,
        custom_diet: values.custom_diet || undefined,
        restrictions: values.restrictions || undefined,
        allergies: values.allergies || undefined,
        preferences: values.preferences || undefined,
        calories_target: values.calories_target,
        protein_target: values.protein_target,
        carbs_target: values.carbs_target,
        fat_target: values.fat_target,
        fluid_restriction_ml: values.fluid_restriction_ml,
        special_instructions: values.special_instructions || undefined,
        effective_from: values.effective_from,
        effective_to: values.effective_to || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          New Diet Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="diet_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diet Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select diet type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {DIET_TYPE_LABELS[type] || type}
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
                name="fluid_restriction_ml"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fluid Restriction (ml/day)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {dietType === "custom" && (
              <FormField
                control={form.control}
                name="custom_diet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Diet Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the custom diet plan..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="calories_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbs_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fat_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="65" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Allergies</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Peanuts, Shellfish" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any dietary restrictions..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Preferences</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vegetarian, No spicy food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional instructions for kitchen/nursing staff..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create Diet Chart"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
