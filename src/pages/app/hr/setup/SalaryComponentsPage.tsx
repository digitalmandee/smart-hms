import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalaryComponents, useCreateSalaryComponent, useUpdateSalaryComponent, useDeleteSalaryComponent } from "@/hooks/usePayroll";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";

interface SalaryComponentForm {
  name: string;
  code: string;
  component_type: "earning" | "deduction";
  calculation_type: "fixed" | "percentage";
  default_value: number;
  is_taxable: boolean;
  is_active: boolean;
  description: string;
}

const defaultForm: SalaryComponentForm = {
  name: "",
  code: "",
  component_type: "earning",
  calculation_type: "fixed",
  default_value: 0,
  is_taxable: true,
  is_active: true,
  description: "",
};

export default function SalaryComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SalaryComponentForm>(defaultForm);
  const [filter, setFilter] = useState<"all" | "earning" | "deduction">("all");

  const { data: components, isLoading } = useSalaryComponents();
  const createMutation = useCreateSalaryComponent();
  const updateMutation = useUpdateSalaryComponent();
  const deleteMutation = useDeleteSalaryComponent();

  const filteredComponents = components?.filter(c => 
    filter === "all" || c.component_type === filter
  ) || [];

  const earnings = components?.filter(c => c.component_type === "earning") || [];
  const deductions = components?.filter(c => c.component_type === "deduction") || [];

  const handleOpenDialog = (component?: any) => {
    if (component) {
      setEditingId(component.id);
      setFormData({
        name: component.name,
        code: component.code,
        component_type: component.component_type,
        calculation_type: component.calculation_type,
        default_value: component.default_value || 0,
        is_taxable: component.is_taxable ?? true,
        is_active: component.is_active ?? true,
        description: component.description || "",
      });
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData } as any);
        toast.success("Component updated successfully");
      } else {
        await createMutation.mutateAsync(formData as any);
        toast.success("Component created successfully");
      }
      setDialogOpen(false);
      setFormData(defaultForm);
    } catch (error) {
      toast.error("Failed to save component");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this component?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Component deleted successfully");
      } catch (error) {
        toast.error("Failed to delete component");
      }
    }
  };

  const formatValue = (component: any) => {
    if (component.calculation_type === "percentage") {
      return `${component.default_value}%`;
    }
    return `Rs. ${component.default_value?.toLocaleString() || 0}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Salary Components"
        description="Manage earning and deduction components for payroll"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Setup" },
          { label: "Salary Components" },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Earning Components</p>
                <p className="text-2xl font-bold">{earnings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deduction Components</p>
                <p className="text-2xl font-bold">{deductions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Components</p>
                <p className="text-2xl font-bold">{components?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salary Components</CardTitle>
              <CardDescription>All configured earning and deduction types</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="earning">Earnings</TabsTrigger>
                <TabsTrigger value="deduction">Deductions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Default Value</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No components found. Add your first component to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComponents.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">{component.code}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={component.component_type === "earning" ? "default" : "destructive"}>
                        {component.component_type === "earning" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {component.component_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {component.calculation_type === "percentage" ? (
                          <Percent className="h-3 w-3 mr-1" />
                        ) : (
                          <DollarSign className="h-3 w-3 mr-1" />
                        )}
                        {component.calculation_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatValue(component)}</TableCell>
                    <TableCell>
                      <Badge variant={component.is_taxable ? "secondary" : "outline"}>
                        {component.is_taxable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={component.is_active ? "default" : "secondary"}>
                        {component.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(component)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(component.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Component" : "Add Salary Component"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the component details" : "Create a new earning or deduction component"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Salary"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., BASIC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.component_type}
                  onValueChange={(v) => setFormData({ ...formData, component_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earning">Earning</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calculation Type</Label>
                <Select
                  value={formData.calculation_type}
                  onValueChange={(v) => setFormData({ ...formData, calculation_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Default Value {formData.calculation_type === "percentage" ? "(%)" : "(Rs.)"}
              </Label>
              <Input
                type="number"
                value={formData.default_value}
                onChange={(e) => setFormData({ ...formData, default_value: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_taxable}
                  onCheckedChange={(v) => setFormData({ ...formData, is_taxable: v })}
                />
                <Label>Taxable</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
