import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useMedicalHistory, useCreateMedicalHistory, useDeleteMedicalHistory } from "@/hooks/useMedicalHistory";
import { Loader2, Plus, Trash2, AlertTriangle, Pill, Heart, Scissors, Users, Activity } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type MedicalHistoryType = Database["public"]["Enums"]["medical_history_type"];

const HISTORY_TYPES: { value: MedicalHistoryType; label: string; icon: React.ElementType; color: string }[] = [
  { value: "allergy", label: "Allergy", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  { value: "chronic_disease", label: "Chronic Disease", icon: Heart, color: "bg-warning/10 text-warning" },
  { value: "surgery", label: "Surgery", icon: Scissors, color: "bg-info/10 text-info" },
  { value: "medication", label: "Current Medication", icon: Pill, color: "bg-primary/10 text-primary" },
  { value: "family_history", label: "Family History", icon: Users, color: "bg-success/10 text-success" },
];

const historySchema = z.object({
  condition_type: z.enum(["allergy", "chronic_disease", "surgery", "medication", "family_history"]),
  description: z.string().min(2, "Description is required"),
  diagnosed_date: z.string().optional(),
  notes: z.string().optional(),
});

type HistoryFormData = z.infer<typeof historySchema>;

interface MedicalHistorySectionProps {
  patientId: string;
}

export function MedicalHistorySection({ patientId }: MedicalHistorySectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: history, isLoading } = useMedicalHistory(patientId);
  const createHistory = useCreateMedicalHistory();
  const deleteHistory = useDeleteMedicalHistory();

  const form = useForm<HistoryFormData>({
    resolver: zodResolver(historySchema),
    defaultValues: {
      condition_type: "allergy",
      description: "",
      diagnosed_date: "",
      notes: "",
    },
  });

  const onSubmit = async (data: HistoryFormData) => {
    try {
      await createHistory.mutateAsync({
        patient_id: patientId,
        condition_type: data.condition_type,
        description: data.description,
        diagnosed_date: data.diagnosed_date || null,
        notes: data.notes || null,
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = (id: string) => {
    deleteHistory.mutate({ id, patientId });
  };

  const getTypeConfig = (type: MedicalHistoryType) => {
    return HISTORY_TYPES.find((t) => t.value === type) || HISTORY_TYPES[0];
  };

  // Group history by type
  const groupedHistory = history?.reduce((acc, item) => {
    const type = item.condition_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<MedicalHistoryType, typeof history>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Medical History</CardTitle>
          <CardDescription>Allergies, chronic conditions, surgeries, and more</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medical History</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HISTORY_TYPES.map((type) => (
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Penicillin allergy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosed_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosed Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
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
                        <Textarea {...field} placeholder="Additional details..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createHistory.isPending}>
                    {createHistory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Entry
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No medical history recorded</p>
            <p className="text-sm text-muted-foreground">Click "Add Entry" to add allergies, conditions, or surgeries</p>
          </div>
        ) : (
          <div className="space-y-6">
            {HISTORY_TYPES.map((type) => {
              const items = groupedHistory?.[type.value];
              if (!items || items.length === 0) return null;

              const Icon = type.icon;

              return (
                <div key={type.value}>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className={`p-1.5 rounded ${type.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {type.label}
                    <Badge variant="secondary" className="ml-auto">
                      {items.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{item.description}</p>
                          {item.diagnosed_date && (
                            <p className="text-xs text-muted-foreground">
                              Diagnosed: {format(new Date(item.diagnosed_date), "MMM dd, yyyy")}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete Entry"
                          description="Are you sure you want to delete this medical history entry? This action cannot be undone."
                          confirmLabel="Delete"
                          variant="destructive"
                          onConfirm={() => handleDelete(item.id)}
                          isLoading={deleteHistory.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
