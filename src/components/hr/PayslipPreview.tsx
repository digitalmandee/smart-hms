import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PayslipData {
  employee: {
    name: string;
    employeeNumber: string;
    department?: string;
    designation?: string;
  };
  period: {
    month: number;
    year: number;
  };
  earnings: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  workingDays: number;
  daysWorked: number;
  leaveDays: number;
  paymentDate?: string;
  paymentMethod?: string;
}

interface PayslipPreviewProps {
  data: PayslipData;
  organizationName?: string;
}

export function PayslipPreview({ data, organizationName }: PayslipPreviewProps) {
  const monthName = format(new Date(data.period.year, data.period.month - 1), "MMMM yyyy");
  
  const totalEarnings = data.earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = data.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="space-y-1">
          <p className="text-lg font-bold">{organizationName || "Organization"}</p>
          <CardTitle className="text-base">Payslip for {monthName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Employee Name</p>
            <p className="font-medium">{data.employee.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Employee ID</p>
            <p className="font-medium">{data.employee.employeeNumber}</p>
          </div>
          {data.employee.department && (
            <div>
              <p className="text-muted-foreground">Department</p>
              <p className="font-medium">{data.employee.department}</p>
            </div>
          )}
          {data.employee.designation && (
            <div>
              <p className="text-muted-foreground">Designation</p>
              <p className="font-medium">{data.employee.designation}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Attendance Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{data.workingDays}</p>
            <p className="text-xs text-muted-foreground">Working Days</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{data.daysWorked}</p>
            <p className="text-xs text-muted-foreground">Days Worked</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{data.leaveDays}</p>
            <p className="text-xs text-muted-foreground">Leave Days</p>
          </div>
        </div>

        <Separator />

        {/* Earnings & Deductions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div>
            <h4 className="font-medium text-green-700 mb-3">Earnings</h4>
            <div className="space-y-2">
              {data.earnings.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Earnings</span>
                <span className="text-green-700">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="font-medium text-red-700 mb-3">Deductions</h4>
            <div className="space-y-2">
              {data.deductions.length > 0 ? (
                data.deductions.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No deductions</p>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Deductions</span>
                <span className="text-red-700">-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Net Salary */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Net Salary</p>
              {data.paymentDate && (
                <p className="text-xs text-muted-foreground">
                  Paid on {format(new Date(data.paymentDate), "dd MMM yyyy")}
                  {data.paymentMethod && ` via ${data.paymentMethod}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(netSalary)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>This is a computer-generated payslip and does not require a signature.</p>
        </div>
      </CardContent>
    </Card>
  );
}
