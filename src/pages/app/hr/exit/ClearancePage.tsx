import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useResignations, useEmployeeClearance, useUpdateClearanceItem, useCreateClearanceItems } from "@/hooks/useExitManagement";
import { useEmployees } from "@/hooks/useHR";
import { Check, X, Plus, AlertCircle, Building2, Laptop, DollarSign, Users, UserCog } from "lucide-react";
import { format } from "date-fns";

const DEPARTMENTS = [
  { id: "it", name: "IT Department", icon: Laptop },
  { id: "finance", name: "Finance", icon: DollarSign },
  { id: "hr", name: "Human Resources", icon: Users },
  { id: "admin", name: "Administration", icon: Building2 },
  { id: "dept_head", name: "Department Head", icon: UserCog },
];

const DEFAULT_CLEARANCE_ITEMS = {
  it: ["Laptop/Computer Returned", "Email Account Deactivated", "Access Cards Collected", "Software Licenses Revoked"],
  finance: ["Pending Advances Cleared", "Company Credit Card Returned", "Expense Claims Settled", "Asset Register Updated"],
  hr: ["ID Card Returned", "Exit Interview Completed", "Resignation Letter on File", "Full & Final Settlement Processed"],
  admin: ["Keys Returned", "Parking Card Returned", "Locker Cleared", "Company Property Returned"],
  dept_head: ["Knowledge Transfer Complete", "Projects Handed Over", "Documentation Updated", "Team Notified"],
};

export default function ClearancePage() {
  const [selectedResignation, setSelectedResignation] = useState<string>("");
  const [isInitDialogOpen, setIsInitDialogOpen] = useState(false);
  
  const { data: resignations, isLoading: resignationsLoading } = useResignations("accepted");
  const { data: employees } = useEmployees();
  const { data: clearanceItems, isLoading: clearanceLoading } = useEmployeeClearance(selectedResignation || undefined);
  const updateClearance = useUpdateClearanceItem();
  const createClearance = useCreateClearanceItems();

  const getEmployeeName = (employeeId: string) => {
    const emp = employees?.find((e) => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const handleInitClearance = async () => {
    if (!selectedResignation) return;
    
    const items: Array<{ department: string; item_description: string }> = [];
    Object.entries(DEFAULT_CLEARANCE_ITEMS).forEach(([dept, deptItems]) => {
      deptItems.forEach((item) => {
        items.push({ department: dept, item_description: item });
      });
    });
    
    await createClearance.mutateAsync({ resignationId: selectedResignation, items });
    setIsInitDialogOpen(false);
  };

  const handleToggleClearance = async (itemId: string, currentStatus: boolean) => {
    await updateClearance.mutateAsync({ id: itemId, is_cleared: !currentStatus });
  };

  const handleUpdateRemarks = async (itemId: string, remarks: string) => {
    await updateClearance.mutateAsync({ id: itemId, remarks });
  };

  const handleUpdateRecovery = async (itemId: string, amount: number) => {
    await updateClearance.mutateAsync({ id: itemId, recovery_amount: amount });
  };

  const selectedResignationData = resignations?.find((r) => r.id === selectedResignation);
  const groupedItems = clearanceItems?.reduce((acc, item) => {
    if (!acc[item.department]) acc[item.department] = [];
    acc[item.department].push(item);
    return acc;
  }, {} as Record<string, typeof clearanceItems>);

  const completedCount = clearanceItems?.filter((i) => i.is_cleared).length || 0;
  const totalCount = clearanceItems?.length || 0;
  const totalRecovery = clearanceItems?.reduce((sum, i) => sum + (i.recovery_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Clearance"
        description="Manage department-wise clearance for exiting employees"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Exit Management" },
          { label: "Clearance" },
        ]}
      />

      {/* Resignation Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Resignation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedResignation} onValueChange={setSelectedResignation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an accepted resignation..." />
                </SelectTrigger>
                <SelectContent>
                  {resignations?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {getEmployeeName(r.employee_id)} - LWD: {format(new Date(r.last_working_date), "dd MMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedResignation && !clearanceItems?.length && (
              <Button onClick={() => setIsInitDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Initialize Clearance
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {selectedResignation && clearanceItems && clearanceItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{completedCount}/{totalCount}</div>
              <p className="text-muted-foreground text-sm">Items Cleared</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round((completedCount / totalCount) * 100)}%
              </div>
              <p className="text-muted-foreground text-sm">Completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">Rs. {totalRecovery.toLocaleString()}</div>
              <p className="text-muted-foreground text-sm">Total Recovery</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department-wise Clearance */}
      {resignationsLoading || clearanceLoading ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ) : selectedResignation && groupedItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DEPARTMENTS.map((dept) => {
            const items = groupedItems[dept.id] || [];
            const completed = items.filter((i) => i.is_cleared).length;
            const Icon = dept.icon;

            return (
              <Card key={dept.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{dept.name}</CardTitle>
                  </div>
                  <Badge variant={completed === items.length ? "default" : "secondary"}>
                    {completed}/{items.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                          checked={item.is_cleared}
                          onCheckedChange={() => handleToggleClearance(item.id, item.is_cleared)}
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.is_cleared ? "line-through text-muted-foreground" : ""}`}>
                            {item.item_description}
                          </p>
                          {item.is_cleared && item.cleared_at && (
                            <p className="text-xs text-muted-foreground">
                              Cleared on {format(new Date(item.cleared_at), "dd MMM yyyy")}
                            </p>
                          )}
                        </div>
                        <Input
                          type="number"
                          placeholder="Recovery"
                          className="w-24 h-8 text-xs"
                          value={item.recovery_amount || ""}
                          onChange={(e) => handleUpdateRecovery(item.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : selectedResignation ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No clearance items found. Click "Initialize Clearance" to start.</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Initialize Dialog */}
      <Dialog open={isInitDialogOpen} onOpenChange={setIsInitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Clearance Process</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will create standard clearance items for all departments for{" "}
            <strong>{selectedResignationData && getEmployeeName(selectedResignationData.employee_id)}</strong>.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInitClearance} disabled={createClearance.isPending}>
              Initialize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
