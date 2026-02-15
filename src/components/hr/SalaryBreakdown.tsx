import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface SalaryComponent {
  name: string;
  amount: number;
  type: "earning" | "deduction";
  isPercentage?: boolean;
  percentage?: number;
}

interface SalaryBreakdownProps {
  basicSalary: number;
  components: SalaryComponent[];
  showCard?: boolean;
  compact?: boolean;
}

export function SalaryBreakdown({
  basicSalary,
  components,
  showCard = true,
  compact = false,
}: SalaryBreakdownProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const earnings = components.filter((c) => c.type === "earning");
  const deductions = components.filter((c) => c.type === "deduction");

  const totalEarnings = basicSalary + earnings.reduce((sum, c) => sum + c.amount, 0);
  const totalDeductions = deductions.reduce((sum, c) => sum + c.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const content = (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {/* Earnings */}
      <div>
        <h4 className={cn("font-medium text-green-700 mb-2", compact && "text-sm mb-1")}>
          Earnings
        </h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Basic Salary</span>
            <span className="font-medium">{formatCurrency(basicSalary)}</span>
          </div>
          {earnings.map((component, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {component.name}
                {component.isPercentage && component.percentage && (
                  <span className="text-xs ml-1">({component.percentage}%)</span>
                )}
              </span>
              <span>{formatCurrency(component.amount)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between text-sm font-medium">
            <span>Gross Salary</span>
            <span className="text-green-700">{formatCurrency(totalEarnings)}</span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      {deductions.length > 0 && (
        <div>
          <h4 className={cn("font-medium text-red-700 mb-2", compact && "text-sm mb-1")}>
            Deductions
          </h4>
          <div className="space-y-1">
            {deductions.map((component, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {component.name}
                  {component.isPercentage && component.percentage && (
                    <span className="text-xs ml-1">({component.percentage}%)</span>
                  )}
                </span>
                <span className="text-red-600">-{formatCurrency(component.amount)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total Deductions</span>
              <span className="text-red-700">-{formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Net Salary */}
      <Separator />
      <div className="flex justify-between items-center">
        <span className="font-semibold">Net Salary</span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(netSalary)}
        </span>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Salary Breakdown</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
