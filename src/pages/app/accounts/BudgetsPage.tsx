import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Check, Lock, RefreshCw, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiscalYears, useCreateFiscalYear } from "@/hooks/useAccounts";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BudgetsPage() {
  const navigate = useNavigate();
  const [showNewFiscalYear, setShowNewFiscalYear] = useState(false);
  const [newFiscalYear, setNewFiscalYear] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const { data: fiscalYears, isLoading, refetch } = useFiscalYears();
  const createFiscalYear = useCreateFiscalYear();

  const handleCreateFiscalYear = async () => {
    if (!newFiscalYear.name || !newFiscalYear.start_date || !newFiscalYear.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createFiscalYear.mutateAsync(newFiscalYear);
      setShowNewFiscalYear(false);
      setNewFiscalYear({ name: "", start_date: "", end_date: "", is_current: false });
    } catch {
      // Error handled by mutation
    }
  };

  const currentFiscalYear = fiscalYears?.find((fy) => fy.is_current);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets & Fiscal Years"
        description="Manage fiscal year periods and budget allocations"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Budgets & Fiscal Years" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showNewFiscalYear} onOpenChange={setShowNewFiscalYear}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Fiscal Year
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Fiscal Year</DialogTitle>
                  <DialogDescription>
                    Add a new fiscal year period for your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., FY 2025-26"
                      value={newFiscalYear.name}
                      onChange={(e) => setNewFiscalYear({ ...newFiscalYear, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newFiscalYear.start_date}
                        onChange={(e) => setNewFiscalYear({ ...newFiscalYear, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newFiscalYear.end_date}
                        onChange={(e) => setNewFiscalYear({ ...newFiscalYear, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Set as Current</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this the active fiscal year
                      </p>
                    </div>
                    <Switch
                      checked={newFiscalYear.is_current}
                      onCheckedChange={(checked) => setNewFiscalYear({ ...newFiscalYear, is_current: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewFiscalYear(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFiscalYear} disabled={createFiscalYear.isPending}>
                    {createFiscalYear.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Current Fiscal Year Card */}
      {currentFiscalYear && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Current Fiscal Year
                </CardTitle>
                <CardDescription>{currentFiscalYear.name}</CardDescription>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium">
                  {format(new Date(currentFiscalYear.start_date), "dd MMM yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="font-medium">
                  {format(new Date(currentFiscalYear.end_date), "dd MMM yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-600" />
                  Open
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
                <div className="font-medium">
                  {Math.max(0, Math.ceil((new Date(currentFiscalYear.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fiscal Years List */}
      <Card>
        <CardHeader>
          <CardTitle>All Fiscal Years</CardTitle>
          <CardDescription>Manage fiscal year periods</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fiscalYears?.map((fy) => (
                  <TableRow key={fy.id}>
                    <TableCell className="font-medium">{fy.name}</TableCell>
                    <TableCell>{format(new Date(fy.start_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{format(new Date(fy.end_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {fy.is_closed ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Closed
                        </Badge>
                      ) : fy.is_current ? (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Set as Current</DropdownMenuItem>
                          <DropdownMenuItem>View Reports</DropdownMenuItem>
                          {!fy.is_closed && (
                            <DropdownMenuItem className="text-destructive">
                              Close Year
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && fiscalYears?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fiscal years configured. Create your first fiscal year to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Overview (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Budget vs Actual comparison for current fiscal year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Budget management coming soon. Configure budgets for each account category to track spending against targets.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
