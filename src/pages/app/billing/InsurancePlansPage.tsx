import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useInsuranceCompanies, useInsurancePlans, useCreateInsurancePlan, useUpdateInsurancePlan } from "@/hooks/useInsurance";
import { Plus, FileText, Search, Edit, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface PlanFormData {
  insurance_company_id: string;
  name: string;
  plan_type: string;
  coverage_percentage: number;
  max_coverage_amount: number;
  copay_amount: number;
  deductible_amount: number;
  is_active: boolean;
}

export default function InsurancePlansPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company');
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const { data: companies } = useInsuranceCompanies();
  const { data: plans, isLoading } = useInsurancePlans(companyId || undefined);
  const createPlan = useCreateInsurancePlan();
  const updatePlan = useUpdateInsurancePlan();

  const { register, handleSubmit, reset, setValue, watch } = useForm<PlanFormData>({
    defaultValues: {
      is_active: true,
      coverage_percentage: 80,
      copay_amount: 0,
      deductible_amount: 0,
      max_coverage_amount: 500000,
    }
  });

  const filteredPlans = plans?.filter(plan =>
    plan.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...data } as any);
        toast.success("Plan updated successfully");
      } else {
        await createPlan.mutateAsync(data as any);
        toast.success("Plan created successfully");
      }
      setIsDialogOpen(false);
      setEditingPlan(null);
      reset();
    } catch (error) {
      toast.error("Failed to save plan");
    }
  };

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan);
    setValue("insurance_company_id", plan.insurance_company_id);
    setValue("name", plan.name);
    setValue("plan_type", plan.plan_type || "individual");
    setValue("coverage_percentage", plan.coverage_percentage || 80);
    setValue("max_coverage_amount", plan.max_coverage_amount || 0);
    setValue("copay_amount", plan.copay_amount || 0);
    setValue("deductible_amount", plan.deductible_amount || 0);
    setValue("is_active", plan.is_active);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "insurance_company",
      header: "Insurance Company",
      cell: ({ row }: any) => (
        <span className="text-muted-foreground">
          {row.original.insurance_company?.name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "plan_type",
      header: "Type",
      cell: ({ row }: any) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.plan_type || "Individual"}
        </Badge>
      ),
    },
    {
      accessorKey: "coverage_percentage",
      header: "Coverage",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Percent className="h-4 w-4 text-muted-foreground" />
          {row.original.coverage_percentage || 0}%
        </div>
      ),
    },
    {
      accessorKey: "max_coverage_amount",
      header: "Max Coverage",
      cell: ({ row }: any) => formatCurrency(row.original.max_coverage_amount || 0),
    },
    {
      accessorKey: "copay_amount",
      header: "Copay",
      cell: ({ row }: any) => formatCurrency(row.original.copay_amount || 0),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditDialog(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Plans"
        description="Manage insurance plans and coverage details"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingPlan(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Insurance Plan" : "Add Insurance Plan"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Insurance Company</Label>
                  <Select
                    value={watch("insurance_company_id")}
                    onValueChange={(value) => setValue("insurance_company_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input {...register("name", { required: true })} placeholder="e.g., Gold Plan" />
                </div>

                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select
                    value={watch("plan_type")}
                    onValueChange={(value) => setValue("plan_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Coverage %</Label>
                    <Input
                      type="number"
                      {...register("coverage_percentage", { valueAsNumber: true })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Coverage</Label>
                    <Input
                      type="number"
                      {...register("max_coverage_amount", { valueAsNumber: true })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Copay Amount</Label>
                    <Input
                      type="number"
                      {...register("copay_amount", { valueAsNumber: true })}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deductible</Label>
                    <Input
                      type="number"
                      {...register("deductible_amount", { valueAsNumber: true })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={watch("is_active")}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
                    {editingPlan ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {companyId && (
              <Button variant="outline" onClick={() => navigate('/app/billing/insurance/plans')}>
                Show All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredPlans || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
