import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useMedicine } from "@/hooks/useMedicines";
import { useCreateMedicine, useUpdateMedicine, useMedicineCategories } from "@/hooks/usePharmacy";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";
import { useTranslation } from "@/lib/i18n";

type MedicineUnit = Database["public"]["Enums"]["medicine_unit"];

const medicineUnits: MedicineUnit[] = [
  "tablet", "capsule", "syrup", "injection", "cream", 
  "drops", "inhaler", "powder", "gel", "ointment"
];

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  generic_name: z.string().optional(),
  category_id: z.string().optional(),
  manufacturer: z.string().optional(),
  strength: z.string().optional(),
  unit: z.enum(["tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "powder", "gel", "ointment"] as const).optional().nullable(),
  is_active: z.boolean().default(true),
  cost_price: z.coerce.number().min(0).default(0),
  sale_price: z.coerce.number().min(0).default(0),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

export default function MedicineFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const isEditing = !!id;

  const { data: medicine, isLoading: medicineLoading } = useMedicine(id);
  const { data: categories } = useMedicineCategories();
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: { name: "", generic_name: "", category_id: "", manufacturer: "", strength: "", unit: undefined, is_active: true, cost_price: 0, sale_price: 0 },
  });

  const costPrice = useWatch({ control: form.control, name: "cost_price" }) || 0;
  const salePrice = useWatch({ control: form.control, name: "sale_price" }) || 0;
  const profit = salePrice - costPrice;
  const margin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : "0.0";

  useEffect(() => {
    if (medicine) {
      form.reset({
        name: medicine.name, generic_name: medicine.generic_name || "", category_id: medicine.category_id || "",
        manufacturer: medicine.manufacturer || "", strength: medicine.strength || "", unit: medicine.unit || undefined, is_active: medicine.is_active ?? true,
        cost_price: Number(medicine.cost_price) || 0, sale_price: Number(medicine.sale_price) || 0,
      });
    }
  }, [medicine, form]);

  const onSubmit = (data: MedicineFormData) => {
    const unitValue = data.unit as MedicineUnit | null | undefined;
    if (isEditing) {
      updateMedicine.mutate({ id: id!, ...data, category_id: data.category_id || null, unit: unitValue || null, cost_price: data.cost_price, sale_price: data.sale_price }, { onSuccess: () => navigate("/app/pharmacy/medicines") });
    } else {
      createMedicine.mutate({
        name: data.name, organization_id: profile!.organization_id!, generic_name: data.generic_name || null,
        category_id: data.category_id || null, manufacturer: data.manufacturer || null, strength: data.strength || null,
        unit: unitValue || null, is_active: data.is_active ?? true, cost_price: data.cost_price, sale_price: data.sale_price,
      }, { onSuccess: () => navigate("/app/pharmacy/medicines") });
    }
  };

  if (isEditing && medicineLoading) {
    return <div className="space-y-6"><Skeleton className="h-12 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? t('pharmacy.editMedicine' as any) : t('pharmacy.addMedicine' as any)}
        description={isEditing ? t('pharmacy.updateMedicineDetails' as any) : t('pharmacy.addNewMedicineToCatalog' as any)}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy/medicines")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back' as any)}
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.medicineName' as any)} *</FormLabel>
                    <FormControl><Input placeholder="e.g., Paracetamol 500mg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="generic_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.genericName' as any)}</FormLabel>
                    <FormControl><Input placeholder="e.g., Acetaminophen" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.category' as any)}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t('pharmacy.selectCategory' as any)} /></SelectTrigger></FormControl>
                      <SelectContent>{categories?.map((category) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="manufacturer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.manufacturer' as any)}</FormLabel>
                    <FormControl><Input placeholder="e.g., GSK, Pfizer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="strength" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.strength' as any)}</FormLabel>
                    <FormControl><Input placeholder="e.g., 500mg, 10ml" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.unitType' as any)}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t('pharmacy.selectUnit' as any)} /></SelectTrigger></FormControl>
                      <SelectContent>{medicineUnits.map((unit) => (<SelectItem key={unit} value={unit}><span className="capitalize">{unit}</span></SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cost_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.costPrice' as any)}</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sale_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.salePrice' as any)}</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {(costPrice > 0 || salePrice > 0) && (
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('pharmacy.profit' as any)}:</span>{" "}
                    <span className={profit >= 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                      {profit.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant={profit >= 0 ? "default" : "destructive"}>
                    {margin}% {t('pharmacy.profitMargin' as any)}
                  </Badge>
                </div>
              )}

              <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('common.active' as any)}</FormLabel>
                    <FormDescription>{t('pharmacy.inactiveMedicinesHidden' as any)}</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/app/pharmacy/medicines")}>{t('common.cancel' as any)}</Button>
                <Button type="submit" disabled={createMedicine.isPending || updateMedicine.isPending}>
                  {createMedicine.isPending || updateMedicine.isPending ? t('common.saving' as any) : isEditing ? t('pharmacy.updateMedicine' as any) : t('pharmacy.addMedicine' as any)}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
