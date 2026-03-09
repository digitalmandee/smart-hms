import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboardingEmployees, useInitiateOnboarding, useToggleOnboardingStep } from "@/hooks/useOnboarding";
import { useEmployees } from "@/hooks/useHR";
import { useTranslation } from "@/lib/i18n";
import { UserPlus, ClipboardCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const CATEGORY_LABELS: Record<string, string> = {
  documents: "📄 Documents",
  it: "💻 IT Setup",
  logistics: "🏷️ Logistics",
  orientation: "🎯 Orientation",
  probation: "📋 Probation",
  followup: "🔄 Follow-up",
};

export default function OnboardingPage() {
  const { t } = useTranslation();
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const { data: onboardingData, isLoading } = useOnboardingEmployees();
  const { data: employees } = useEmployees();
  const initiate = useInitiateOnboarding();
  const toggleStep = useToggleOnboardingStep();

  const onboardedEmployeeIds = new Set((onboardingData || []).map(d => d.employee?.id));
  const availableEmployees = (employees || []).filter(e => !onboardedEmployeeIds.has(e.id));

  const handleInitiate = async () => {
    if (!selectedEmployee) return;
    await initiate.mutateAsync(selectedEmployee);
    setIsDialogOpen(false);
    setSelectedEmployee("");
  };

  const inProgress = (onboardingData || []).filter(d => d.progress > 0 && d.progress < 100);
  const pending = (onboardingData || []).filter(d => d.progress === 0);
  const completed = (onboardingData || []).filter(d => d.progress === 100);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Employee Onboarding" description="Manage new employee onboarding pipeline" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Onboarding" description="Track and manage new employee onboarding checklists" actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" />Start Onboarding</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Initiate Onboarding</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger><SelectValue placeholder="Select employee..." /></SelectTrigger>
                <SelectContent>
                  {availableEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleInitiate} disabled={!selectedEmployee || initiate.isPending}>
                {initiate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Start Onboarding
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      } />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
            <p className="text-sm text-muted-foreground">Not Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completed.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Pipeline */}
      {(onboardingData || []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No onboarding in progress</p>
            <p className="text-sm">Click "Start Onboarding" to begin onboarding a new employee</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(onboardingData || []).map((item) => {
            const isExpanded = expandedEmployee === item.employee?.id;
            const emp = item.employee;

            return (
              <Card key={emp?.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedEmployee(isExpanded ? null : emp?.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {emp?.first_name} {emp?.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{emp?.employee_number}</p>
                      </div>
                      {emp?.category && (
                        <Badge variant="outline" style={{ borderColor: emp.category.color, color: emp.category.color }}>
                          {emp.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-medium">{item.progress}%</span>
                        <Progress value={item.progress} className="w-32 h-2" />
                      </div>
                      <Badge variant={item.progress === 100 ? "default" : item.progress > 0 ? "secondary" : "outline"}>
                        {item.progress === 100 ? "Completed" : item.progress > 0 ? "In Progress" : "Pending"}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-2">
                      {item.steps.map(step => (
                        <div key={step.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={step.is_completed}
                              onCheckedChange={(checked) => {
                                toggleStep.mutate({ stepId: step.id, isCompleted: !!checked });
                              }}
                            />
                            <div>
                              <span className={`text-sm ${step.is_completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                                {step.step_name}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {CATEGORY_LABELS[step.step_category] || step.step_category}
                              </span>
                            </div>
                          </div>
                          {step.completed_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(step.completed_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
