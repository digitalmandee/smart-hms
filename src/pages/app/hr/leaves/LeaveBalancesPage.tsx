import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { useEmployees } from "@/hooks/useHR";
import { useLeaveBalances } from "@/hooks/useLeaves";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeaveBalancesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: leaveBalances, isLoading: balancesLoading } = useLeaveBalances();

  const isLoading = employeesLoading || balancesLoading;

  // Group balances by employee
  const balancesByEmployee = leaveBalances?.reduce((acc, balance) => {
    const empId = balance.employee_id;
    if (!acc[empId]) {
      acc[empId] = [];
    }
    acc[empId].push(balance);
    return acc;
  }, {} as Record<string, typeof leaveBalances>) || {};

  // Filter employees by search
  const filteredEmployees = employees?.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
      emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Balances"
        description="View employee leave balances and entitlements"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Leave Management", href: "/app/hr/leaves" },
          { label: "Leave Balances" },
        ]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Leave Balances
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Entitled</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const empBalances = balancesByEmployee[employee.id] || [];
                  const fullName = `${employee.first_name} ${employee.last_name}`;
                  
                  if (empBalances.length === 0) {
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{fullName}</TableCell>
                        <TableCell>{employee.employee_number || '-'}</TableCell>
                        <TableCell colSpan={5} className="text-muted-foreground text-center">
                          No leave balances configured
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return empBalances.map((balance, idx) => {
                    const entitled = balance.entitled || 0;
                    const used = balance.used || 0;
                    const carriedForward = balance.carried_forward || 0;
                    const remaining = entitled - used + carriedForward;
                    const usagePercent = entitled > 0 ? (used / entitled) * 100 : 0;
                    
                    return (
                      <TableRow key={`${employee.id}-${balance.id}`}>
                        {idx === 0 && (
                          <>
                            <TableCell className="font-medium" rowSpan={empBalances.length}>
                              {fullName}
                            </TableCell>
                            <TableCell rowSpan={empBalances.length}>
                              {employee.employee_number || '-'}
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Badge variant="outline">
                            {balance.leave_type?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{entitled}</TableCell>
                        <TableCell>{used}</TableCell>
                        <TableCell className="font-semibold">{remaining}</TableCell>
                        <TableCell className="w-32">
                          <Progress value={usagePercent} className="h-2" />
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
