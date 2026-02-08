import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranchExpenses, EXPENSE_CATEGORY_LABELS, ExpenseCategory } from "@/hooks/useExpenses";
import { RecordExpenseDialog } from "./RecordExpenseDialog";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Receipt, Plus, AlertCircle } from "lucide-react";

interface ExpenseEntryCardProps {
  date?: string;
  billingSessionId?: string;
  showAddButton?: boolean;
}

export function ExpenseEntryCard({
  date,
  billingSessionId,
  showAddButton = true,
}: ExpenseEntryCardProps) {
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const targetDate = date || new Date().toISOString().split('T')[0];
  const { data: expenses, isLoading, refetch } = useBranchExpenses(undefined, targetDate);

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Today's Expenses
              {expenses && expenses.length > 0 && (
                <Badge variant="secondary">{expenses.length}</Badge>
              )}
            </CardTitle>
            {showAddButton && (
              <Button size="sm" variant="outline" onClick={() => setShowRecordDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-mono text-sm">
                        {expense.expense_number}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] || expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.paid_to || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Expenses</span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No expenses recorded today</p>
              {showAddButton && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowRecordDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Record First Expense
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordExpenseDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
        billingSessionId={billingSessionId}
        onSuccess={() => refetch()}
      />
    </>
  );
}
