import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, DollarSign, Percent, TrendingUp, Loader2, Pencil } from "lucide-react";
import { useDoctorCompensationPlans, useCreateCompensationPlan, useUpdateCompensationPlan } from "@/hooks/useDoctorCompensation";
import { useDoctors } from "@/hooks/useDoctors";
import { format } from "date-fns";
import { toast } from "sonner";

const PLAN_TYPES = [
  { value: "fixed_salary", label: "Fixed Salary" },
  { value: "per_consultation", label: "Per Consultation" },
  { value: "per_procedure", label: "Per Procedure" },
  { value: "revenue_share", label: "Revenue Share" },
  { value: "hybrid", label: "Hybrid" },
];

export default function DoctorCompensationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    doctor_id: "",
    plan_type: "hybrid" as const,
    base_salary: 0,
    consultation_share_percent: 0,
    procedure_share_percent: 0,
    surgery_share_percent: 0,
    lab_referral_percent: 0,
    minimum_guarantee: 0,
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
    is_active: true,
    notes: "",
  });

  const { data: plans, isLoading } = useDoctorCompensationPlans();
  const { data: doctors } = useDoctors();
  const createPlan = useCreateCompensationPlan();
  const updatePlan = useUpdateCompensationPlan();

  const activePlans = plans?.filter((p) => p.is_active) || [];
  const totalDoctors = new Set(plans?.map((p) => p.doctor_id)).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...formData });
      } else {
        await createPlan.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      doctor_id: "",
      plan_type: "hybrid",
      base_salary: 0,
      consultation_share_percent: 0,
      procedure_share_percent: 0,
      surgery_share_percent: 0,
      lab_referral_percent: 0,
      minimum_guarantee: 0,
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: "",
      is_active: true,
      notes: "",
    });
  };

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      doctor_id: plan.doctor_id,
      plan_type: plan.plan_type,
      base_salary: plan.base_salary || 0,
      consultation_share_percent: plan.consultation_share_percent || 0,
      procedure_share_percent: plan.procedure_share_percent || 0,
      surgery_share_percent: plan.surgery_share_percent || 0,
      lab_referral_percent: plan.lab_referral_percent || 0,
      minimum_guarantee: plan.minimum_guarantee || 0,
      effective_from: plan.effective_from,
      effective_to: plan.effective_to || "",
      is_active: plan.is_active,
      notes: plan.notes || "",
    });
    setIsDialogOpen(true);
  };

  const getPlanTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      fixed_salary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      per_consultation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      per_procedure: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      revenue_share: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      hybrid: "bg-primary/10 text-primary",
    };
    return <Badge className={colors[type] || ""}>{type.replace("_", " ")}</Badge>;
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.employee ? `${doctor.employee.first_name} ${doctor.employee.last_name || ""}` : "Unknown Doctor";
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Doctor Compensation Plans"
        description="Configure revenue share and salary models for doctors"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Doctor Compensation" },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit" : "Create"} Compensation Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor</Label>
                    <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors?.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.employee?.first_name} {doc.employee?.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Select value={formData.plan_type} onValueChange={(v: any) => setFormData({ ...formData, plan_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_TYPES.map((pt) => (
                          <SelectItem key={pt.value} value={pt.value}>
                            {pt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Salary (Rs.)</Label>
                    <Input
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Guarantee (Rs.)</Label>
                    <Input
                      type="number"
                      value={formData.minimum_guarantee}
                      onChange={(e) => setFormData({ ...formData, minimum_guarantee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Consultation Share %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.consultation_share_percent}
                      onChange={(e) => setFormData({ ...formData, consultation_share_percent: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Procedure Share %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.procedure_share_percent}
                      onChange={(e) => setFormData({ ...formData, procedure_share_percent: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Surgery Share %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.surgery_share_percent}
                      onChange={(e) => setFormData({ ...formData, surgery_share_percent: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lab Referral %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.lab_referral_percent}
                      onChange={(e) => setFormData({ ...formData, lab_referral_percent: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Effective From</Label>
                    <Input
                      type="date"
                      value={formData.effective_from}
                      onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective To (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.effective_to}
                      onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this compensation plan"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
                    {(createPlan.isPending || updatePlan.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPlan ? "Update" : "Create"} Plan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{plans?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{activePlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Share</p>
                <p className="text-2xl font-bold">
                  {plans?.filter((p) => p.plan_type === "revenue_share" || p.plan_type === "hybrid").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctors Covered</p>
                <p className="text-2xl font-bold">{totalDoctors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Plan Type</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Consultation %</TableHead>
                <TableHead>Procedure %</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : plans && plans.length > 0 ? (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{getDoctorName(plan.doctor_id)}</TableCell>
                    <TableCell>{getPlanTypeBadge(plan.plan_type)}</TableCell>
                    <TableCell>Rs. {plan.base_salary?.toLocaleString() || 0}</TableCell>
                    <TableCell>{plan.consultation_share_percent || 0}%</TableCell>
                    <TableCell>{plan.procedure_share_percent || 0}%</TableCell>
                    <TableCell>{format(new Date(plan.effective_from), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No compensation plans configured yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
