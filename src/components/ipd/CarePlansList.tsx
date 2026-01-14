import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCarePlans, useUpdateCarePlan, CARE_PLAN_STATUSES } from "@/hooks/useNursingCare";
import { ClipboardList, Plus, Edit, Target } from "lucide-react";
import { CarePlanBuilder } from "./CarePlanBuilder";

interface CarePlansListProps {
  admissionId: string;
}

export function CarePlansList({ admissionId }: CarePlansListProps) {
  const { data: carePlans = [], isLoading } = useCarePlans(admissionId);
  const { mutate: updateCarePlan } = useUpdateCarePlan();
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "on hold":
        return "outline";
      case "discontinued":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case "1":
        return { label: "Critical", color: "bg-destructive text-destructive-foreground" };
      case "2":
        return { label: "High", color: "bg-orange-500 text-white" };
      case "3":
        return { label: "Medium", color: "bg-yellow-500 text-white" };
      case "4":
        return { label: "Low", color: "bg-blue-500 text-white" };
      case "5":
        return { label: "Routine", color: "bg-muted text-muted-foreground" };
      default:
        return { label: "Medium", color: "bg-yellow-500 text-white" };
    }
  };

  const handleUpdatePlan = (planId: string) => {
    updateCarePlan(
      { id: planId, status: editStatus, evaluation_criteria: editNotes },
      { onSuccess: () => setEditingPlan(null) }
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading care plans...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Nursing Care Plans
        </h3>
        <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Care Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Care Plan</DialogTitle>
            </DialogHeader>
            <CarePlanBuilder
              admissionId={admissionId}
              onSuccess={() => setShowNewPlan(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {carePlans.length > 0 ? (
        <div className="space-y-4">
          {carePlans.map((plan: any) => {
            const priority = getPriorityLabel(plan.priority);
            return (
              <Card key={plan.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                      <Badge className={priority.color}>{priority.label}</Badge>
                    </div>
                    {plan.target_date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Target: {format(new Date(plan.target_date), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Problem</h4>
                    <p>{plan.problem}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Goals</h4>
                    <p>{plan.goal}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Interventions</h4>
                    <p className="whitespace-pre-line">{plan.interventions}</p>
                  </div>

                  {plan.evaluation && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Evaluation</h4>
                      <p>{plan.evaluation}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(plan.created_at), "MMM d, yyyy")} by{" "}
                      {plan.created_by_profile?.full_name || "Unknown"}
                    </p>
                    <Dialog
                      open={editingPlan === plan.id}
                      onOpenChange={(open) => {
                        if (!open) setEditingPlan(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlan(plan.id);
                            setEditStatus(plan.status || "Active");
                            setEditNotes("");
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Care Plan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CARE_PLAN_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Evaluation Notes</label>
                            <Textarea
                              className="mt-1"
                              placeholder="Add evaluation notes..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                            />
                          </div>
                          <Button onClick={() => handleUpdatePlan(plan.id)}>
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No care plans created yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowNewPlan(true)}
            >
              Create First Care Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
