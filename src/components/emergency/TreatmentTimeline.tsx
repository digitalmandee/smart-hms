import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useERTreatments, useAddERTreatment, ERTreatmentType } from "@/hooks/useEmergency";
import { format } from "date-fns";
import { 
  Loader2, 
  Plus, 
  Pill, 
  Syringe, 
  FileSearch, 
  Activity, 
  StickyNote,
  Clock
} from "lucide-react";

interface TreatmentTimelineProps {
  erId: string;
}

const treatmentTypeConfig: Record<ERTreatmentType, { icon: any; label: string; color: string }> = {
  medication: { icon: Pill, label: "Medication", color: "bg-blue-500" },
  procedure: { icon: Syringe, label: "Procedure", color: "bg-purple-500" },
  investigation: { icon: FileSearch, label: "Investigation", color: "bg-yellow-500" },
  intervention: { icon: Activity, label: "Intervention", color: "bg-red-500" },
  note: { icon: StickyNote, label: "Note", color: "bg-gray-500" },
};

export const TreatmentTimeline = ({ erId }: TreatmentTimelineProps) => {
  const { data: treatments, isLoading } = useERTreatments(erId);
  const addMutation = useAddERTreatment();
  const [isOpen, setIsOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    treatment_type: "" as ERTreatmentType,
    description: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!newTreatment.treatment_type || !newTreatment.description) return;

    await addMutation.mutateAsync({
      er_id: erId,
      treatment_type: newTreatment.treatment_type,
      description: newTreatment.description,
      notes: newTreatment.notes || null,
    });

    setNewTreatment({ treatment_type: "" as ERTreatmentType, description: "", notes: "" });
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Treatment Timeline</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Treatment Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Type *</label>
                <Select
                  value={newTreatment.treatment_type}
                  onValueChange={(v) => setNewTreatment({ ...newTreatment, treatment_type: v as ERTreatmentType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(treatmentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <Input
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                  placeholder="e.g., IV Normal Saline 1L started"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newTreatment.notes}
                  onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!newTreatment.treatment_type || !newTreatment.description || addMutation.isPending}
                className="w-full"
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {treatments?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No treatments recorded yet
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-4">
              {treatments?.map((treatment) => {
                const config = treatmentTypeConfig[treatment.treatment_type];
                const Icon = config.icon;

                return (
                  <div key={treatment.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full ${config.color} flex items-center justify-center`}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(treatment.treatment_time), "HH:mm")}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{treatment.description}</p>
                          {treatment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {treatment.notes}
                            </p>
                          )}
                        </div>
                        {treatment.performer?.full_name && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {treatment.performer.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
