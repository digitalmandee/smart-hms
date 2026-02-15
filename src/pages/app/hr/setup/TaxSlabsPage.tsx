import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaxSlabs, useCreateTaxSlab, useUpdateTaxSlab, useDeleteTaxSlab } from "@/hooks/usePayroll";
import { Plus, Pencil, Trash2, Calculator, Percent, Info } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { toast } from "sonner";

interface TaxSlabForm {
  name: string;
  min_income: number;
  max_income: number | null;
  tax_rate: number;
  fixed_amount: number;
  fiscal_year: string;
  is_active: boolean;
}

const currentYear = new Date().getFullYear();
const defaultForm: TaxSlabForm = {
  name: "",
  min_income: 0,
  max_income: null,
  tax_rate: 0,
  fixed_amount: 0,
  fiscal_year: `${currentYear}-${currentYear + 1}`,
  is_active: true,
};

const fiscalYears = [
  `${currentYear}-${currentYear + 1}`,
  `${currentYear - 1}-${currentYear}`,
  `${currentYear - 2}-${currentYear - 1}`,
];

export default function TaxSlabsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaxSlabForm>(defaultForm);
  const [selectedYear, setSelectedYear] = useState(fiscalYears[0]);

  const { data: taxSlabs, isLoading } = useTaxSlabs(selectedYear);
  const createMutation = useCreateTaxSlab();
  const updateMutation = useUpdateTaxSlab();
  const deleteMutation = useDeleteTaxSlab();

  const activeSlabs = taxSlabs?.filter(s => s.is_active) || [];

  const handleOpenDialog = (slab?: any) => {
    if (slab) {
      setEditingId(slab.id);
      setFormData({
        name: slab.name,
        min_income: slab.min_income,
        max_income: slab.max_income,
        tax_rate: slab.tax_rate,
        fixed_amount: slab.fixed_amount || 0,
        fiscal_year: slab.fiscal_year,
        is_active: slab.is_active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({ ...defaultForm, fiscal_year: selectedYear });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Slab name is required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Tax slab updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Tax slab created successfully");
      }
      setDialogOpen(false);
      setFormData(defaultForm);
    } catch (error) {
      toast.error("Failed to save tax slab");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tax slab?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Tax slab deleted successfully");
      } catch (error) {
        toast.error("Failed to delete tax slab");
      }
    }
  };

  const { formatCurrency, currencySymbol } = useCurrencyFormatter();

  const calculateTax = (income: number) => {
    let totalTax = 0;
    const sortedSlabs = [...(taxSlabs || [])].sort((a, b) => a.min_income - b.min_income);
    
    for (const slab of sortedSlabs) {
      if (!slab.is_active) continue;
      if (income <= slab.min_income) break;
      
      const taxableInSlab = slab.max_income 
        ? Math.min(income, slab.max_income) - slab.min_income
        : income - slab.min_income;
      
      if (taxableInSlab > 0) {
        totalTax += (slab.fixed_tax || 0) + (taxableInSlab * (slab.tax_percentage / 100));
      }
    }
    
    return totalTax;
  };

  // Sample tax calculation for preview
  const sampleIncomes = [50000, 100000, 200000, 500000, 1000000];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Slabs</h1>
          <p className="text-muted-foreground">Configure income tax brackets for payroll calculation</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Slab
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Tax Slabs</p>
                <p className="text-2xl font-bold">{activeSlabs.length}</p>
                <p className="text-xs text-muted-foreground">For {selectedYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Tax Rate</p>
                <p className="text-2xl font-bold">
                  {Math.max(...(activeSlabs.map(s => s.tax_percentage) || [0]))}%
                </p>
                <p className="text-xs text-muted-foreground">Highest bracket</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Slabs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Slabs - {selectedYear}</CardTitle>
          <CardDescription>Income tax brackets for payroll deduction</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Min Income</TableHead>
                <TableHead>Max Income</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Fixed Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxSlabs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tax slabs configured for {selectedYear}. Add your first slab to get started.
                  </TableCell>
                </TableRow>
              ) : (
                taxSlabs?.sort((a, b) => a.min_income - b.min_income).map((slab) => (
                  <TableRow key={slab.id}>
                    <TableCell>{formatCurrency(slab.min_income)}</TableCell>
                    <TableCell>
                      {slab.max_income ? formatCurrency(slab.max_income) : "No limit"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Percent className="h-3 w-3 mr-1" />
                        {slab.tax_percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(slab.fixed_tax || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={slab.is_active ? "default" : "secondary"}>
                        {slab.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(slab.id)}>
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

      {/* Tax Calculator Preview */}
      {activeSlabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tax Calculator Preview
            </CardTitle>
            <CardDescription>Sample tax calculations based on current slabs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sampleIncomes.map(income => (
                <div key={income} className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="font-semibold">{formatCurrency(income)}</p>
                  <div className="h-px bg-border my-2" />
                  <p className="text-sm text-muted-foreground">Tax Payable</p>
                  <p className="font-bold text-primary">{formatCurrency(calculateTax(income))}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Tax Slab" : "Add Tax Slab"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the tax slab details" : "Create a new income tax bracket"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Slab Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`e.g., 0% - Up to ${currencySymbol} 50,000`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Income ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={formData.min_income}
                  onChange={(e) => setFormData({ ...formData, min_income: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Income ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={formData.max_income || ""}
                  onChange={(e) => setFormData({ ...formData, max_income: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Fixed Amount ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={formData.fixed_amount}
                  onChange={(e) => setFormData({ ...formData, fixed_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Select
                value={formData.fiscal_year}
                onValueChange={(v) => setFormData({ ...formData, fiscal_year: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>Active</Label>
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
